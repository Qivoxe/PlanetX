"use client";

const STAGES = [
  { num: "01", name: "Data Ingestion",    desc: "TESS FITS via NASA MAST" },
  { num: "02", name: "Preprocessing",     desc: "5σ clip · normalize · detrend" },
  { num: "03", name: "BLS Detection",     desc: "Periodogram transit search" },
  { num: "04", name: "Classification",    desc: "Random Forest · 4 classes" },
  { num: "05", name: "Parameter Fitting", desc: "Period · depth · duration" },
  { num: "06", name: "Visualization",     desc: "4-panel diagnostic figure" },
];

export default function Pipeline({ activeStage = -1 }: { activeStage?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {STAGES.map((s, i) => {
        const done   = activeStage > i;
        const active = activeStage === i;
        return (
          <div key={s.num} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: done || active ? "#f97316" : "#1e293b", minWidth: 24, transition: "color 0.3s" }}>
              {s.num}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: done ? "#f97316" : active ? "#e2e8f0" : "#334155", transition: "color 0.3s" }}>
                  {s.name}
                </span>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#334155" }}>
                  {done && <span style={{ color: "#f97316" }}>✓</span>}
                  {active && <span style={{ color: "#e2e8f0" }} className="animate-pulse">···</span>}
                </span>
              </div>
              <div className="pipeline-track">
                <div className="pipeline-fill" style={{ width: done ? "100%" : active ? "55%" : "0%" }} />
              </div>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#1e293b", marginTop: 4 }}>{s.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}