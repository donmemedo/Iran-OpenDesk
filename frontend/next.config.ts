import type { NextConfig } from "next";

const api = process.env.BACKEND_URL ?? "http://localhost:8000";

export default {
  output: "standalone",
  async redirects() {
    return [{ source: "/", destination: "/fa", permanent: false }];
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${api}/api/:path*` }];
  },
} satisfies NextConfig;
