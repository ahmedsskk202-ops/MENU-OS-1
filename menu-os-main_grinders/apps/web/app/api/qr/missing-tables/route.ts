import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { authenticate } from "@/lib/api-guard";
import { PERMISSIONS } from "@/lib/rbac";
import { checkBranchAccess } from "@/lib/branch-access";

/** One click: a QR code for every table of the branch that has no working one. */
export async function POST(req: NextRequest) {
  const auth = await authenticate(PERMISSIONS.QR_MANAGE);
  if (auth.error) return auth.error;
  const parsed = z.object({ branchId: z.string() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  const denied = await checkBranchAccess(auth.user, parsed.data.branchId);
  if (denied) return denied;

  const created = await prisma.$transaction(async (tx) => {
    const tables = await tx.restaurantTable.findMany({
      where: { branchId: parsed.data.branchId, qrCodes: { none: { isActive: true } } },
    });
    const out = [];
    for (const table of tables) {
      out.push(
        await tx.qRCode.create({
          data: {
            branchId: table.branchId,
            type: "TABLE",
            tableId: table.id,
            label: `Table ${table.label}`,
            token: randomBytes(16).toString("hex"),
          },
        })
      );
    }
    return out;
  });

  return NextResponse.json({ created: created.length, qrCodes: created }, { status: 201 });
}
