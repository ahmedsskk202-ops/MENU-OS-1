// Runs once when the Next.js server process boots (Node.js runtime only). This is
// where the local sync engine starts — see docs/OFFLINE_ARCHITECTURE.md §4.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startSyncEngine } = await import("./lib/sync-engine");
    startSyncEngine();
    const { startDelayedOrderChecker } = await import("./lib/delayed-orders");
    startDelayedOrderChecker();
    const { startExpiryChecker } = await import("./lib/inventory");
    startExpiryChecker();
    const { startPaymentReconciler } = await import("./lib/payments/service");
    startPaymentReconciler();
  }
}
