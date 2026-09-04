"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SpaceBackground from "@/components/SpaceBackground";

const ENDPOINTS = [
  { method: "POST", path: "/analyze", description: "Run full PlanetX pipeline on a TIC target" },
  { method: "GET", path: "/result/{tic_id}", description: "Retrieve cached analysis result by TIC ID" },
  { method: "GET", path: "/results", description: "List all cached analysis results" },
  { method: "GET", path: "/stats", description: "Dashboard counters: totals per class" },
  { method: "GET", path: "/outputs/planetx_TIC{id}.png", description: "Serve diagnostic figure PNG" },
  { method: "DELETE", path: "/result/{tic_id}", description: "Delete a cached result and its figure" },
];

const STAGES = [
  { num: "01", title: "Data Ingestion", desc: "Downloads SPOC-calibrated TESS light curves from NASA MAST archive. Handles FITS parsing, NaN removal, and quality masking." },
  { num: "02", title: "Preprocessing", desc: "5σ outlier clipping, median normalization, and Savitzky-Golay detrending with a 101-cadence window (~200 minutes)." },
  { num: "03", title: "BLS Detection", desc: "Box Least Squares periodogram searches 0.5–14 day periods with 30–200 minute transit durations. Extracts depth (ppm), duration, and SNR." },
  { num: "04", title: "Classification", desc: "Random Forest on 7 engineered features: period, depth, duration, SNR, depth ratio, duty cycle, and scatter. 97% accuracy across 4 signal classes." },
  { num: "05", title: "Parameter Fitting", desc: "Trapezoidal transit model fitted via bounded least squares. Period refined, depth measured in ppm, duration validated against Kepler&apos;s third law." },
  { num: "06", title: "Visualization", desc: "4-panel diagnostic figure: raw light curve, detrended flux, BLS periodogram, and phase-folded transit with binned model overlay." },
];

const CLASSES = [
  { name: "PLANET CANDIDATE", color: "#22c55e", features: "Shallow depth (100–5000 ppm), good SNR, short duration (~1–4 h), low scatter" },
  { name: "ECLIPSING BINARY", color: "#ef4444", features: "Deep dip (>5000 ppm), often V-shaped or U-shaped, can have ellipsoidal variations" },
  { name: "BLEND", color: "#eab308", features: "Inconsistent depth ratio, possible background contamination, often shallower than expected for period" },
  { name: "NOISE / OTHER", color: "#475569", features: "SNR below detection threshold, no coherent periodicity, high photometric scatter" },
];

