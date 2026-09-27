import { describe, it, expect, beforeEach } from "vitest";

// zustand's `persist` middleware touches localStorage on import in a browser; this
// suite runs under vitest's node environment, so a minimal in-memory stand-in is
// enough to exercise the store's own logic without pulling in a full DOM env.
const memoryStorage = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => memoryStorage.get(k) ?? null,
  setItem: (k: string, v: string) => void memoryStorage.set(k, v),
  removeItem: (k: string) => void memoryStorage.delete(k),
};

const { useCartStore } = await import("@/lib/cart-store");

function item(key: string) {
  return { key, productId: key, name: key, unitBasePrice: 1000, modifiers: [] };
}

describe("cart-store session scoping", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], cartTableSessionId: null });
  });

  it("keeps the cart when ensureSession is called again with the same table session", () => {
    useCartStore.getState().ensureSession("session-A");
    useCartStore.getState().addItem(item("latte"));
    useCartStore.getState().ensureSession("session-A");
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it("keeps the active guest cart stable across repeated branch session initialization", () => {
    const guestSession = "guest:branch-42";
    useCartStore.getState().ensureSession(guestSession);
    useCartStore.getState().addItem(item("latte"));
    useCartStore.getState().ensureSession(guestSession);
    useCartStore.getState().ensureSession(guestSession);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().cartTableSessionId).toBe(guestSession);
  });

  it("clears a stale cart when the device switches to a different table session", () => {
    useCartStore.getState().ensureSession("session-A");
    useCartStore.getState().addItem(item("latte"));
    expect(useCartStore.getState().items).toHaveLength(1);

    // A guest at a different table (or a returning device on a new visit) must never
    // see the previous, unrelated table's leftover cart.
    useCartStore.getState().ensureSession("session-B");
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().cartTableSessionId).toBe("session-B");
  });

  it("does not wipe the cart on the very first call for a fresh session", () => {
    useCartStore.getState().ensureSession("session-C");
    useCartStore.getState().addItem(item("burger"));
    expect(useCartStore.getState().items).toHaveLength(1);
  });
});
