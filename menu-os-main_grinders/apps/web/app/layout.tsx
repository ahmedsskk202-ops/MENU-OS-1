import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, Cairo } from "next/font/google";
import { ThemeProvider } from "@/lib/ThemeContext";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

// Fraunces/Manrope only cover Latin glyphs — Cairo is the Arabic-capable fallback used
// by the customer app when a guest's locale is Arabic (see lib/LocaleContext.tsx).
const arabic = Cairo({
  subsets: ["arabic"],
  variable: "--font-arabic",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "The Grinders Coffee House — Baghdad",
  description: "Coffee House. Order, play, and relax with a warm local coffee experience.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F3EC" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0A08" },
  ],
};

// Sets <html data-theme> synchronously, as the browser's HTML parser reaches this tag —
// before React hydrates or paints the rest of the page — the same technique libraries
// like next-themes use to avoid a flash of the wrong theme. It's a plain inline script,
// not something React renders or ever re-reconciles (the `id` keeps React from touching
// it across re-renders), so there's no hydration-mismatch risk; lib/ThemeContext.tsx
// just reads the value this already set. Deliberately a raw <script> rather than
// next/script's beforeInteractive strategy — that triggered a webpack module-resolution
// error under this app's custom server.js (not the standard `next dev`/`next start`
// CLI), so the plain DOM-level approach is both simpler and more robust here.
// Sets <html data-theme> synchronously, as the browser's HTML parser reaches this tag —
// before React hydrates or paints the rest of the page — the same technique libraries
// like next-themes use to avoid a flash of the wrong theme. It's a plain inline script,
const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("mos_theme");var t=s==="light"||s==="dark"?s:"dark";document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${arabic.variable}`} suppressHydrationWarning>
      <body className="font-sans min-h-screen">
        <script id="theme-init" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
