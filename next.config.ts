import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! Bỏ qua lỗi TypeScript trong quá trình build production !!
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
