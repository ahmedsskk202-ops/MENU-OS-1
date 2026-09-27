export interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

/** An equal-length window immediately preceding this one, for trend comparisons. */
export function previousPeriod(range: DateRange): DateRange {
  const durationMs = range.to.getTime() - range.from.getTime();
  return { from: new Date(range.from.getTime() - durationMs), to: new Date(range.from.getTime()), label: `${range.label}-previous` };
}

export function parseDateRange(searchParams: URLSearchParams): DateRange {
  const range = searchParams.get("range") ?? "today";
  const now = new Date();
  const to = now;

  if (range === "custom") {
    const from = searchParams.get("from");
    const toParam = searchParams.get("to");
    if (!from) throw new Error("from is required when range=custom");
    return { from: new Date(from), to: toParam ? new Date(toParam) : now, label: "custom" };
  }

  if (range === "week") {
    const from = new Date(now);
    from.setDate(from.getDate() - 7);
    return { from, to, label: "week" };
  }

  if (range === "month") {
    const from = new Date(now);
    from.setMonth(from.getMonth() - 1);
    return { from, to, label: "month" };
  }

  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  return { from, to, label: "today" };
}
