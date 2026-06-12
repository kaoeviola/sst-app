import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  additionalManifestEntries: [
    { url: "/apr/novo", revision: "1" },
    { url: "/pt/novo", revision: "1" },
    { url: "/login", revision: "1" },
    { url: "/register", revision: "1" }
  ],
  runtimeCaching: [
    {
      urlPattern: /^https?.*\/(?:dashboard|obras|funcionarios|atividades|apr|pt|assinaturas).*$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "sst-routes",
        expiration: {
          maxEntries: 80,
          maxAgeSeconds: 60 * 60 * 24 * 7
        }
      }
    },
    {
      urlPattern: /\.(?:js|css|woff2?|png|jpg|jpeg|svg|webp|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "sst-assets",
        expiration: {
          maxEntries: 120,
          maxAgeSeconds: 60 * 60 * 24 * 30
        }
      }
    },
    {
      urlPattern: /^https?.*\/(?:apr\/novo|pt\/novo).*$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "sst-forms",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 14
        }
      }
    }
  ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

export default withPWA(nextConfig);
