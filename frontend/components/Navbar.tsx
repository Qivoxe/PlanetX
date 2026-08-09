"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "Home",      href: "/" },
  { label: "Dashboard", href: "/Dashboard" },
  { label: "Results",   href: "/Results" },
  { label: "Docs",      href: "/Docs" },
];

export default function Navbar() {
  const path = usePathname();
  return (
    <nav style={{
      position: "fixed", top: 0, width: "100%", zIndex: 50,
      background: "rgba(3,7,18,0.85)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid #1e293b"
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #fbbf24, #f97316, #7c2d12)", boxShadow: "0 0 16px rgba(249,115,22,0.5)" }} />
            <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em", color: "#e2e8f0" }}>
              Planet<span style={{ color: "#f97316" }}>X</span>
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{ textDecoration: "none" }}>
              <span style={{
                fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 500,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: path === l.href ? "#f97316" : "#334155",
                borderBottom: path === l.href ? "1px solid #f97316" : "1px solid transparent",
                paddingBottom: 2, transition: "all 0.15s"
              }}>
                {l.label}
              </span>
            </Link>
          ))}
        </div>

        <Link href="/Dashboard" style={{ textDecoration: "none" }}>
          <button className="btn-primary" style={{ padding: "10px 24px", fontSize: 11 }}>
            Launch Pipeline
          </button>
        </Link>
      </div>
    </nav>
  );
}