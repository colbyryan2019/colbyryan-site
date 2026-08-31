import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects() {
    return [
      { source: '/games', destination: '/', permanent: true },
      { source: '/games/bubble-pop', destination: '/games/bubble-burst', permanent: true },
      { source: '/games/colby-wordle', destination: '/games/colbordle', permanent: true },
      { source: '/experience', destination: '/about#experience', permanent: true },
      { source: '/education', destination: '/about#education', permanent: true },
      { source: '/projects', destination: '/about#projects', permanent: true },
    ]
  },
};

export default nextConfig;
