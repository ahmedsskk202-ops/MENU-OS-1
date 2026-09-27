import type { NextRequest } from "next/server";

/** The origin the browser actually used — what the local simulator's URLs are built from. */
export function requestOrigin(req: NextRequest): string {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? req.nextUrl.host;
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  return `${proto}://${host}`;
}

export function htmlEscape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Minimal standalone page (no app chrome) for the provider hand-off and the simulator. */
export function htmlPage(title: string, body: string, head = "") {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${htmlEscape(title)}</title>${head}<style>body{font-family:system-ui,sans-serif;background:#faf7f2;color:#1f1a14;margin:0;padding:32px 16px;text-align:center}main{max-width:420px;margin:0 auto}button{font:inherit;width:100%;padding:12px;margin-top:10px;border-radius:12px;border:1px solid #d6cfc4;background:#fff;cursor:pointer}button.primary{background:#1f1a14;color:#fff;border-color:#1f1a14}.tag{display:inline-block;background:#b45309;color:#fff;font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px;letter-spacing:.05em}</style></head><body><main>${body}</main></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Frame-Options": "DENY" } }
  );
}
