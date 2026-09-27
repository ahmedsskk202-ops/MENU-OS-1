/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@menu-os/db"],
  // Lets instrumentation.ts start the local sync engine once when the server boots.
  // pdfkit's optional fontkit dependency reaches for iconv-lite (only needed for
  // encodings this app never uses) in a way webpack's bundler can't resolve —
  // marking it external makes Node's native require handle it at runtime instead.
  experimental: { instrumentationHook: true, serverComponentsExternalPackages: ["pdfkit", "fontkit"] },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

module.exports = nextConfig;
