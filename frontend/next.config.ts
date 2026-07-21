import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next.js 16 uses Turbopack by default. @dbml/core bundles cleanly under
  // it without extra polyfill config, so we keep this minimal on purpose.
  turbopack: {},
};

export default nextConfig;
