import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      // /features was renamed to /how-it-works during the Lovable merge.
      // Permanent redirect preserves any inbound SEO and bookmarks.
      {
        source: "/features",
        destination: "/how-it-works",
        permanent: true,
      },
      {
        source: "/goals",
        destination: "/projects",
        permanent: true,
      },
      {
        source: "/goals/:projectId",
        destination: "/projects/:projectId",
        permanent: true,
      },
      {
        source: "/api/goals",
        destination: "/api/projects",
        permanent: true,
      },
      {
        source: "/api/goals/:path*",
        destination: "/api/projects/:path*",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
