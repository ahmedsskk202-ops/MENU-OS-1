"use client";

import { useLocale } from "@/lib/LocaleContext";
import { enumLabel } from "@/lib/i18n-admin";
import { useEffect, useState } from "react";
import { useBranch } from "@/lib/BranchContext";
import { useRealtime } from "@/lib/useRealtime";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


export default function WaiterRequestsPage() {
  const { branchId } = useBranch();
  const [requests, setRequests] = useState<any[]>([]);
  const { t } = useLocale();

  async function refresh() {
    if (!branchId) return;
    const res = await fetch(`/api/waiter-requests?branchId=${branchId}`);
    if (res.ok) setRequests((await res.json()).requests);
  }

  useEffect(() => {
    refresh();
  }, [branchId]);

  useRealtime(branchId ? [`branch:${branchId}`] : [], (event) => {
    if (["waiter_request.created", "waiter_request.updated"].includes(event.type)) refresh();
  });

  async function update(id: string, status: string) {
    await fetch(`/api/waiter-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="font-display text-3xl font-semibold mb-8">{t("admin.waiter.title")}</h1>

      <div className="space-y-3">
        {requests.map((r) => {
          const waitMinutes = Math.floor((Date.now() - new Date(r.createdAt).getTime()) / 60000);
          return (
            <Card key={r.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{t("admin.common.table", { label: r.tableSession.table.label })}</span>
                  <Badge tone={r.status === "OPEN" ? "warning" : "accent"}>{enumLabel(t, r.status)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{t(`admin.waiter.type.${r.type}`)}{r.note ? ` — ${r.note}` : ""}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("admin.waiter.waiting", { n: waitMinutes })}{r.assignedTo ? ` · ${r.assignedTo.name}` : ""}</p>
              </div>
              <div className="flex gap-2">
                {r.status === "OPEN" && (
                  <Button size="sm" onClick={() => update(r.id, "ASSIGNED")}>
                    {t("admin.waiter.assignToMe")}
                  </Button>
                )}
                {r.status !== "COMPLETED" && (
                  <Button size="sm" variant="outline" onClick={() => update(r.id, "COMPLETED")}>
                    {t("admin.waiter.complete")}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
        {requests.length === 0 && <p className="text-muted-foreground">{t("admin.waiter.empty")}</p>}
      </div>
    </div>
  );
}
