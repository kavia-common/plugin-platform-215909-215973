import type { NextConfig } from "next";

/**
 * Expose environment variables to the client.
 * NEXT_PUBLIC_* variables are automatically exposed by Next.js,
 * but we also define runtime config to ensure clarity and future extension.
 */
const nextConfig: NextConfig = {
  output: "export",
  env: {
    // Base URL of Backend API (e.g., http://localhost:8000)
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    // Public origin of this app, useful for OAuth redirects (e.g., http://localhost:3000)
    NEXT_PUBLIC_APP_ORIGIN: process.env.NEXT_PUBLIC_APP_ORIGIN,
  },
};

export default nextConfig;
