import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { getCashReconciliationReport } from "@/lib/reports";
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

  const report = await getCashReconciliationReport(shiftId);
  if (format === "json") return NextResponse.json({ report });

  const pdf = await buildReportPdf({
    title: "Cash Reconciliation",
    subtitle: `Shift opened by ${report.shift.openedBy} at ${new Date(report.shift.openedAt).toLocaleString()}`,
    sections: [
      {
        heading: "Reconciliation",
        kind: "summary",
        summary: [
          { label: "Opening cash", value: String(report.openingCash) },
          { label: "Cash sales", value: String(report.cashSales) },
          { label: "Cash in", value: String(report.cashIn) },
          { label: "Cash out", value: String(report.cashOut) },
          { label: "Cash refunds", value: String(report.cashRefunds) },
          { label: "Expected cash", value: String(report.expectedCash) },
          { label: "Actual counted cash", value: report.actualCash != null ? String(report.actualCash) : "Not yet closed" },
          { label: "Variance", value: report.variance != null ? String(report.variance) : "—" },
          { label: "Variance reason", value: report.varianceReason ?? "—" },
        ],
      },
      {
        heading: "Cash Movements",
        kind: "table",
        table: { columns: ["Type", "Amount", "Reason", "By"], rows: report.movements.map((m) => [m.type, m.amount, m.reason, m.recordedBy]) },
      },
    ],
  });
  return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="cash-reconciliation.pdf"` } });
}
