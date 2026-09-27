export type ServerOriginOptions = {
  env?: Record<string, string | undefined>;
  interfaces?: Record<string, Array<{ family?: string; address?: string; internal?: boolean }>>;
  port?: number;
};

export function resolveServerOrigin(options: ServerOriginOptions = {}) {
  const env = options.env ?? process.env;
  const port = options.port ?? Number(env.PORT ?? 3000);

  if (env.LOCAL_ORIGIN) return env.LOCAL_ORIGIN.replace(/\/$/, "");

  const explicitHost = env.HOST;
  if (explicitHost && explicitHost !== "0.0.0.0" && explicitHost !== "::" && explicitHost !== "localhost") {
    return `http://${explicitHost}:${port}`;
  }

  const interfaces = options.interfaces ??
    (typeof require !== "undefined"
      ? (() => {
          try {
            return require("os").networkInterfaces?.() ?? {};
          } catch {
            return {};
          }
        })()
      : {});

  const candidates: { name: string; address: string }[] = [];
  for (const [name, entries] of Object.entries(interfaces)) {
    const networkEntries = Array.isArray(entries) ? entries : [];
    for (const entry of networkEntries) {
      if (!entry || typeof entry !== "object") continue;
      const family = "family" in entry ? entry.family : undefined;
      const address = "address" in entry ? entry.address : undefined;
      const internal = "internal" in entry ? entry.internal : false;
      if (!address || internal) continue;
      if (family && family.toLowerCase() !== "ipv4") continue;
      if (address.startsWith("127.")) continue;
      candidates.push({ name, address });
    }
  }

  const chosen = pickLanAddress(candidates) ?? "127.0.0.1";
  return `http://${chosen}:${port}`;
}

/**
 * The address guests' phones can actually reach, out of every adapter the machine has.
 *
 * "The first non-internal IPv4" is not that on a typical Windows laptop: VirtualBox's
 * host-only adapter (192.168.56.x) and Hyper-V's "vEthernet" switch are listed before
 * the Wi-Fi, so every QR code pointed at an address that exists only inside the laptop.
 * Virtual adapters are ranked last and real Wi-Fi/Ethernet first.
 *
 * apps/web/server.js carries a copy of this (it is plain JS and runs before Next); keep
 * the two in step.
 */
export function pickLanAddress(candidates: { name: string; address: string }[]): string | null {
  const score = ({ name, address }: { name: string; address: string }) => {
    let s = 0;
    if (/virtualbox|vbox|vmware|vmnet|vethernet|hyper-v|docker|wsl|tailscale|zerotier|loopback|bluetooth/i.test(name)) s -= 10;
    if (address.startsWith("192.168.56.")) s -= 8; // VirtualBox host-only default
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(address)) s -= 3; // Hyper-V / Docker / WSL ranges
    if (address.startsWith("169.254.")) s -= 10; // no DHCP lease
    if (/wi-?fi|wlan|wireless|wlp|en0/i.test(name)) s += 3;
    if (/^(192\.168\.|10\.)/.test(address)) s += 1;
    return s;
  };
  if (candidates.length === 0) return null;
  return [...candidates].sort((a, b) => score(b) - score(a))[0].address;
}

/**
 * The origin to print into a QR code, for a request made by a signed-in manager.
 *
 * An explicit QR_BASE_URL (a public domain, say) always wins. Otherwise the address the
 * manager's own browser used to reach this console is the best evidence of an address
 * that works on this network — unless it is localhost, which only works on this
 * machine, in which case the LAN address is worked out as before.
 */
export function qrOrigin(headers: Headers, env: Record<string, string | undefined> = process.env): string {
  if (env.QR_BASE_URL) return env.QR_BASE_URL.replace(/\/$/, "");
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (host && !/^(localhost|127\.|0\.0\.0\.0|\[::1\])/i.test(host)) {
    const proto = headers.get("x-forwarded-proto") ?? "http";
    return `${proto}://${host}`;
  }
  return resolveServerOrigin({ env, port: Number(env.PORT ?? 3000) });
}
