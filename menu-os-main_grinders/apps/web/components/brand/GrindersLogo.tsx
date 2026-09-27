/**
 * THE GRINDERS COFFEE HOUSE — brand mark.
 *
 * Uses the real client logo, served locally from /public/brand/grinders-logo.png
 * (RGBA, 1:1) so the prototype never depends on a remote host. The mark is a
 * square lockup, so it's height-constrained and centered rather than stretched;
 * `contain` guards against any future non-square replacement.
 *
 * To swap in a different logo file, replace that one PNG — nothing else changes.
 */
export function GrindersLogo({
  className = "h-9 w-9",
  alt = "The Grinders Coffee House",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/grinders-logo.png"
      alt={alt}
      className={`shrink-0 object-contain ${className}`}
      // A square mark keeps its aspect ratio at any size.
      style={{ aspectRatio: "1 / 1" }}
    />
  );
}
