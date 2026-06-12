import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SST",
  description: "Sistema SST para APR, PT, assinaturas e operação offline.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#143b6f"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
