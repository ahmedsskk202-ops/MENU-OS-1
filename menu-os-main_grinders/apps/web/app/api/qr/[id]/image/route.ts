import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { qrOrigin } from "@/lib/server-origin";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const qr = await prisma.qRCode.findUnique({ where: { id: params.id } });
  if (!qr) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = `${qrOrigin(req.headers)}/r/${qr.token}`;
  const size = Math.min(Math.max(parseInt(req.nextUrl.searchParams.get("size") ?? "480", 10) || 480, 128), 1600);
  const png = await QRCode.toBuffer(url, { width: size, margin: 2, errorCorrectionLevel: "M", color: { dark: "#13131A", light: "#ffffff" } });

  const headers: Record<string, string> = { "Content-Type": "image/png", "Cache-Control": "no-store", "X-QR-Target": url };
  if (req.nextUrl.searchParams.get("download") === "1") {
    headers["Content-Disposition"] = `attachment; filename="${encodeURIComponent(qr.label)}.png"`;
  }
  return new NextResponse(new Uint8Array(png), { headers });
}
