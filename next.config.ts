import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
  allowedDevOrigins: ['172.16.1.22'],
};

export default nextConfig;
