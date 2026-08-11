import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next.js 16 uses Turbopack by default. @dbml/core bundles cleanly under
  // it without extra polyfill config, so we keep this minimal on purpose.
  turbopack: {},
  // Workspace packages ship raw/compiled TS via a `main` field, not a
  // pre-bundled browser build — Next needs to run them through its own
  // transpilation pipeline instead of treating them as opaque node_modules.
  transpilePackages: ["@repo/types"],
  // Produces a self-contained `.next/standalone` output (server + only the
  // node_modules it actually needs) so the Docker runtime image doesn't
  // need the full monorepo node_modules tree copied in.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
