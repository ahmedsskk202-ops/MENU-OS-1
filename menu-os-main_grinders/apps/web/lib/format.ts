export function formatMoney(amount: number | string, currency = "IQD") {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (currency === "IQD") {
    return `${new Intl.NumberFormat("en-US").format(Math.round(value))} IQD`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
