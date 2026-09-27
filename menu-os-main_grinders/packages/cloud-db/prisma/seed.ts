import { PrismaClient } from "../generated/client";
import { randomBytes, createHash } from "crypto";

const prisma = new PrismaClient();

function hashKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

async function main() {
  const branchId = process.env.SEED_BRANCH_ID;
  const tenantId = process.env.SEED_TENANT_ID;
  const name = process.env.SEED_BRANCH_NAME ?? "Branch";
  const brandName = process.env.SEED_BRAND_NAME ?? "Brand";

  if (!branchId || !tenantId) {
    throw new Error("SEED_BRANCH_ID and SEED_TENANT_ID env vars are required");
  }

  const apiKey = `mos_${randomBytes(24).toString("hex")}`;

  await prisma.cloudBranch.upsert({
    where: { id: branchId },
    create: { id: branchId, tenantId, name, brandName, apiKeyHash: hashKey(apiKey) },
    update: { apiKeyHash: hashKey(apiKey) },
  });

  console.log("Cloud branch credential ready.");
  console.log(`  branchId: ${branchId}`);
  console.log(`  API key (save this — only shown once): ${apiKey}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
