/**
 * The words a staff notification is shown with, in the reader's language.
 *
 * Notifications are stored with an English title/body (the server has no idea who will
 * read them), which put "Table 1 is calling a waiter — WATER" into an otherwise Arabic
 * console. The structured `data` saved alongside is enough to say the same thing in
 * either language, so the bell builds the text from that and only falls back to the
 * stored English for kinds (or older rows) that do not carry the facts it needs.
 */
type Translate = (key: string, vars?: Record<string, string | number>) => string;

export interface StoredNotification {
  type?: string | null;
  title: string;
  body?: string | null;
  data?: Record<string, unknown> | null;
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** `t(key)` if the dictionary knows the key, otherwise null. */
function known(t: Translate, key: string): string | null {
  const s = t(key);
  return s === key ? null : s;
}

export function notificationText(n: StoredNotification, t: Translate): { title: string; body: string | null } {
  const data = n.data ?? {};
  const table = str(data.tableLabel);

  switch (n.type) {
    case "ORDER_READY":
      if (table) return { title: t("admin.notif.orderReady.title", { label: table }), body: t("admin.notif.orderReady.body", { label: table }) };
      break;
    case "WAITER_REQUEST":
      if (table) {
        // The body is either the request type (WATER, BILL…) or the guest's own note.
        const reason = n.body ? known(t, `admin.waiter.type.${n.body}`) ?? n.body : null;
        return { title: t("admin.notif.waiter.title", { label: table }), body: reason };
      }
      break;
    case "NEW_ORDER": {
      const count = num(data.itemCount);
      if (table) return { title: t("admin.notif.newOrder.title", { label: table }), body: count !== null ? t("admin.notif.items", { n: count }) : n.body ?? null };
      break;
    }
    case "DELAYED_ORDER": {
      const minutes = num(data.minutes);
      const status = str(data.status);
      const number = str(data.orderNumber);
      if (minutes !== null && (table || number)) {
        const waitingOn = status ? known(t, `admin.notif.delayed.status.${status}`) : null;
        return {
          title: table ? t("admin.notif.delayed.table", { label: table }) : t("admin.notif.delayed.order", { number: number! }),
          body: waitingOn ? t("admin.notif.delayed.body", { minutes, status: waitingOn }) : t("admin.notif.delayed.minutes", { minutes }),
        };
      }
      break;
    }
    case "LOW_STOCK": {
      const name = str(data.name);
      const left = num(data.onHand);
      const unit = str(data.unit) ?? "";
      if (name && left !== null) return { title: t("admin.notif.lowStock.title", { name }), body: t("admin.notif.lowStock.body", { n: left, unit }) };
      break;
    }
    case "OUT_OF_STOCK": {
      const name = str(data.name);
      if (name) return { title: t("admin.notif.outOfStock.title", { name }), body: t("admin.notif.outOfStock.body") };
      break;
    }
    case "STOCK_EXPIRY": {
      const name = str(data.name);
      const quantity = num(data.quantity);
      const unit = str(data.unit) ?? "";
      if (!name || quantity === null) break;
      if (data.kind === "expired") return { title: t("admin.notif.expired.title", { name }), body: t("admin.notif.expired.body", { n: quantity, unit }) };
      const days = num(data.days);
      if (days !== null) return { title: t("admin.notif.expiring.title", { name }), body: t("admin.notif.expiring.body", { n: quantity, unit, days }) };
      break;
    }
  }
  return { title: n.title, body: n.body ?? null };
}
