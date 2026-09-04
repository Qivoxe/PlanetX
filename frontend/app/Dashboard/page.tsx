"use client";

import { useState, useEffect, useRef } from "react";
import Pipeline from "@/components/Pipeline";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SpaceBackground from "@/components/SpaceBackground";

const API = "http://localhost:8000";

interface AnalysisParams {
  period_days: number;
  period_err_days: number;
  depth_ppm: number;
  depth_err_ppm: number;
  duration_hrs: number;
  snr: number;
  scatter_ppm: number;
  radius_ratio: number;
  n_points: number;
  fit_quality: string;
}

interface Quality {
  confidence: "HIGH" | "MEDIUM" | "LOW";
  score: number;
  flags: string[];
}

interface DurationValidation {
  flag: string;
  interpretation: string;
}

interface AnalysisResult {
  tic_id: number;
  name: string;
  classification: "PLANET CANDIDATE" | "ECLIPSING BINARY" | "BLEND" | "NOISE / OTHER";
  confidence: number;
  probabilities: Record<string, number>;
  parameters: AnalysisParams;
  quality: Quality;
  duration_validation: DurationValidation;
  figure_url: string | null;
}

const CLASS_COLORS: Record<string, string> = {
  "PLANET CANDIDATE": "#22c55e",
  "ECLIPSING BINARY": "#ef4444",
  "BLEND": "#eab308",
  "NOISE / OTHER": "#475569",
};

function getClassColor(cls: string): string {
  return CLASS_COLORS[cls] || "#475569";
}

function getRadiusInterpretation(ratio: number): string {
  if (ratio < 0.02) return "Sub-Neptune or smaller";
  if (ratio <= 0.07) return "Neptune to Jupiter sized";
  return "Super-Jupiter or eclipsing binary";
}

function getPeriodInterpretation(period: number): string {
  if (period < 2) return "Ultra-hot Jupiter — extreme irradiation";
  if (period <= 10) return "Hot Jupiter orbital range";
  return "Longer period — potentially habitable zone";
}

function getSnrInterpretation(snr: number): string {
  if (snr > 50) return "Strong detection — high confidence";
  if (snr >= 7) return "Moderate detection — candidate";
  return "Weak signal — requires follow-up";
}

const QUICK_SELECTS = [
  { label: "WASP-126b", id: 25155310 },
  { label: "TOI-700", id: 207141131 },
  { label: "Known EB", id: 318937509 },
];

