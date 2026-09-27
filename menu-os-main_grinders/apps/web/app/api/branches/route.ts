import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { getAccessibleBranchIds } from "@/lib/branch-access";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accessibleIds = await getAccessibleBranchIds(user);
  const branches = await prisma.branch.findMany({
    where: { id: { in: accessibleIds } },
    include: { brand: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    branches: branches.map((b) => ({ id: b.id, name: b.name, brandId: b.brand.id, brandName: b.brand.name, currency: b.brand.currency })),
  });
}
