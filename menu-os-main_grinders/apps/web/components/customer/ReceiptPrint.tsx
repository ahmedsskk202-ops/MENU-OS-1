"use client";

import { forwardRef, useEffect, useImperativeHandle, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Printer } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

/**
 * Everything a receipt needs, in one shape, so the staff screen and the guest's
 * own bill screen print an identical slip. Plain data only — this component does
 * no fetching, which is what lets both call sites pass whatever they already have.
 */
export interface ReceiptData {
  brandName: string;
  branchName: string;
  address?: string;
  phone?: string;
  taxId?: string;
  /** The cafe's own table label ("12"). Deliberately the most prominent field. */
  tableLabel?: string;
  orderNumber: string;
  issuedAt: string;
  currency: string;
  items: Array<{ name: string; quantity: number; lineTotal: string | number; modifiers?: string[] }>;
  discounts?: Array<{ reason: string; amount: string | number }>;
  subtotal: string | number;
  discountTotal?: string | number;
  taxTotal?: string | number;
  serviceFeeTotal?: string | number;
  total: string | number;
  paid?: string | number;
  due?: string | number;
  payments?: Array<{ method: string; amount: string | number; tipAmount?: string | number }>;
  note?: string;
}

export interface ReceiptPrintHandle {
  print: () => void;
}

interface Props {
  receipt: ReceiptData;
  /** Visible label for the trigger button. */
  label: string;
  icon?: ReactNode;
  className?: string;
  /** Stacked trigger buttons (the default) suit a page; `icon` alone suits a table row. */
  variant?: "button" | "icon";
}

/**
 * THE ONE PRINT ROOT FOR THE WHOLE DOCUMENT.
 *
 * The print stylesheet hides every direct child of `body` except `.receipt-print-root`,
 * so whatever is inside that node *is* the print job. That makes the node a shared
 * resource, not something each receipt may have its own copy of: with a per-component
 * root, a page with twelve order rows leaves twelve sheets mounted and Ctrl+P prints
 * all twelve. Sharing one node, and mounting a sheet into it only while its own button
 * is being pressed, is what makes "print this receipt" mean this receipt.
 *
 * Reference counted, so a page that navigates away does not leave an empty node behind
 * in the document for the life of the tab.
 */
let printRoot: HTMLElement | null = null;
let printRootUsers = 0;

function acquirePrintRoot(): HTMLElement {
  if (!printRoot) {
    printRoot = document.createElement("div");
    printRoot.className = "receipt-print-root";
    document.body.appendChild(printRoot);
  }
  printRootUsers += 1;
  return printRoot;
}

function releasePrintRoot() {
  printRootUsers -= 1;
  if (printRootUsers <= 0 && printRoot) {
    printRoot.remove();
    printRoot = null;
    printRootUsers = 0;
  }
}

/**
 * Plain-browser printing — no PDF library, no dedicated thermal device, no server
 * round trip. A hidden, print-formatted copy of the receipt is rendered into the
 * document and `window.print()` is called.
 *
 * The sheet is PORTALED into the shared `.receipt-print-root` node on `document.body`
 * rather than rendered in place. That is load-bearing, not cosmetic: the print
 * stylesheet hides every direct child of `body` except that node, which is only
 * possible if the sheets are not buried inside the app shell's own DOM subtree.
 * It also means a receipt printed from a row in a long orders table is not clipped
 * by any ancestor's `overflow` or stacking context.
 *
 * It is mounted on demand and taken down again afterwards, so the shared root is
 * empty at every moment except during a print.
 *
 * The visible trigger renders as an ordinary button, so it is keyboard reachable
 * and announces itself; the printed copy is `aria-hidden` because the same numbers
 * are already on screen when the button is pressed.
 */
