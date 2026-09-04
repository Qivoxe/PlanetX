"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SpaceBackground from "@/components/SpaceBackground";

export default function Home() {
  return (
    <div className="dot-bg" style={{ minHeight: "100vh", background: "#030712" }}>
      <SpaceBackground />
      <Navbar />

      {/* Hero */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px 40px 80px", position: "relative", zIndex: 10 }}>
        <div className="scanline" />

        {/* Orbit decoration */}
        <div style={{ position: "absolute", right: "8%", top: "50%", transform: "translateY(-50%)", width: 400, height: 400, pointerEvents: "none" }}>
          <div className="orbit-ring" style={{ width: 400, height: 400, top: 0, left: 0 }} />
          <div className="orbit-ring" style={{ width: 280, height: 280, top: 60, left: 60, animationDuration: "20s", animationDirection: "reverse" }} />
          <div className="orbit-ring" style={{ width: 160, height: 160, top: 120, left: 120, animationDuration: "12s" }} />
          <div className="float" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #fbbf24, #f97316, #7c2d12, #030712)", boxShadow: "0 0 60px rgba(249,115,22,0.4), 0 0 120px rgba(249,115,22,0.15)" }} />
        </div>

        <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%" }}>
          <div className="reveal-line" style={{ marginBottom: 20 }}>
            <span className="reveal-text label label-orange" style={{ display: "block" }}>
              Bharatiya Antariksh Hackathon 2026 — PS-07
            </span>
          </div>

          <h1 className="massive reveal-line" style={{ marginBottom: 32, maxWidth: 700 }}>
            <span className="reveal-text" style={{ display: "block", color: "#e2e8f0" }}>HUNT</span>
            <span className="reveal-text" style={{ display: "block", color: "#e2e8f0", animationDelay: "0.1s" }}>EXOPLANETS</span>
            <span className="reveal-text" style={{ display: "block", color: "#f97316", animationDelay: "0.2s" }}>WITH AI</span>
          </h1>

          <div className="reveal-line" style={{ maxWidth: 500, marginBottom: 44 }}>
            <p className="reveal-text" style={{ display: "block", fontFamily: "Inter, sans-serif", fontSize: 16, lineHeight: "28px", color: "#475569", animationDelay: "0.35s" }}>
              NASA TESS data. Box Least Squares transit detection.
              Random Forest classification at 97% accuracy.
              From raw light curve to exoplanet candidate in 90 seconds.
            </p>
          </div>

          <div className="reveal-line">
            <div className="reveal-text" style={{ display: "flex", gap: 16, animationDelay: "0.5s" }}>
              <Link href="/Dashboard"><button className="btn-primary">Analyze a Star →</button></Link>
              <Link href="/Results"><button className="btn-ghost">View Results</button></Link>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", marginTop: 80, border: "1px solid #1e293b", borderRadius: 4 }}>
            {[
              { label: "Stars Catalogued",    value: "196,801", orange: false },
              { label: "Classifier Accuracy", value: "97%",     orange: true  },
              { label: "Signal Classes",      value: "4",       orange: false },
              { label: "Obs. Window",         value: "27d",     orange: false },
            ].map((s, i) => (
              <div key={s.label} style={{ padding: "28px 24px", borderRight: i < 3 ? "1px solid #1e293b" : "none", background: "#0c1220" }}>
                <p className="label" style={{ marginBottom: 10 }}>{s.label}</p>
                <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 30, fontWeight: 500, color: s.orange ? "#f97316" : "#e2e8f0" }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section style={{ padding: "100px 40px", borderTop: "1px solid #1e293b", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <p className="label label-orange" style={{ marginBottom: 16 }}>Pipeline</p>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 44, fontWeight: 800, letterSpacing: "-0.04em", color: "#e2e8f0", marginBottom: 60, maxWidth: 500, lineHeight: 1 }}>
            From photons to planets.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}>
            {[
              { num: "01", title: "INGEST",   desc: "Downloads SPOC-calibrated TESS light curves from NASA MAST archive. Handles FITS parsing, NaN removal, quality masking." },
              { num: "02", title: "DETECT",   desc: "BLS periodogram searches 0.5–14 day periods with 30–200 minute transit durations. Extracts depth (ppm), duration, SNR." },
              { num: "03", title: "CLASSIFY", desc: "Random Forest on 7 features: period, depth, duration, SNR, depth ratio, duty cycle, scatter. 97% accuracy, 4 signal classes." },
              { num: "04", title: "FIT",      desc: "Savitzky-Golay detrending, trapezoidal transit model fitting, period refinement via bounded minimization." },
              { num: "05", title: "ESTIMATE", desc: "Computes Rp/Rs = √δ, validates duration against Kepler's third law: T ≈ (P/π) × (Rs/a). Flags anomalies." },
              { num: "06", title: "VISUALIZE",desc: "4-panel diagnostic: raw light curve, detrended flux, BLS periodogram, phase-folded transit with binned model." },
            ].map(step => (
              <div key={step.num} className="card" style={{ padding: 36, borderRadius: 0 }}>
                <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#f97316", marginBottom: 40, letterSpacing: "0.1em" }}>{step.num}</p>
                <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "#e2e8f0", marginBottom: 14 }}>{step.title}</h3>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, lineHeight: "22px", color: "#475569" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Science */}
      <section style={{ padding: "100px 40px", borderTop: "1px solid #1e293b", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <p className="label label-orange" style={{ marginBottom: 16 }}>The Science</p>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 44, fontWeight: 800, letterSpacing: "-0.04em", color: "#e2e8f0", marginBottom: 60, maxWidth: 500, lineHeight: 1 }}>
            Transit photometry fundamentals.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}>
            {[
              { title: "Transit Depth",    formula: "δ = (Rp / Rs)²",          desc: "Fractional flux decrease when a planet transits. A 1% dip means the planet covers 1% of the stellar disk. Earth causes a 0.008% dip on the Sun." },
              { title: "Transit Duration", formula: "T ≈ (P/π) × (Rs/a)",      desc: "Time for the planet to cross the stellar disk. Depends on period P, stellar radius Rs, and semi-major axis a from Kepler's third law." },
              { title: "BLS Power",        formula: "SR = s² / [r(1-r)]",       desc: "Box Least Squares scores how well a flat-bottomed box fits at each trial period. The peak power identifies the transit period." },
              { title: "Radius Ratio",     formula: "Rp/Rs = √δ",               desc: "Direct planet-to-star size ratio from depth. With a known stellar radius from Gaia, this gives the planet's physical radius in Earth radii." },
            ].map(item => (
              <div key={item.title} className="card" style={{ padding: 40, borderRadius: 0 }}>
                <p className="label" style={{ marginBottom: 14 }}>{item.title}</p>
                <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 20, color: "#f97316", marginBottom: 18, letterSpacing: "-0.02em" }}>{item.formula}</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, lineHeight: "22px", color: "#475569" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 40px", borderTop: "1px solid #1e293b", position: "relative", zIndex: 10, background: "#0c1220" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 32 }}>
          <div>
            <p className="label" style={{ marginBottom: 14 }}>Start detecting</p>
            <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 56, fontWeight: 900, letterSpacing: "-0.04em", color: "#e2e8f0", lineHeight: 0.9 }}>
              Find the next<br /><span style={{ color: "#f97316" }}>WASP-126b.</span>
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-end" }}>
            <Link href="/Dashboard"><button className="btn-primary" style={{ fontSize: 15, padding: "20px 52px" }}>Launch Pipeline →</button></Link>
            <p className="label">Validated on real NASA TESS data</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}