export default function Docs() {
  return (
    <div style={{ minHeight: "100vh", background: "#030712" }}>
      <SpaceBackground />
      <Navbar />

      <main style={{ position: "relative", zIndex: 10, paddingTop: 72 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px" }}>
          <p className="label label-orange" style={{ marginBottom: 12 }}>
            Documentation
          </p>
          <h1
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#e2e8f0",
              marginBottom: 48,
              lineHeight: 1,
            }}
          >
            PlanetX Docs
          </h1>

          {/* What is PlanetX */}
          <section style={{ marginBottom: 64 }}>
            <p className="label" style={{ marginBottom: 12 }}>Overview</p>
            <h2
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#e2e8f0",
                marginBottom: 16,
              }}
            >
              What is PlanetX
            </h2>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                lineHeight: "24px",
                color: "#94a3b8",
                maxWidth: 700,
              }}
            >
              PlanetX is an AI-driven exoplanet detection pipeline built for NASA TESS data.
              It ingests 2-minute SPOC light curves, searches for periodic transit signals using Box Least Squares (BLS),
              classifies candidates with a Random Forest model trained on 7 photometric features, and fits trapezoidal
              transit models to extract physical parameters. The system achieves 97% accuracy across four signal classes
              and produces 4-panel diagnostic figures for human review.
            </p>
          </section>

          {/* API Reference */}
          <section style={{ marginBottom: 64 }}>
            <p className="label" style={{ marginBottom: 12 }}>Reference</p>
            <h2
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#e2e8f0",
                marginBottom: 20,
              }}
            >
              API Reference
            </h2>
            <div
              style={{
                border: "1px solid #1e293b",
                borderRadius: 2,
                overflow: "hidden",
                background: "#0c1220",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid #1e293b" }}>
                    {["Method", "Path", "Description"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "14px 16px",
                          textAlign: "left",
                          fontFamily: "Inter, sans-serif",
                          fontSize: 11,
                          fontWeight: 500,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "#475569",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ENDPOINTS.map((ep) => (
                    <tr
                      key={ep.path}
                      style={{ borderBottom: "1px solid #1e293b" }}
                    >
                      <td
                        style={{
                          padding: "14px 16px",
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 12,
                          color: "#f97316",
                        }}
                      >
                        {ep.method}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 12,
                          color: "#e2e8f0",
                        }}
                      >
                        {ep.path}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontFamily: "Inter, sans-serif",
                          fontSize: 13,
                          color: "#94a3b8",
                        }}
                      >
                        {ep.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pipeline Stages */}
          <section style={{ marginBottom: 64 }}>
            <p className="label" style={{ marginBottom: 12 }}>Workflow</p>
            <h2
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#e2e8f0",
                marginBottom: 20,
              }}
            >
              Pipeline Stages
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 1,
                background: "#1e293b",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              {STAGES.map((s) => (
                <div
                  key={s.num}
                  style={{
                    background: "#0c1220",
                    padding: 24,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 12,
                      color: "#f97316",
                      marginBottom: 8,
                    }}
                  >
                    {s.num}
                  </p>
                  <h3
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: 16,
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      color: "#e2e8f0",
                      marginBottom: 8,
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 12,
                      lineHeight: "20px",
                      color: "#475569",
                    }}
                  >
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Signal Classes */}
          <section style={{ marginBottom: 64 }}>
            <p className="label" style={{ marginBottom: 12 }}>Output</p>
            <h2
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#e2e8f0",
                marginBottom: 20,
              }}
            >
              Signal Classes
            </h2>
            <div
              style={{
                border: "1px solid #1e293b",
                borderRadius: 2,
                overflow: "hidden",
                background: "#0c1220",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid #1e293b" }}>
                    {["Class", "Features"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "14px 16px",
                          textAlign: "left",
                          fontFamily: "Inter, sans-serif",
                          fontSize: 11,
                          fontWeight: 500,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "#475569",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CLASSES.map((c) => (
                    <tr key={c.name} style={{ borderBottom: "1px solid #1e293b" }}>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontFamily: "Inter, sans-serif",
                          fontSize: 12,
                          fontWeight: 500,
                          color: c.color,
                        }}
                      >
                        {c.name}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontFamily: "Inter, sans-serif",
                          fontSize: 13,
                          color: "#94a3b8",
                        }}
                      >
                        {c.features}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* The Science */}
          <section style={{ marginBottom: 64 }}>
            <p className="label" style={{ marginBottom: 12 }}>Physics</p>
            <h2
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#e2e8f0",
                marginBottom: 20,
              }}
            >
              The Science
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1,
                background: "#1e293b",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              {[
                { title: "Transit Depth", formula: "δ = (Rp / Rs)²", desc: "Fractional flux decrease when a planet transits. A 1% dip means the planet covers 1% of the stellar disk. Earth causes a 0.008% dip on the Sun." },
                { title: "Transit Duration", formula: "T ≈ (P/π) × (Rs/a)", desc: "Time for the planet to cross the stellar disk. Depends on period P, stellar radius Rs, and semi-major axis a from Kepler&apos;s third law." },
                { title: "BLS Power", formula: "SR = s² / [r(1-r)]", desc: "Box Least Squares scores how well a flat-bottomed box fits at each trial period. The peak power identifies the transit period." },
                { title: "Radius Ratio", formula: "Rp/Rs = √δ", desc: "Direct planet-to-star size ratio from depth. With a known stellar radius from Gaia, this gives the planet&apos;s physical radius in Earth radii." },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: "#0c1220",
                    padding: 28,
                  }}
                >
                  <p className="label" style={{ marginBottom: 12 }}>
                    {item.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 18,
                      color: "#f97316",
                      marginBottom: 14,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {item.formula}
                  </p>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      lineHeight: "22px",
                      color: "#475569",
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Uncertainty Estimation */}
          <section style={{ marginBottom: 64 }}>
            <p className="label" style={{ marginBottom: 12 }}>Precision</p>
            <h2
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#e2e8f0",
                marginBottom: 20,
              }}
            >
              Uncertainty Estimation
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {[
                { title: "SNR", formula: "SNR = δ / (σ / √N)", desc: "Signal-to-noise ratio compares transit depth δ to the photometric scatter σ over N in-transit points. SNR &gt; 7 is the conventional detection threshold." },
                { title: "Period Error", formula: "σP ≈ P / SNR × √(N/2)", desc: "Period uncertainty scales inversely with SNR and the square root of the number of observed transits. More transits = tighter constraint." },
                { title: "Depth Error", formula: "σδ ≈ σ / √N", desc: "Depth uncertainty is dominated by the noise floor and the number of in-transit data points. Binned phase-folded data reduces scatter." },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: "#0c1220",
                    border: "1px solid #1e293b",
                    borderRadius: 2,
                    padding: 24,
                  }}
                >
                  <p className="label" style={{ marginBottom: 8 }}>
                    {item.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 16,
                      color: "#f97316",
                      marginBottom: 10,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {item.formula}
                  </p>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      lineHeight: "22px",
                      color: "#475569",
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Known Limitations */}
          <section style={{ marginBottom: 64 }}>
            <p className="label" style={{ marginBottom: 12 }}>Caveats</p>
            <h2
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#e2e8f0",
                marginBottom: 20,
              }}
            >
              Known Limitations
            </h2>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {[
                "TESS 2-minute cadence limits detection of short-period (< 1 day) planets with very shallow transits.",
                "BLS is less sensitive to eccentric orbits or grazing transits; it assumes a periodic, box-shaped signal.",
                "The Random Forest classifier is trained on synthetic data with simplified noise models; performance on real TESS data may vary.",
                "Single-sector TESS data cannot distinguish between true exoplanets and systematic trends or stellar variability.",
                "Radius ratio assumes a known stellar radius from Gaia; incorrect stellar parameters propagate directly into planet radius estimates.",
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    lineHeight: "22px",
                    color: "#94a3b8",
                    paddingLeft: 20,
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 8,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#f97316",
                      display: "inline-block",
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Tech Stack */}
          <section style={{ marginBottom: 64 }}>
            <p className="label" style={{ marginBottom: 12 }}>Built With</p>
            <h2
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#e2e8f0",
                marginBottom: 20,
              }}
            >
              Tech Stack
            </h2>
            <div
              style={{
                border: "1px solid #1e293b",
                borderRadius: 2,
                overflow: "hidden",
                background: "#0c1220",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid #1e293b" }}>
                    {["Library", "Version", "Purpose"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "14px 16px",
                          textAlign: "left",
                          fontFamily: "Inter, sans-serif",
                          fontSize: 11,
                          fontWeight: 500,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "#475569",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { lib: "lightkurve", ver: "2.6", purpose: "TESS light curve download and manipulation" },
                    { lib: "astropy", ver: "8.0", purpose: "Astronomical units, timeseries, and BLS implementation" },
                    { lib: "scikit-learn", ver: "1.3", purpose: "Random Forest classifier and data scaling" },
                    { lib: "scipy", ver: "1.10", purpose: "Transit model fitting via curve_fit" },
                    { lib: "FastAPI", ver: "0.1", purpose: "REST API backend and static file serving" },
                    { lib: "Next.js", ver: "16", purpose: "React frontend framework" },
                    { lib: "TypeScript", ver: "5.x", purpose: "Type-safe frontend code" },
                  ].map((row) => (
                    <tr
                      key={row.lib}
                      style={{ borderBottom: "1px solid #1e293b" }}
                    >
                      <td
                        style={{
                          padding: "14px 16px",
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 12,
                          color: "#f97316",
                        }}
                      >
                        {row.lib}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 12,
                          color: "#e2e8f0",
                        }}
                      >
                        {row.ver}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontFamily: "Inter, sans-serif",
                          fontSize: 13,
                          color: "#94a3b8",
                        }}
                      >
                        {row.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
