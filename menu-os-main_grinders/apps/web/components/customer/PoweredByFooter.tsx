// Unified, deliberately understated platform attribution for the white-label customer
// experience — the restaurant's own brand (logo/name from Brand.logoUrl) stays the
// primary identity on every page; this is just a small caption at the natural end of
// scrollable content, never a competing fixed element. Reused by every customer-facing
// layout (dine-in /t/[sessionId] and guest ordering /m/[branchId]) so it's one place to
// change, not a copy-pasted string per page.
export function PoweredByFooter() {
  return (
    // dir="ltr" — this is always an English phrase, even when the surrounding page is
    // RTL (Arabic). Without it, the browser's bidi algorithm treats the trailing "."
    // as a weak character and reorders it to the wrong side (rendering ".Powered by
    // ORVYQ CO" instead of "Powered by ORVYQ CO."), since the paragraph otherwise
    // inherits its RTL parent's direction.
    <p dir="ltr" className="text-center text-xs tracking-wide text-muted-foreground pt-6 pb-2">
      Powered by <span className="font-semibold text-accent-ink">ORVYQ CO.</span>
    </p>
  );
}
