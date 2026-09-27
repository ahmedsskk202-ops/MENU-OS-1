import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { parseDateRange } from "@/lib/date-range";
import { getRefundsReport } from "@/lib/reports";
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

  const report = await getRefundsReport(branchId, range);
  if (format === "json") return NextResponse.json({ range, report });

  if (format === "csv") {
    const csv = toCsv(
      [
        { key: "id", label: "Refund ID" },
        { key: "orderId", label: "Order ID" },
        { key: "amount", label: "Amount" },
        { key: "reason", label: "Reason" },
        { key: "status", label: "Status" },
        { key: "processedBy", label: "Processed By" },
        { key: "createdAt", label: "Date" },
      ],
      report.refunds
    );
    return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="refunds-report.csv"` } });
  }

  const branch = await prisma.branch.findUnique({ where: { id: branchId }, include: { brand: true } });
  const pdf = await buildReportPdf({
    title: "Refunds Report",
    subtitle: `${branch?.brand.name} · ${branch?.name}  —  ${range.from.toDateString()} to ${range.to.toDateString()}`,
    sections: [
      { heading: "Summary", kind: "summary", summary: [{ label: "Refund count", value: String(report.count) }, { label: "Total refunded", value: String(report.total) }] },
      {
        heading: "Refunds",
        kind: "table",
        table: { columns: ["Order", "Amount", "Reason", "Status", "By"], rows: report.refunds.map((r) => [r.orderId.slice(-6), r.amount, r.reason, r.status, r.processedBy ?? "-"]) },
      },
    ],
  });
  return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="refunds-report.pdf"` } });
}
