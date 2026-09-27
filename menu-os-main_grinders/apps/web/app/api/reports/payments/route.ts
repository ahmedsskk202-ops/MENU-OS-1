import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { parseDateRange } from "@/lib/date-range";
import { getPaymentsReport } from "@/lib/reports";
import { toCsv } from "@/lib/export/csv";
import { buildReportPdf } from "@/lib/export/pdf";
import { checkBranchAccess } from "@/lib/branch-access";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  const format = req.nextUrl.searchParams.get("format") ?? "json";
  const requiredPermission = format === "json" ? PERMISSIONS.REPORTS_VIEW : PERMISSIONS.REPORTS_EXPORT;
  if (!user || !user.permissions.includes(requiredPermission)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return denied;

  let range;
  try {
    range = parseDateRange(req.nextUrl.searchParams);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid date range" }, { status: 400 });
  }

  const report = await getPaymentsReport(branchId, range);
  if (format === "json") return NextResponse.json({ range, report });

  const rows = Object.entries(report.byMethod).map(([method, v]) => ({ method, count: v.count, amount: v.amount, tips: v.tips, verified: v.verified, pending: v.pending }));

  if (format === "csv") {
    const csv = toCsv(
      [
        { key: "method", label: "Method" },
        { key: "count", label: "Count" },
        { key: "amount", label: "Amount" },
        { key: "tips", label: "Tips" },
        { key: "verified", label: "Verified" },
        { key: "pending", label: "Pending" },
      ],
      rows
    );
    return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="payments-report.csv"` } });
  }

  const branch = await prisma.branch.findUnique({ where: { id: branchId }, include: { brand: true } });
  const pdf = await buildReportPdf({
    title: "Payments Report",
    subtitle: `${branch?.brand.name} · ${branch?.name}  —  ${range.from.toDateString()} to ${range.to.toDateString()}`,
    sections: [
      { heading: "Outstanding", kind: "summary", summary: [{ label: "Total outstanding (unpaid)", value: String(report.totalOutstanding) }] },
      { heading: "By Method", kind: "table", table: { columns: ["Method", "Count", "Amount", "Tips", "Verified", "Pending"], rows: rows.map((r) => [r.method, r.count, r.amount, r.tips, r.verified, r.pending]) } },
    ],
  });
  return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="payments-report.pdf"` } });
}
