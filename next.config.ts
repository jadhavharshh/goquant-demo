import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ⛔ Don't fail the build if there are lint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
