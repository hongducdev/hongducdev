import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/", destination: "/vi", permanent: false },
      { source: "/blogs", destination: "/vi/blogs", permanent: true },
      { source: "/blogs/:slug", destination: "/vi/blogs/:slug", permanent: true },
      { source: "/projects", destination: "/vi/projects", permanent: true },
    ];
  },
};

export default nextConfig;

if (process.env.NODE_ENV === "development") {
  import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
}