export default function Dashboard() {
  const [ticId, setTicId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [stage, setStage] = useState(-1);
  const timerRef = useRef(0);

  const runAnalysis = async () => {
    const id = Number(ticId);
    if (!ticId || isNaN(id) || id <= 0) {
      setError("Enter a valid TIC ID");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setStage(0);

    try {
      const res = await fetch(`${API}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tic_id: id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Request failed with status ${res.status}`);
      }
      const data: AnalysisResult = await res.json();
      setResult(data);
      setStage(6);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setStage(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading && stage >= 0 && stage < 6) {
      timerRef.current = window.setTimeout(() => setStage((s) => s + 1), 8000);
    }
    return () => clearTimeout(timerRef.current);
  }, [loading, stage]);

  return (
    <div style={{ minHeight: "100vh", background: "#030712" }}>
      <SpaceBackground />
      <Navbar />

      <main style={{ position: "relative", zIndex: 10, paddingTop: 72 }}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "40px",
            display: "flex",
            gap: 40,
            flexWrap: "wrap",
          }}
        >
          {/* Left Panel */}
          <div style={{ flex: "0 0 40%", minWidth: 300 }}>
            <p className="label label-orange" style={{ marginBottom: 12 }}>Analysis</p>
            <h1
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "#e2e8f0",
                marginBottom: 28,
                lineHeight: 1,
              }}
            >
              Pipeline
            </h1>

            <div style={{ marginBottom: 20 }}>
              <label className="label" style={{ display: "block", marginBottom: 8 }}>
                TIC ID
              </label>
              <input
                type="text"
                value={ticId}
                onChange={(e) => setTicId(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="e.g. 25155310"
                onKeyDown={(e) => e.key === "Enter" && runAnalysis()}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "#0c1220",
                  border: "1px solid #1e293b",
                  borderRadius: 2,
                  color: "#e2e8f0",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 14,
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                onBlur={(e) => (e.target.style.borderColor = "#1e293b")}
              />
            </div>

            <button
              onClick={runAnalysis}
              disabled={loading}
              className="btn-primary"
              style={{
                width: "100%",
                marginBottom: 16,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Analyzing..." : "Run Pipeline →"}
            </button>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 40 }}>
              {QUICK_SELECTS.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setTicId(String(chip.id))}
                  className="btn-ghost"
                  style={{ padding: "8px 14px", fontSize: 11 }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #1e293b", paddingTop: 32 }}>
              <p className="label" style={{ marginBottom: 20 }}>Stages</p>
              <Pipeline activeStage={stage} />
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ flex: "0 0 55%", minWidth: 320 }}>
            {error && (
              <div
                style={{
                  border: "1px solid #ef4444",
                  borderRadius: 2,
                  padding: 24,
                  background: "#0c1220",
                  marginBottom: 24,
                }}
              >
                <p
                  style={{
                    color: "#ef4444",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 13,
                  }}
                >
                  {error}
                </p>
              </div>
            )}

            {loading && stage >= 0 && stage < 6 && (
              <div
                style={{
                  padding: 60,
                  textAlign: "center",
                  color: "#475569",
                  border: "1px solid #1e293b",
                  borderRadius: 2,
                  background: "#0c1220",
                }}
              >
                <p
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 12,
                    marginBottom: 8,
                  }}
                >
                  Stage {String(stage + 1).padStart(2, "0")} in progress...
                </p>
                <p style={{ fontFamily: "Inter", fontSize: 12 }}>
                  Downloading and processing TESS light curve
                </p>
              </div>
            )}

            {!loading && !result && !error && (
              <div
                style={{
                  padding: 80,
                  textAlign: "center",
                  color: "#475569",
                  border: "1px solid #1e293b",
                  borderRadius: 2,
                  background: "#0c1220",
                }}
              >
                <p
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: 12,
                    color: "#e2e8f0",
                  }}
                >
                  Ready to analyze
                </p>
                <p style={{ fontFamily: "Inter", fontSize: 13 }}>
                  Enter a TIC ID and run the pipeline to see results.
                </p>
              </div>
            )}

            {result && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Classification Banner */}
                <div
                  style={{
                    background: "#0c1220",
                    border: "1px solid #1e293b",
                    borderRadius: 2,
                    padding: 28,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 20,
                    }}
                  >
                    <div>
                      <p className="label" style={{ marginBottom: 8 }}>
                        Classification
                      </p>
                      <h2
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          fontSize: 28,
                          fontWeight: 800,
                          letterSpacing: "-0.04em",
                          color: getClassColor(result.classification),
                        }}
                      >
                        {result.classification}
                      </h2>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p className="label" style={{ marginBottom: 8 }}>
                        Confidence
                      </p>
                      <p
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 28,
                          color: "#f97316",
                        }}
                      >
                        {result.confidence.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Probability Bars */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {Object.entries(result.probabilities).map(([cls, prob]) => (
                      <div key={cls}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: 11,
                              color: "#94a3b8",
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                            }}
                          >
                            {cls}
                          </span>
                          <span
                            style={{
                              fontFamily: "JetBrains Mono, monospace",
                              fontSize: 12,
                              color: getClassColor(cls),
                            }}
                          >
                            {prob.toFixed(1)}%
                          </span>
                        </div>
                        <div
                          style={{
                            height: 4,
                            background: "#1e293b",
                            borderRadius: 2,
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${prob}%`,
                              background: getClassColor(cls),
                              borderRadius: 2,
                              transition: "width 0.6s ease",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metric Cards */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 1,
                    background: "#1e293b",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  {[
                    {
                      label: "Period",
                      value: `${result.parameters.period_days.toFixed(4)} d`,
                      err: `±${result.parameters.period_err_days.toFixed(5)}`,
                    },
                    {
                      label: "Depth",
                      value: `${result.parameters.depth_ppm.toFixed(2)} ppm`,
                      err: `±${result.parameters.depth_err_ppm.toFixed(2)}`,
                    },
                    {
                      label: "Duration",
                      value: `${result.parameters.duration_hrs.toFixed(3)} hrs`,
                      err: null,
                    },
                    {
                      label: "SNR",
                      value: result.parameters.snr.toFixed(2),
                      err: null,
                    },
                  ].map((m) => (
                    <div
                      key={m.label}
                      style={{ background: "#0c1220", padding: 20 }}
                    >
                      <p className="label" style={{ marginBottom: 8 }}>
                        {m.label}
                      </p>
                      <p
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 18,
                          color: "#e2e8f0",
                          marginBottom: 2,
                        }}
                      >
                        {m.value}
                      </p>
                      {m.err && (
                        <p
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: 10,
                            color: "#475569",
                          }}
                        >
                          {m.err}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quality */}
                <div
                  style={{
                    background: "#0c1220",
                    border: "1px solid #1e293b",
                    borderRadius: 2,
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <p className="label">Signal Quality</p>
                    <span
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: 12,
                        padding: "4px 10px",
                        background:
                          result.quality.confidence === "HIGH"
                            ? "rgba(34,197,94,0.1)"
                            : result.quality.confidence === "MEDIUM"
                            ? "rgba(234,179,8,0.1)"
                            : "rgba(239,68,68,0.1)",
                        color:
                          result.quality.confidence === "HIGH"
                            ? "#22c55e"
                            : result.quality.confidence === "MEDIUM"
                            ? "#eab308"
                            : "#ef4444",
                        borderRadius: 2,
                      }}
                    >
                      {result.quality.confidence}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 12,
                      color: "#475569",
                      marginBottom: 12,
                    }}
                  >
                    Score: {result.quality.score}/100
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {result.quality.flags.map((f) => (
                      <span
                        key={f}
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 10,
                          padding: "3px 8px",
                          background: "#0c1220",
                          border: "1px solid #1e293b",
                          color: "#f97316",
                          borderRadius: 2,
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Light Curve Figure */}
                {result.figure_url && (
                  <div
                    style={{
                      background: "#0c1220",
                      border: "1px solid #1e293b",
                      borderRadius: 2,
                      padding: 16,
                    }}
                  >
                    <p className="label" style={{ marginBottom: 12 }}>
                      Diagnostic Figure
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`http://localhost:8000${result.figure_url}`}
                      alt={`Light curve for TIC ${result.tic_id}`}
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: 2,
                        display: "block",
                      }}
                    />
                  </div>
                )}

                {/* Star Info */}
                <div
                  style={{
                    background: "#0c1220",
                    border: "1px solid #1e293b",
                    borderRadius: 2,
                    padding: 24,
                  }}
                >
                  <p className="label" style={{ marginBottom: 16 }}>
                    Star Information
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: 11,
                          color: "#475569",
                          marginBottom: 4,
                        }}
                      >
                        TIC ID
                      </p>
                      <a
                        href={`https://mast.stsci.edu/portal/Mashup/Clients/Mast/Portal.html?searchQuery=${result.tic_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 13,
                          color: "#f97316",
                          textDecoration: "none",
                        }}
                      >
                        TIC {result.tic_id} ↗
                      </a>
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: 11,
                          color: "#475569",
                          marginBottom: 4,
                        }}
                      >
                        Radius Ratio (Rp/Rs)
                      </p>
                      <p
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 13,
                          color: "#e2e8f0",
                        }}
                      >
                        {result.parameters.radius_ratio.toFixed(5)}
                      </p>
                      <p
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: 11,
                          color: "#94a3b8",
                          marginTop: 2,
                        }}
                      >
                        {getRadiusInterpretation(result.parameters.radius_ratio)}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: 11,
                          color: "#475569",
                          marginBottom: 4,
                        }}
                      >
                        Period Interpretation
                      </p>
                      <p
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: 12,
                          color: "#e2e8f0",
                        }}
                      >
                        {getPeriodInterpretation(result.parameters.period_days)}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: 11,
                          color: "#475569",
                          marginBottom: 4,
                        }}
                      >
                        SNR Interpretation
                      </p>
                      <p
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: 12,
                          color: "#e2e8f0",
                        }}
                      >
                        {getSnrInterpretation(result.parameters.snr)}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: "1px solid #1e293b",
                    }}
                  >
                    <a
                      href="https://exoplanetarchive.ipac.caltech.edu"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: 11,
                        color: "#6366f1",
                        textDecoration: "none",
                      }}
                    >
                      NASA Exoplanet Archive ↗
                    </a>
                  </div>
                </div>

                {/* Technical Analysis */}
                <div
                  style={{
                    background: "#0c1220",
                    border: "1px solid #1e293b",
                    borderRadius: 2,
                    padding: 24,
                  }}
                >
                  <p className="label" style={{ marginBottom: 16 }}>
                    Technical Analysis
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: 12,
                          color: "#94a3b8",
                        }}
                      >
                        depth_ratio
                      </span>
                      <span
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 12,
                          color: "#f97316",
                        }}
                      >
                        {result.parameters.depth_ppm > 0 && result.parameters.scatter_ppm > 0
                          ? (result.parameters.depth_ppm / result.parameters.scatter_ppm).toFixed(2)
                          : "0.00"}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 11,
                        color: "#475569",
                        lineHeight: 1.5,
                      }}
                    >
                      Depth signal relative to noise floor. Higher means clearer
                      transit signature.
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: 12,
                          color: "#94a3b8",
                        }}
                      >
                        duty_cycle
                      </span>
                      <span
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 12,
                          color: "#f97316",
                        }}
                      >
                        {result.parameters.period_days > 0
                          ? (result.parameters.duration_hrs / 24 / result.parameters.period_days).toFixed(5)
                          : "0.00000"}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 11,
                        color: "#475569",
                        lineHeight: 1.5,
                      }}
                    >
                      Fraction of orbit spent in transit. Planets: ~1–5%. EBs: can
                      be wider.
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: 12,
                          color: "#94a3b8",
                        }}
                      >
                        scatter_ppm
                      </span>
                      <span
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 12,
                          color: "#f97316",
                        }}
                      >
                        {result.parameters.scatter_ppm.toFixed(1)} ppm
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 11,
                        color: "#475569",
                        lineHeight: 1.5,
                      }}
                    >
                      TESS typical noise: 500–2000 ppm for 12th mag stars.
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: 20,
                      paddingTop: 16,
                      borderTop: "1px solid #1e293b",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 11,
                        color: "#475569",
                        marginBottom: 8,
                      }}
                    >
                      Classification rationale
                    </p>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12,
                        color: "#e2e8f0",
                        lineHeight: 1.6,
                      }}
                    >
                      {result.classification === "PLANET CANDIDATE" &&
                        "Shallow depth, good SNR, short duration consistent with planetary transit."}
                      {result.classification === "ECLIPSING BINARY" &&
                        "Deep dip exceeds planetary range — likely stellar companion."}
                      {result.classification === "BLEND" &&
                        "Depth ratio inconsistent — possible background contamination."}
                      {result.classification === "NOISE / OTHER" &&
                        "SNR below detection threshold — signal indistinguishable from noise."}
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: 16,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <div>
                      <p className="label" style={{ marginBottom: 6 }}>
                        BLS Period Range
                      </p>
                      <p
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 11,
                          color: "#94a3b8",
                        }}
                      >
                        0.5 – 14.0 days
                      </p>
                    </div>
                    <div>
                      <p className="label" style={{ marginBottom: 6 }}>
                        Detrending Window
                      </p>
                      <p
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 11,
                          color: "#94a3b8",
                        }}
                      >
                        101 cadences (~200 min)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
