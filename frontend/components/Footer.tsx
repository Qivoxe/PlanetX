import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "#030712", borderTop: "1px solid #1e293b", padding: "40px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #fbbf24, #f97316, #7c2d12)", boxShadow: "0 0 10px rgba(249,115,22,0.4)" }} />
          <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, fontWeight: 900, letterSpacing: "-0.03em", color: "#e2e8f0" }}>
            Planet<span style={{ color: "#f97316" }}>X</span>
          </span>
          <span className="label" style={{ marginLeft: 8 }}>© 2026 — ISRO × Hack2Skill</span>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          {[
            { label: "lightkurve", val: "2.6" },
            { label: "astropy",    val: "8.0" },
            { label: "FastAPI",    val: "0.1" },
            { label: "Next.js",    val: "16"  },
          ].map(t => (
            <div key={t.label} style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#f97316" }}>{t.val}</p>
              <p className="label" style={{ marginTop: 2 }}>{t.label}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {["GitHub", "API", "Docs"].map(item => (
            <Link key={item} href="/Docs" style={{ textDecoration: "none" }}>
              <span className="label" style={{ cursor: "pointer", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.target as HTMLElement).style.color = "#f97316"}
                    onMouseLeave={e => (e.target as HTMLElement).style.color = "#334155"}>
                {item}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}