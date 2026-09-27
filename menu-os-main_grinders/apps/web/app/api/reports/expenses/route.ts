import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { parseDateRange } from "@/lib/date-range";
import { getExpensesReport } from "@/lib/reports";
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

  const report = await getExpensesReport(branchId, range);
  if (format === "json") return NextResponse.json({ range, report });

  if (format === "csv") {
    const csv = toCsv(
      [
        { key: "category", label: "Category" },
        { key: "amount", label: "Amount" },
        { key: "description", label: "Description" },
        { key: "recordedBy", label: "Recorded By" },
        { key: "createdAt", label: "Date" },
      ],
      report.expenses
    );
    return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="expenses-report.csv"` } });
  }

  const branch = await prisma.branch.findUnique({ where: { id: branchId }, include: { brand: true } });
  const pdf = await buildReportPdf({
    title: "Expenses Report",
    subtitle: `${branch?.brand.name} · ${branch?.name}  —  ${range.from.toDateString()} to ${range.to.toDateString()}`,
    sections: [
      { heading: "Summary", kind: "summary", summary: [{ label: "Expense count", value: String(report.count) }, { label: "Total", value: String(report.total) }] },
      { heading: "By Category", kind: "table", table: { columns: ["Category", "Amount"], rows: Object.entries(report.byCategory) } },
      { heading: "Detail", kind: "table", table: { columns: ["Category", "Amount", "By"], rows: report.expenses.map((e) => [e.category, e.amount, e.recordedBy]) } },
    ],
  });
  return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="expenses-report.pdf"` } });
}
