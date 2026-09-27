import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { checkBranchAccess } from "@/lib/branch-access";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return denied;

  const branch = await prisma.branch.findUniqueOrThrow({ where: { id: branchId } });

  const categories = await prisma.category.findMany({
    where: { menu: { brandId: branch.brandId } },
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        orderBy: { sortOrder: "asc" },
        include: { availability: { where: { branchId } } },
      },
    },
  });

  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      products: c.products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        imageUrl: p.imageUrl,
        basePrice: p.basePrice.toNumber(),
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        isPopular: p.isPopular,
        isNew: p.isNew,
        availabilityStatus: p.availability[0]?.status ?? "AVAILABLE",
      })),
    })),
  });
}

const createSchema = z.object({
  categoryId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  basePrice: z.number().nonnegative(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.MENU_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const product = await prisma.product.create({ data: parsed.data });
  return NextResponse.json({ product }, { status: 201 });
}
