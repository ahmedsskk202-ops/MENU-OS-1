// Custom server: Next.js request handling + Socket.io real-time layer in one process.
// Rationale: keeps local/dev deployment simple (no separate Redis pub/sub needed yet).
// To scale beyond a single instance later, swap the Socket.io adapter for the
// Redis adapter (@socket.io/redis-adapter) — the event contracts below don't change.
const path = require("path");
const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");
const os = require("os");
const dotenv = require("dotenv");
const { createLicenseGuard } = require("./license/guard");

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const dev = process.env.NODE_ENV !== "production";

// The dev build cache (.next) keeps its own compiled copy of the Prisma client. After a
// schema change and `prisma generate` it kept serving the old one ("Unknown argument"
// errors on new columns) until .next was deleted by hand. The generated client's
// fingerprint is stored beside the cache (not inside it — Next empties .next on start),
// and a change clears the cache on start.
if (dev) {
  const fs = require("fs");
  try {
    const client = require.resolve("@menu-os/db/generated/client/index.d.ts");
    const stat = fs.statSync(client);
    const fingerprint = `${stat.size}:${stat.mtimeMs}`;
    const nextDir = path.resolve(__dirname, ".next");
    const stampFile = path.resolve(__dirname, ".prisma-client-stamp");
    const previous = fs.existsSync(stampFile) ? fs.readFileSync(stampFile, "utf8") : null;
    if (previous !== fingerprint) {
      if (fs.existsSync(nextDir)) {
        fs.rmSync(nextDir, { recursive: true, force: true });
        console.log("Prisma client changed since the last build — cleared the .next cache.");
      }
      fs.writeFileSync(stampFile, fingerprint);
    }
  } catch (err) {
    console.warn("Could not check the Prisma client for changes:", err.message);
  }
}
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const lanAddress = (() => {
  const envHost = process.env.HOST;
  if (envHost && envHost !== "0.0.0.0" && envHost !== "::" && envHost !== "localhost") return envHost;

  // Same ranking as pickLanAddress in lib/server-origin.ts: virtual adapters
  // (VirtualBox 192.168.56.x, Hyper-V vEthernet, Docker/WSL) are listed before the
  // Wi-Fi on Windows, and binding to one of them makes the app unreachable from phones.
  const interfaces = os.networkInterfaces?.() ?? {};
  const candidates = [];
  for (const [name, entries] of Object.entries(interfaces)) {
    for (const entry of entries ?? []) {
      if (entry.internal || (entry.family !== "IPv4" && entry.family !== 4)) continue;
      if (entry.address && !entry.address.startsWith("127.")) candidates.push({ name, address: entry.address });
    }
  }
  const score = ({ name, address }) => {
    let s = 0;
    if (/virtualbox|vbox|vmware|vmnet|vethernet|hyper-v|docker|wsl|tailscale|zerotier|loopback|bluetooth/i.test(name)) s -= 10;
    if (address.startsWith("192.168.56.")) s -= 8;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(address)) s -= 3;
    if (address.startsWith("169.254.")) s -= 10;
    if (/wi-?fi|wlan|wireless|wlp|en0/i.test(name)) s += 3;
    if (/^(192\.168\.|10\.)/.test(address)) s += 1;
    return s;
  };
  candidates.sort((a, b) => score(b) - score(a));
  return candidates[0]?.address ?? "0.0.0.0";
})();
const hostname = process.env.HOST ?? lanAddress;
// hostname/port must be passed explicitly, or Next.js falls back to assuming
// port 3000 when building absolute URLs (e.g. NextResponse.redirect targets).
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Nothing runs without a valid Menu OS license (see license/guard.js): unlicensed
// requests are sent to /license, APIs answer 403 LICENSE_REQUIRED, realtime is refused.
const license = createLicenseGuard();

app.prepare().then(() => {
  license.start();
  const httpServer = createServer((req, res) => {
    if (license.handle(req, res)) return;
    handle(req, res);
  });

  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: { origin: "*" },
  });

  io.use((socket, next) => (license.isLicensed() ? next() : next(new Error("LICENSE_REQUIRED"))));

  io.on("connection", (socket) => {
    // Clients join rooms scoped to what they're allowed to see:
    //   branch:<branchId>        -> admin dashboard / KDS / waiter board
    //   table-session:<id>       -> customer devices on one table session
    //   game-session:<id>        -> players in one game session
    socket.on("join", (room) => {
      if (typeof room === "string" && room.length < 200) socket.join(room);
    });
    socket.on("leave", (room) => {
      if (typeof room === "string") socket.leave(room);
    });
  });

  // Expose the io instance to API route handlers via a global, since Next.js
  // API routes and the socket server share this single Node process.
  global.__menuOsIo = io;

  httpServer.listen(port, hostname, () => {
    console.log(`Menu OS running on http://${hostname}:${port}`);
  });
});
