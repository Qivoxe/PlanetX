"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

interface ResultsResponse {
  total: number;
  results: AnalysisResult[];
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

export default function Results() {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AnalysisResult | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);

  const fetchResults = async () => {
    try {
      const res = await fetch(`${API}/results`);
      if (!res.ok) throw new Error("Failed to fetch results");
      const data: ResultsResponse = await res.json();
      setResults(data.results);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch results";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchResults();
    const interval = setInterval(fetchResults, 30000);
    return () => clearInterval(interval);
  }, []);

  const selectResult = async (ticId: number) => {
    setSelectedLoading(true);
    setSelected(null);
    try {
      const res = await fetch(`${API}/result/${ticId}`);
      if (!res.ok) throw new Error("Failed to load result");
      const data: AnalysisResult = await res.json();
      setSelected(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load result";
      setError(message);
    } finally {
      setSelectedLoading(false);
    }
  };

  const stats = {
    total: results.length,
    planets: results.filter((r) => r.classification === "PLANET CANDIDATE").length,
    binaries: results.filter((r) => r.classification === "ECLIPSING BINARY").length,
    blends: results.filter((r) => r.classification === "BLEND").length,
    noise: results.filter((r) => r.classification === "NOISE / OTHER").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#030712" }}>
      <SpaceBackground />
      <Navbar />

      <main style={{ position: "relative", zIndex: 10, paddingTop: 72 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px" }}>
          <p className="label label-orange" style={{ marginBottom: 12 }}>
            Results
          </p>
          <h1
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#e2e8f0",
              marginBottom: 32,
              lineHeight: 1,
            }}
          >
            Batch Results
          </h1>

          {/* Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1,
              background: "#1e293b",
              borderRadius: 2,
              overflow: "hidden",
              marginBottom: 32,
            }}
          >
            {[
              { label: "Total Processed", value: stats.total.toString() },
              { label: "Planet Candidates", value: stats.planets.toString(), accent: "#22c55e" },
              { label: "Eclipsing Binaries", value: stats.binaries.toString(), accent: "#ef4444" },
              { label: "Blends", value: stats.blends.toString(), accent: "#eab308" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "#0c1220",
                  padding: 24,
                  borderLeft: s.accent ? `3px solid ${s.accent}` : "none",
                }}
              >
                <p className="label" style={{ marginBottom: 8 }}>
                  {s.label}
                </p>
                <p
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 28,
                    fontWeight: 500,
                    color: s.accent || "#e2e8f0",
                  }}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>

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

          {loading && results.length === 0 ? (
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
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 12,
                }}
              >
                Loading results...
              </p>
            </div>
          ) : results.length === 0 ? (
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
                No stars analyzed yet
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, marginBottom: 24 }}>
                Run the pipeline on a TIC target to see results here.
              </p>
              <Link href="/Dashboard">
                <button className="btn-primary">Go to Dashboard →</button>
              </Link>
            </div>
          ) : (
            <div
              style={{
                border: "1px solid #1e293b",
                borderRadius: 2,
                overflow: "hidden",
                background: "#0c1220",
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e293b" }}>
                      {["TIC ID", "Classification", "Confidence", "Period (d)", "Depth (ppm)", "SNR", "Time"].map(
                        (h) => (
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
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr
                        key={r.tic_id}
                        onClick={() => selectResult(r.tic_id)}
                        style={{
                          borderBottom: "1px solid #1e293b",
                          cursor: "pointer",
                          borderLeft: selected?.tic_id === r.tic_id ? "3px solid #f97316" : "3px solid transparent",
                          background:
                            selected?.tic_id === r.tic_id
                              ? "rgba(249,115,22,0.05)"
                              : "transparent",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (selected?.tic_id !== r.tic_id) {
                            e.currentTarget.style.background = "rgba(249,115,22,0.03)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selected?.tic_id !== r.tic_id) {
                            e.currentTarget.style.background = "transparent";
                          }
                        }}
                      >
                        <td
                          style={{
                            padding: "14px 16px",
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: 13,
                            color: "#f97316",
                          }}
                        >
                          {r.tic_id}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: 12,
                              fontWeight: 500,
                              color: getClassColor(r.classification),
                            }}
                          >
                            {r.classification}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: 13,
                            color: "#e2e8f0",
                          }}
                        >
                          {r.confidence.toFixed(1)}%
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: 13,
                            color: "#e2e8f0",
                          }}
                        >
                          {r.parameters.period_days.toFixed(4)}
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: 13,
                            color: "#e2e8f0",
                          }}
                        >
                          {r.parameters.depth_ppm.toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: 13,
                            color: "#e2e8f0",
                          }}
                        >
                          {r.parameters.snr.toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: 13,
                            color: "#475569",
                          }}
                        >
                          —
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Selected Result Detail */}
          {selectedLoading && (
            <div
              style={{
                marginTop: 24,
                padding: 40,
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
                }}
              >
                Loading cached result...
              </p>
            </div>
          )}

          {selected && !selectedLoading && (
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 20 }}>
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
                        color: getClassColor(selected.classification),
                      }}
                    >
                      {selected.classification}
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
                      {selected.confidence.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {Object.entries(selected.probabilities).map(([cls, prob]) => (
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
                    value: `${selected.parameters.period_days.toFixed(4)} d`,
                    err: `±${selected.parameters.period_err_days.toFixed(5)}`,
                  },
                  {
                    label: "Depth",
                    value: `${selected.parameters.depth_ppm.toFixed(2)} ppm`,
                    err: `±${selected.parameters.depth_err_ppm.toFixed(2)}`,
                  },
                  {
                    label: "Duration",
                    value: `${selected.parameters.duration_hrs.toFixed(3)} hrs`,
                    err: null,
                  },
                  {
                    label: "SNR",
                    value: selected.parameters.snr.toFixed(2),
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
                        selected.quality.confidence === "HIGH"
                          ? "rgba(34,197,94,0.1)"
                          : selected.quality.confidence === "MEDIUM"
                          ? "rgba(234,179,8,0.1)"
                          : "rgba(239,68,68,0.1)",
                      color:
                        selected.quality.confidence === "HIGH"
                          ? "#22c55e"
                          : selected.quality.confidence === "MEDIUM"
                          ? "#eab308"
                          : "#ef4444",
                      borderRadius: 2,
                    }}
                  >
                    {selected.quality.confidence}
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
                  Score: {selected.quality.score}/100
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {selected.quality.flags.map((f) => (
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

              {selected.figure_url && (
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
                    src={`http://localhost:8000${selected.figure_url}`}
                    alt={`Light curve for TIC ${selected.tic_id}`}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: 2,
                      display: "block",
                    }}
                  />
                </div>
              )}

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
                      href={`https://mast.stsci.edu/portal/Mashup/Clients/Mast/Portal.html?searchQuery=${selected.tic_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: 13,
                        color: "#f97316",
                        textDecoration: "none",
                      }}
                    >
                      TIC {selected.tic_id} ↗
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
                      {selected.parameters.radius_ratio.toFixed(5)}
                    </p>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 11,
                        color: "#94a3b8",
                        marginTop: 2,
                      }}
                    >
                      {getRadiusInterpretation(selected.parameters.radius_ratio)}
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
                      {getPeriodInterpretation(selected.parameters.period_days)}
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
                      {getSnrInterpretation(selected.parameters.snr)}
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
                      {selected.parameters.depth_ppm > 0 && selected.parameters.scatter_ppm > 0
                        ? (selected.parameters.depth_ppm / selected.parameters.scatter_ppm).toFixed(2)
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
                      {selected.parameters.period_days > 0
                        ? (selected.parameters.duration_hrs / 24 / selected.parameters.period_days).toFixed(5)
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
                      {selected.parameters.scatter_ppm.toFixed(1)} ppm
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
                    {selected.classification === "PLANET CANDIDATE" &&
                      "Shallow depth, good SNR, short duration consistent with planetary transit."}
                    {selected.classification === "ECLIPSING BINARY" &&
                      "Deep dip exceeds planetary range — likely stellar companion."}
                    {selected.classification === "BLEND" &&
                      "Depth ratio inconsistent — possible background contamination."}
                    {selected.classification === "NOISE / OTHER" &&
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
      </main>

      <Footer />
    </div>
  );
}
