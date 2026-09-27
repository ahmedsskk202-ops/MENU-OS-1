// One command after any change to packages/db (schema or roles):
//   npm run db:update
// 1. applies the schema to the local SQLite database (prisma db push)
// 2. regenerates the Prisma client (the web app reads it through the
//    node_modules/@menu-os/db junction, so there is nothing to copy)
// 3. re-applies the system roles from packages/db/src/rbac.ts
// The dev server clears its own .next cache on the next start when the client changed.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbDir = path.join(root, "packages", "db");
const bin = (p) => path.join(root, "node_modules", ...p.split("/"));

// Same database the web app uses (apps/web/.env.local), else packages/db/.env's default.
const env = { ...process.env };
const webEnv = path.join(root, "apps", "web", ".env.local");
if (!env.DATABASE_URL && existsSync(webEnv)) {
  const m = readFileSync(webEnv, "utf8").match(/^\s*DATABASE_URL\s*=\s*"?([^"\n]+)"?/m);
  if (m) env.DATABASE_URL = m[1];
}

const run = (label, args) => {
  console.log(`\n▶ ${label}`);
  try {
    execFileSync(process.execPath, args, { cwd: dbDir, env, stdio: ["inherit", "inherit", "pipe"] });
  } catch (err) {
    const stderr = String(err.stderr ?? "");
    process.stderr.write(stderr);
    // Windows keeps the Prisma engine file locked while the app is running.
    if (/EPERM|operation not permitted/i.test(stderr)) {
      console.error("\n✖ The database engine file is in use. Stop the app server (node server.js) and run `npm run db:update` again.");
    } else {
      console.error(`\n✖ ${label} failed.`);
    }
    process.exit(1);
  }
};

run("Applying schema", [bin("prisma/build/index.js"), "db", "push", "--skip-generate"]);
run("Generating Prisma client", [bin("prisma/build/index.js"), "generate"]);
run("Syncing roles", [bin("tsx/dist/cli.mjs"), "prisma/sync-roles.ts"]);
console.log("\n✔ Database updated. Restart the server (node server.js) to pick it up.");
