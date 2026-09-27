"use client";

import { useLocale } from "@/lib/LocaleContext";
import { enumLabel } from "@/lib/i18n-admin";
import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { useBranch } from "@/lib/BranchContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

const REPORT_TYPES = [
  { key: "sales", label: "admin.reports.sales" },
  { key: "payments", label: "admin.reports.payments" },
  { key: "refunds", label: "admin.reports.refunds" },
  { key: "expenses", label: "admin.reports.expenses" },
  { key: "branch-performance", label: "admin.reports.branchPerformance" },
];

const RANGES = [
  { key: "today", label: "admin.analytics.today" },
  { key: "week", label: "admin.analytics.week" },
  { key: "month", label: "admin.analytics.month" },
];

export default function ReportsPage() {
  const { branchId, currentBranch } = useBranch();
  const [reportType, setReportType] = useState("sales");
  const [range, setRange] = useState("today");
  const [data, setData] = useState<any>(null);
  const { t } = useLocale();

  useEffect(() => {
    if (!branchId) return;
    fetch(`/api/reports/${reportType}?branchId=${branchId}&range=${range}`)
      .then((r) => r.json())
      .then((json) => setData(json.report));
  }, [branchId, reportType, range]);

  function exportUrl(format: "pdf" | "csv") {
    return `/api/reports/${reportType}?branchId=${branchId}&range=${range}&format=${format}`;
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="font-display text-3xl font-semibold mb-8">{t("admin.reports.title")}</h1>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {REPORT_TYPES.map((r) => (
            <button
              key={r.key}
              onClick={() => setReportType(r.key)}
              className={cn("px-3 py-1.5 rounded-full text-sm border", reportType === r.key ? "bg-accent text-accent-foreground border-accent-ink" : "border-border text-muted-foreground")}
            >
              {t(r.label)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={cn("px-3 py-1.5 rounded-full text-sm border", range === r.key ? "bg-accent text-accent-foreground border-accent-ink" : "border-border text-muted-foreground")}
            >
              {t(r.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <a href={exportUrl("pdf")} target="_blank" rel="noreferrer">
          <Button size="sm" variant="outline">
            <FileText className="h-3.5 w-3.5" /> {t("admin.reports.exportPdf")}
          </Button>
        </a>
        <a href={exportUrl("csv")}>
          <Button size="sm" variant="outline">
            <Download className="h-3.5 w-3.5" /> {t("admin.reports.exportCsv")}
          </Button>
        </a>
      </div>

      {!data ? (
        <p className="text-muted-foreground">{t("admin.common.loading")}</p>
      ) : reportType === "sales" ? (
        <SalesReportView data={data} currency={currentBranch?.currency} />
      ) : reportType === "payments" ? (
        <PaymentsReportView data={data} currency={currentBranch?.currency} />
      ) : reportType === "refunds" ? (
        <RefundsReportView data={data} currency={currentBranch?.currency} />
      ) : reportType === "expenses" ? (
        <ExpensesReportView data={data} currency={currentBranch?.currency} />
      ) : (
        <BranchPerformanceView data={data} currency={currentBranch?.currency} />
      )}
    </div>
  );
}

function SalesReportView({ data, currency }: { data: any; currency?: string }) {
  const { t } = useLocale();
  return (
    <div className="grid grid-cols-2 gap-6">
      <Card className="p-6">
        <h2 className="font-semibold mb-4">{t("admin.reports.summary")}</h2>
        <dl className="space-y-2 text-sm">
          <Row label={t("admin.reports.orders")} value={data.ordersCount} />
          <Row label={t("admin.reports.gross")} value={formatMoney(data.grossSales, currency)} />
          <Row label={t("admin.reports.discounts")} value={formatMoney(data.discountTotal, currency)} />
          <Row label={t("admin.reports.tax")} value={formatMoney(data.taxTotal, currency)} />
          <Row label={t("admin.reports.serviceFee")} value={formatMoney(data.serviceFeeTotal, currency)} />
          <Row label={t("admin.reports.refunds")} value={formatMoney(data.refundTotal, currency)} />
          <Row label={t("admin.reports.net")} value={formatMoney(data.netSales, currency)} bold />
          <Row label={t("admin.reports.aov")} value={formatMoney(data.avgOrderValue, currency)} />
        </dl>
      </Card>
      <Card className="p-6">
        <h2 className="font-semibold mb-4">{t("admin.reports.byChannel")}</h2>
        {Object.entries(data.byType).map(([type, v]: any) => (
          <Row key={type} label={enumLabel(t, type)} value={t("admin.reports.ordersAmount", { n: v.count, amount: formatMoney(v.revenue, currency) })} />
        ))}
      </Card>
    </div>
  );
}

function PaymentsReportView({ data, currency }: { data: any; currency?: string }) {
  const { t } = useLocale();
  return (
    <Card className="p-6">
      <h2 className="font-semibold mb-4">{t("admin.reports.byMethod")}</h2>
      {Object.entries(data.byMethod).map(([method, v]: any) => (
        <div key={method} className="flex justify-between py-2 border-b border-border last:border-0 text-sm">
          <span>{enumLabel(t, method)}</span>
          <span>{t("admin.reports.methodLine", { n: v.count, amount: formatMoney(v.amount, currency), tips: formatMoney(v.tips, currency) })}</span>
        </div>
      ))}
      <p className="mt-4 text-sm text-muted-foreground">{t("admin.reports.outstanding", { amount: formatMoney(data.totalOutstanding, currency) })}</p>
    </Card>
  );
}

function RefundsReportView({ data, currency }: { data: any; currency?: string }) {
  const { t } = useLocale();
  return (
    <Card className="p-6">
      <p className="mb-4 text-sm">{t("admin.reports.refundsTotal", { n: data.count, amount: formatMoney(data.total, currency) })}</p>
      {data.refunds.map((r: any) => (
        <div key={r.id} className="flex justify-between py-2 border-b border-border last:border-0 text-sm">
          <span>{r.reason}</span>
          <span>{formatMoney(r.amount, currency)}</span>
        </div>
      ))}
    </Card>
  );
}

function ExpensesReportView({ data, currency }: { data: any; currency?: string }) {
  const { t } = useLocale();
  return (
    <Card className="p-6">
      <p className="mb-4 text-sm">{t("admin.reports.expensesTotal", { n: data.count, amount: formatMoney(data.total, currency) })}</p>
      {Object.entries(data.byCategory).map(([cat, amt]: any) => (
        <div key={cat} className="flex justify-between py-2 border-b border-border last:border-0 text-sm">
          <span>{cat}</span>
          <span>{formatMoney(amt, currency)}</span>
        </div>
      ))}
    </Card>
  );
}

function BranchPerformanceView({ data, currency }: { data: any[]; currency?: string }) {
  const { t } = useLocale();
  return (
    <Card className="p-6">
      {data.map((b) => (
        <div key={b.branchId} className="flex justify-between py-2 border-b border-border last:border-0 text-sm">
          <span>{b.brandName} · {b.branchName}</span>
          <span>{t("admin.reports.ordersAmount", { n: b.ordersCount, amount: formatMoney(b.netSales, currency) })}</span>
        </div>
      ))}
    </Card>
  );
}

function Row({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between", bold && "font-semibold pt-2 border-t border-border")}>
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
