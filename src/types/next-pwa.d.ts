declare module "next-pwa" {
  import type { NextConfig } from "next";

  type RuntimeCaching = {
    urlPattern: RegExp;
    handler: "NetworkFirst" | "CacheFirst" | "StaleWhileRevalidate";
    options?: Record<string, unknown>;
  };

  type PwaOptions = {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    runtimeCaching?: RuntimeCaching[];
    additionalManifestEntries?: Array<{ url: string; revision: string }>;
  };

  export default function withPWAInit(options: PwaOptions): (config: NextConfig) => NextConfig;
}
