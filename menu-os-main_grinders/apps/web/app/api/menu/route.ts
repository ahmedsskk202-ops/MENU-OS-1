import { NextRequest, NextResponse } from "next/server";
import { readStrArray } from "@menu-os/db";
import { prisma } from "@/lib/db";
import { getMenuPromotionBadges } from "@/lib/promotions";
import { getActiveComboOffers } from "@/lib/combos";

export async function GET(req: NextRequest) {
  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });

  const branch = await prisma.branch.findUnique({ where: { id: branchId }, include: { brand: true } });
  if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 });

  const menus = await prisma.menu.findMany({
    where: { brandId: branch.brandId, isActive: true },
    include: {
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          products: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            include: {
              availability: { where: { branchId } },
              modifierGroups: {
                orderBy: { sortOrder: "asc" },
                include: {
                  group: {
                    include: {
                      // sortOrder matters: it keeps a Size group rendering
                      // Small -> Medium -> Large rather than at the DB's whim.
                      options: { where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const [{ productBadges, categoryBadges, wholeOrderOffers }, comboOffers] = await Promise.all([
    getMenuPromotionBadges(branch.brandId, branchId),
    getActiveComboOffers(branch.brandId, branchId),
  ]);

  const shaped = menus.map((menu) => ({
    id: menu.id,
    name: menu.name,
    categories: menu.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      nameAr: cat.nameAr,
      nameEn: cat.nameEn,
      description: cat.description,
      imageUrl: cat.imageUrl,
      products: cat.products.map((p) => ({
        id: p.id,
        categoryId: p.categoryId,
        name: p.name,
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        description: p.description,
        descriptionAr: p.descriptionAr,
        descriptionEn: p.descriptionEn,
        imageUrl: p.imageUrl,
        basePrice: p.basePrice.toNumber(),
        // JSON-encoded text on SQLite; the guest-facing DTO contract is still
        // string arrays, so decode at the route boundary (see readStrArray).
        tags: readStrArray(p.tags),
        allergens: readStrArray(p.allergens),
        calories: p.calories,
        prepTimeMinutes: p.prepTimeMinutes,
        isFeatured: p.isFeatured,
        isPopular: p.isPopular,
        isNew: p.isNew,
        isSeasonal: p.isSeasonal,
        availabilityStatus: p.availability[0]?.status ?? "AVAILABLE",
        promoBadge: productBadges[p.id] ?? categoryBadges[p.categoryId] ?? null,
        modifierGroups: p.modifierGroups.map((pmg) => ({
          id: pmg.group.id,
          name: pmg.group.name,
          nameAr: pmg.group.nameAr,
          nameEn: pmg.group.nameEn,
          isRequired: pmg.group.isRequired,
          minSelect: pmg.group.minSelect,
          maxSelect: pmg.group.maxSelect,
          options: pmg.group.options.map((o) => ({
            id: o.id,
            name: o.name,
            nameAr: o.nameAr,
            nameEn: o.nameEn,
            priceDelta: o.priceDelta.toNumber(),
            isDefault: o.isDefault,
            stockStatus: o.stockStatus,
          })),
        })),
      })),
    })),
  }));

  return NextResponse.json({
    brand: { id: branch.brand.id, name: branch.brand.name, logoUrl: branch.brand.logoUrl, currency: branch.brand.currency, defaultLocale: branch.brand.defaultLocale },
    branch: { id: branch.id, name: branch.name },
    menus: shaped,
    activePromotions: wholeOrderOffers,
    activeCombos: comboOffers,
  });
}