export const ReceiptPrint = forwardRef<ReceiptPrintHandle, Props>(function ReceiptPrint(
  { receipt, label, icon, className, variant = "button" },
  ref
) {
  const [printing, setPrinting] = useState(false);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  // Created after mount (the server has no document) and released on unmount.
  useEffect(() => {
    const node = acquirePrintRoot();
    setPortalNode(node);
    return releasePrintRoot;
  }, []);

  function print() {
    setPrinting(true);
  }

  // Printing is kicked off from here rather than straight out of the click handler
  // because the sheet has to be *in the document* before the dialog opens. An effect
  // runs after React has committed that DOM, and the frame callback then waits for
  // layout, so the slip cannot be half-rendered. Doing it in the click handler would
  // print whatever was there before the state update landed.
  useEffect(() => {
    if (!printing) return;
    const frame = requestAnimationFrame(() => {
      window.print();
      setPrinting(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [printing]);

  useImperativeHandle(ref, () => ({ print }), []);

  return (
    <>
      <button
        type="button"
        onClick={print}
        disabled={printing}
        className={cn(
          variant === "button"
            ? "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-60"
            : "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-raised hover:bg-muted disabled:opacity-60",
          className
        )}
        title={label}
        aria-label={label}
      >
        {icon ?? <Printer className="h-4 w-4" />}
        {variant === "button" && <span>{label}</span>}
      </button>

      {printing &&
        portalNode &&
        createPortal(
          <div className="receipt-print-sheet" aria-hidden="true">
            <ReceiptBody receipt={receipt} />
          </div>,
          portalNode
        )}
    </>
  );
});

function ReceiptBody({ receipt: r }: { receipt: ReceiptData }) {
  const num = (v: string | number | undefined) => Number(v ?? 0);
  const discountTotal = num(r.discountTotal);
  const taxTotal = num(r.taxTotal);
  const serviceFeeTotal = num(r.serviceFeeTotal);
  const paid = num(r.paid);
  const due = r.due === undefined ? Math.max(0, num(r.total) - paid) : num(r.due);

  return (
    <div className="receipt-sheet">
      <header className="receipt-head">
        <p className="receipt-brand">{r.brandName}</p>
        {r.branchName && <p className="receipt-line-strong">{r.branchName}</p>}
        {r.address && <p className="receipt-line">{r.address}</p>}
        {r.phone && <p className="receipt-line" dir="ltr">{r.phone}</p>}
        {r.taxId && <p className="receipt-line" dir="ltr">Tax ID: {r.taxId}</p>}
      </header>

      {/* Table number gets its own bordered block, above everything else that
          identifies the order. On a cafe counter slip this is the line staff read
          first, so it must survive a monochrome printer. */}
      {r.tableLabel && (
        <div className="receipt-table">
          <span className="receipt-table-label">TABLE</span>
          <span className="receipt-table-number">{r.tableLabel}</span>
        </div>
      )}

      <div className="receipt-meta">
        <p className="receipt-line">Order: {r.orderNumber}</p>
        <p className="receipt-line">{new Date(r.issuedAt).toLocaleString()}</p>
      </div>

      <table className="receipt-table-items">
        <tbody>
          {r.items.map((item, i) => (
            <tr key={`${item.name}-${i}`}>
              <td colSpan={2} className="receipt-item-name">
                {item.quantity} × {item.name}
                {item.modifiers?.length ? ` (${item.modifiers.join(", ")})` : ""}
              </td>
              <td className="receipt-item-amount">{formatMoney(item.lineTotal, r.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="receipt-totals">
        <Row label="Subtotal" value={r.subtotal} currency={r.currency} />
        {discountTotal !== 0 && <Row label="Discount" value={-Math.abs(discountTotal)} currency={r.currency} />}
        {taxTotal !== 0 && <Row label="Tax" value={taxTotal} currency={r.currency} />}
        {serviceFeeTotal !== 0 && <Row label="Service" value={serviceFeeTotal} currency={r.currency} />}
        <Row label="TOTAL" value={r.total} currency={r.currency} strong />
        {paid > 0 && <Row label="Paid" value={paid} currency={r.currency} />}
        <Row label="DUE" value={due} currency={r.currency} strong />
      </div>

      {!!r.discounts?.length && (
        <div className="receipt-discounts">
          {r.discounts.map((d, i) => (
            <p key={i} className="receipt-line">
              − {d.reason}: {formatMoney(d.amount, r.currency)}
            </p>
          ))}
        </div>
      )}

      {!!r.payments?.length && (
        <div className="receipt-payments">
          {r.payments.map((p, i) => {
            // Read the tip through `num` rather than testing the raw value: the
            // "no tip recorded" case is an absent/empty field, and normalising first
            // means a `""` or `null` never renders as "NaN" on the printed slip.
            const tip = num(p.tipAmount);
            return (
              <p key={i} className="receipt-line">
                {p.method} {formatMoney(p.amount, r.currency)}
                {tip > 0 && ` (tip ${formatMoney(tip, r.currency)})`}
              </p>
            );
          })}
        </div>
      )}

      {r.note && <p className="receipt-note">{r.note}</p>}

      <footer className="receipt-foot">
        <p>Thank you — see you soon</p>
      </footer>
    </div>
  );
}

function Row({ label, value, currency, strong }: { label: string; value: string | number; currency: string; strong?: boolean }) {
  return (
    <div className={strong ? "receipt-total-strong" : "receipt-total"}>
      <span>{label}</span>
      <span>{formatMoney(value, currency)}</span>
    </div>
  );
}
