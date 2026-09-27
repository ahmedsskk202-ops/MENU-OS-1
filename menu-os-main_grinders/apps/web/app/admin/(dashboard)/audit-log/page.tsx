"use client";


import { readJson } from "@menu-os/db";
import { useLocale } from "@/lib/LocaleContext";
import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import { useBranch } from "@/lib/BranchContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AuditLogPage() {
  const { branchId } = useBranch();
  const [logs, setLogs] = useState<any[]>([]);
  const [entityType, setEntityType] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { t } = useLocale();

  useEffect(() => {
    const qs = new URLSearchParams();
    if (branchId) qs.set("branchId", branchId);
    if (entityType) qs.set("entityType", entityType);
    fetch(`/api/audit-log?${qs}`).then((r) => r.json()).then((json) => setLogs(json.logs ?? []));
  }, [branchId, entityType]);

  const entityTypes = Array.from(new Set(logs.map((l) => l.entityType))).sort();

  // The column is JSON text; parse-then-print keeps the expanded row readable, and a
  // malformed or absent value degrades to the same em-dash as an empty snapshot.
  function prettyJson(value: string | null | undefined): string {
    const parsed = readJson(value);
    return parsed === null ? "\u2014" : JSON.stringify(parsed, null, 2);
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="font-display text-3xl font-semibold mb-8">{t("admin.audit.title")}</h1>

      <select value={entityType} onChange={(e) => setEntityType(e.target.value)} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm mb-6">
        <option value="">{t("admin.audit.allTypes")}</option>
        {entityTypes.map((et) => <option key={et} value={et}>{et}</option>)}
      </select>

      <div className="space-y-1.5">
        {logs.map((l) => (
          <Card key={l.id} className="p-3 cursor-pointer" onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScrollText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{l.action}</span>
                <Badge tone="neutral">{l.entityType}</Badge>
              </div>
              <span className="text-xs text-muted-foreground">{l.user?.name ?? t("admin.common.system")} · {new Date(l.createdAt).toLocaleString()}</span>
            </div>
            {expandedId === l.id && (
              <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="font-semibold text-muted-foreground mb-1">{t("admin.audit.before")}</p>
                  {/* beforeJson/afterJson are JSON *text* since the move to SQLite, so they
                      are parsed before re-stringifying for display — otherwise the reader
                      sees one escaped string instead of a readable diff. */}
                  <pre className="whitespace-pre-wrap break-words bg-muted rounded-lg p-2">{prettyJson(l.beforeJson)}</pre>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground mb-1">{t("admin.audit.after")}</p>
                  <pre className="whitespace-pre-wrap break-words bg-muted rounded-lg p-2">{prettyJson(l.afterJson)}</pre>
                </div>
              </div>
            )}
          </Card>
        ))}
        {logs.length === 0 && <p className="text-muted-foreground">{t("admin.audit.empty")}</p>}
      </div>
    </div>
  );
}
