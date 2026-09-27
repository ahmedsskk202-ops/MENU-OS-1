import { prisma } from "./db";

/**
 * A handful of entities (Ingredient, Recipe) are brand-scoped, not
 * branch-scoped, but the outbox/sync system is fundamentally branch-keyed (each
 * branch pushes under its own branch API key). Any branch of the entity's brand works
 * to route the sync event through — the payload itself still carries the real
 * brandId, so nothing about the synced data is branch-specific.
 */
export async function getAnyBranchIdForBrand(brandId: string): Promise<string> {
  const branch = await prisma.branch.findFirstOrThrow({ where: { brandId } });
  return branch.id;
}
