import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next's own server (dev / self-hosted `next start`) doesn't resolve
  // public/<dir>/index.html for directory URLs the way Vercel's static
  // layer does — without this, /projects/<slug>/ 404s off-Vercel.
  async rewrites() {
    return {
      afterFiles: [
        {
          source: "/projects/:slug",
          destination: "/projects/:slug/index.html",
        },
      ],
    };
  },
};

export default nextConfig;
