import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";

const bodySchema = z.object({ brandId: z.string(), name: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.MENU_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  let menu = await prisma.menu.findFirst({ where: { brandId: parsed.data.brandId } });
  if (!menu) {
    menu = await prisma.menu.create({ data: { brandId: parsed.data.brandId, name: "Main Menu" } });
  }

  const category = await prisma.category.create({ data: { menuId: menu.id, name: parsed.data.name } });
  return NextResponse.json({ category }, { status: 201 });
}
