import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin", "google-auth-library", "jwks-rsa", "jose"],
};

export default nextConfig;
