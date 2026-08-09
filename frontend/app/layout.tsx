import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlanetX — Exoplanet Detection",
  description: "AI-driven exoplanet transit detection from NASA TESS data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}