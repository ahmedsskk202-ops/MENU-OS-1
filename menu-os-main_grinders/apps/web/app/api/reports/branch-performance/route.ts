import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { parseDateRange } from "@/lib/date-range";
import { getBranchPerformanceReport } from "@/lib/reports";
import { toCsv } from "@/lib/export/csv";
import { buildReportPdf } from "@/lib/export/pdf";
import { getAccessibleBranchIds } from "@/lib/branch-access";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  const format = req.nextUrl.searchParams.get("format") ?? "json";
  const requiredPermission = format === "json" ? PERMISSIONS.REPORTS_VIEW : PERMISSIONS.REPORTS_EXPORT;
  if (!user || !user.permissions.includes(requiredPermission)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let range;
  try {
    range = parseDateRange(req.nextUrl.searchParams);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid date range" }, { status: 400 });
  }

  const requestedIds = req.nextUrl.searchParams.get("branchIds")?.split(",").filter(Boolean);
  const accessibleIds = await getAccessibleBranchIds(user);
  const branchIds = (requestedIds ?? accessibleIds).filter((id) => accessibleIds.includes(id));

  const report = await getBranchPerformanceReport(branchIds, range);
  if (format === "json") return NextResponse.json({ range, report });

  const rows = report.map((r) => ({ branch: `${r.brandName} · ${r.branchName}`, orders: r.ordersCount, grossSales: r.grossSales, refunds: r.refundTotal, netSales: r.netSales, avgOrderValue: r.avgOrderValue }));

  if (format === "csv") {
    const csv = toCsv(
      [
        { key: "branch", label: "Branch" },
        { key: "orders", label: "Orders" },
        { key: "grossSales", label: "Gross Sales" },
        { key: "refunds", label: "Refunds" },
        { key: "netSales", label: "Net Sales" },
        { key: "avgOrderValue", label: "Avg Order Value" },
      ],
      rows
    );
    return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="branch-performance.csv"` } });
  }

  const pdf = await buildReportPdf({
    title: "Branch Performance",
    subtitle: `${range.from.toDateString()} to ${range.to.toDateString()}`,
    sections: [
      {
        heading: "Branches",
        kind: "table",
        table: { columns: ["Branch", "Orders", "Gross", "Refunds", "Net", "Avg Order"], rows: rows.map((r) => [r.branch, r.orders, r.grossSales, r.refunds, r.netSales, r.avgOrderValue]) },
      },
    ],
  });
  return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="branch-performance.pdf"` } });
}
