import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow dev server access from any private-LAN IP (HMR via phone), covers network changes.
  // ponytail: 172.*.*.* also covers public 172.32-255 ranges; dev-only guard, restrict when security matters
  allowedDevOrigins: [
    "127.0.0.1",
    "192.168.*.*",
    "10.*.*.*",
    "172.*.*.*",
  ],
};

export default nextConfig;
