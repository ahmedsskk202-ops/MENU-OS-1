"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UtensilsCrossed, Gamepad2, Receipt, ChevronRight, Clock, Users } from "lucide-react";
import { useTableSession } from "@/lib/useTableSession";
import { useRealtime } from "@/lib/useRealtime";
import { useLocale } from "@/lib/LocaleContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_TONE: Record<string, "neutral" | "accent" | "success" | "warning"> = {
  CREATED: "neutral",
  CONFIRMED: "accent",
  PREPARING: "warning",
  READY: "success",
  DELIVERED: "success",
  PAID: "success",
};

export default function TableHome({ params }: { params: { sessionId: string } }) {
  const { t } = useLocale();
  const { data } = useTableSession();
  const [activeOrders, setActiveOrders] = useState<any[]>([]);

  async function refreshOrders() {
    const res = await fetch("/api/orders/mine");
    if (res.ok) {
      const json = await res.json();
      setActiveOrders(json.orders.filter((o: any) => !["CLOSED", "CANCELLED"].includes(o.status)));
    }
  }

  useEffect(() => {
    refreshOrders();
  }, []);

  useRealtime(data ? [`table-session:${data.tableSessionId}`] : [], (event) => {
    if (event.type === "order.status_changed" || event.type === "order.created") refreshOrders();
  });

  if (!data) return null;

  const base = `/t/${params.sessionId}`;

  return (
    <div className="mx-auto max-w-lg px-5 pt-8">
      <header className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("home.table", { label: data.table.label })}</p>
          <h1 className="font-display text-2xl font-semibold mt-0.5">{data.brand.name}</h1>
        </div>
        <Badge tone="accent">{t("home.session", { n: data.sessionNumber })}</Badge>
      </header>

      {data.participants.length > 1 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 -mt-4 animate-fade-up">
          <Users className="h-3.5 w-3.5" /> {t("home.participants", { n: data.participants.length })}
        </p>
      )}

      {activeOrders.length > 0 && (
        <Link href={`${base}/orders`} className="block mb-6 animate-fade-up">
          <Card className="p-4 flex items-center justify-between hover:border-accent-ink/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/15 flex items-center justify-center">
                <Clock className="h-5 w-5 text-accent-ink" />
              </div>
              <div>
                <p className="font-semibold text-sm">{t("home.orderStatus", { status: t(`orders.step.${activeOrders[0].status.toLowerCase()}`) })}</p>
                <p className="text-xs text-muted-foreground">{t(activeOrders.length > 1 ? "home.activeOrdersPlural" : "home.activeOrders", { n: activeOrders.length })}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
          </Card>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4">
        <HeroAction href={`${base}/menu`} icon={UtensilsCrossed} label={t("home.order.label")} sublabel={t("home.order.sublabel")} primary />
        <HeroAction href={`${base}/play`} icon={Gamepad2} label={t("nav.play")} sublabel={t("home.play.sublabel")} />
        <HeroAction href={`${base}/bill`} icon={Receipt} label={t("home.bill.label")} sublabel={t("home.bill.sublabel")} className="col-span-2" />
      </div>
    </div>
  );
}

function HeroAction({
  href,
  icon: Icon,
  label,
  sublabel,
  primary,
  className,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel: string;
  primary?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={className}>
      <Card
        className={`p-5 h-40 flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-lg transition-all animate-fade-up ${
          primary ? "bg-gradient-to-br from-accent/20 to-transparent border-accent-ink/30" : ""
        }`}
      >
        <Icon className={`h-7 w-7 ${primary ? "text-accent-ink" : "text-foreground"}`} />
        <div>
          <p className="font-display text-lg font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">{sublabel}</p>
        </div>
      </Card>
    </Link>
  );
}
