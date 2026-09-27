import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { getShiftClosingReport } from "@/lib/reports";
import { buildReportPdf } from "@/lib/export/pdf";
import { prisma } from "@/lib/db";
import { checkBranchAccess } from "@/lib/branch-access";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  const format = req.nextUrl.searchParams.get("format") ?? "json";
  const requiredPermission = format === "json" ? PERMISSIONS.REPORTS_VIEW : PERMISSIONS.REPORTS_EXPORT;
  if (!user || !user.permissions.includes(requiredPermission)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const shiftId = req.nextUrl.searchParams.get("shiftId");
  if (!shiftId) return NextResponse.json({ error: "shiftId is required" }, { status: 400 });

  const shift = await prisma.shift.findUnique({ where: { id: shiftId }, select: { branchId: true } });
  if (!shift) return NextResponse.json({ error: "Shift not found" }, { status: 404 });
  const denied = await checkBranchAccess(user, shift.branchId);
  if (denied) return denied;

  const report = await getShiftClosingReport(shiftId);
  if (format === "json") return NextResponse.json({ report });

  const pdf = await buildReportPdf({
    title: "Shift Closing Report",
    subtitle: `${report.shift.openedBy} → ${report.shift.closedBy ?? "still open"}  —  ${new Date(report.shift.openedAt).toLocaleString()}`,
    sections: [
      {
        heading: "Summary",
        kind: "summary",
        summary: [
          { label: "Orders", value: String(report.ordersCount) },
          { label: "Sales total", value: String(report.salesTotal) },
          { label: "Expenses total", value: String(report.expensesTotal) },
          { label: "Expected cash", value: String(report.expectedCash) },
          { label: "Actual cash", value: report.actualCash != null ? String(report.actualCash) : "—" },
          { label: "Variance", value: report.variance != null ? String(report.variance) : "—" },
        ],
      },
      { heading: "Expenses", kind: "table", table: { columns: ["Category", "Amount", "By"], rows: report.expenses.map((e) => [e.category, e.amount, e.recordedBy]) } },
      { heading: "Cash Movements", kind: "table", table: { columns: ["Type", "Amount", "Reason", "By"], rows: report.movements.map((m) => [m.type, m.amount, m.reason, m.recordedBy]) } },
    ],
  });
  return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="shift-closing.pdf"` } });
}
