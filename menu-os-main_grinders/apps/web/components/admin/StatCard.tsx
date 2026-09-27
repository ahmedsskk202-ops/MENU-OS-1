import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "neutral" | "accent";
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", tone === "accent" ? "bg-accent/15 text-accent-ink" : "bg-muted text-muted-foreground")}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="font-display text-2xl font-bold">{value}</p>
      {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
    </Card>
  );
}
