import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { parseDateRange } from "@/lib/date-range";
import { getSalesReport } from "@/lib/reports";
import { toCsv } from "@/lib/export/csv";
import { buildReportPdf } from "@/lib/export/pdf";
import { checkBranchAccess } from "@/lib/branch-access";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  const format = req.nextUrl.searchParams.get("format") ?? "json";
  const requiredPermission = format === "json" ? PERMISSIONS.REPORTS_VIEW : PERMISSIONS.REPORTS_EXPORT;
  if (!user || !user.permissions.includes(requiredPermission)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

  const report = await getSalesReport(branchId, range);

  if (format === "json") return NextResponse.json({ range, report });

  const branch = await prisma.branch.findUnique({ where: { id: branchId }, include: { brand: true } });
  const subtitle = `${branch?.brand.name} · ${branch?.name}  —  ${range.from.toDateString()} to ${range.to.toDateString()}`;

  if (format === "csv") {
    const csv = toCsv(
      [
        { key: "date", label: "Date" },
        { key: "orders", label: "Orders" },
        { key: "revenue", label: "Revenue" },
      ],
      report.byDay
    );
    return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="sales-report.csv"` } });
  }

  if (format === "pdf") {
    const pdf = await buildReportPdf({
      title: "Sales Report",
      subtitle,
      sections: [
        {
          heading: "Summary",
          kind: "summary",
          summary: [
            { label: "Orders", value: String(report.ordersCount) },
            { label: "Gross sales", value: String(report.grossSales) },
            { label: "Discounts", value: String(report.discountTotal) },
            { label: "Tax", value: String(report.taxTotal) },
            { label: "Service fee", value: String(report.serviceFeeTotal) },
            { label: "Refunds", value: String(report.refundTotal) },
            { label: "Net sales", value: String(report.netSales) },
            { label: "Average order value", value: String(report.avgOrderValue) },
          ],
        },
        {
          heading: "By Channel",
          kind: "table",
          table: {
            columns: ["Channel", "Orders", "Revenue"],
            rows: Object.entries(report.byType).map(([type, v]) => [type, v.count, v.revenue]),
          },
        },
        {
          heading: "By Day",
          kind: "table",
          table: { columns: ["Date", "Orders", "Revenue"], rows: report.byDay.map((d) => [d.date, d.orders, d.revenue]) },
        },
      ],
    });
    return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="sales-report.pdf"` } });
  }

  return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
}
