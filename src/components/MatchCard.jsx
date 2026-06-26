export default function MatchCard({ match, onSelect }) {
  const finished = match.status === "finished";
  
  return (
    <div
      onClick={() => finished && onSelect(match)}
      style={{
        background: "#ffffff",
        border: "1px solid #b3d4fc",
        borderRadius: 16,
        padding: "16px 20px",
        marginBottom: 12,
        cursor: finished ? "pointer" : "default",
        boxShadow: "0 4px 12px rgba(0, 86, 179, 0.03)",
        transition: "all 0.2s ease-in-out",
      }}
      onMouseEnter={(e) => {
        if (finished) {
          e.currentTarget.style.borderColor = "#0056b3";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 18px rgba(0, 86, 179, 0.08)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#b3d4fc";
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 86, 179, 0.03)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ color: "#5a738e", fontSize: 12, fontWeight: 600 }}>
          📅 {match.match_date} • Bolodala Arena
        </span>
        <span
          style={{
            background: finished ? "#e1eefc" : "#fff3cd",
            color: finished ? "#0056b3" : "#856404",
            border: finished ? "1px solid #b3d4fc" : "1px solid #ffeeba",
            borderRadius: 6,
            padding: "3px 10px",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.5
          }}
        >
          {finished ? "TUGADI" : "KUTILMOQDA"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1, textAlign: "right" }}>
          <div style={{ color: "#0f2235", fontWeight: 800, fontSize: 16 }}>{match.home_team}</div>
        </div>
        
        <div style={{ padding: "0 20px", textAlign: "center", minWidth: 100 }}>
          {finished ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <span style={{ color: "#0f2235", fontWeight: 900, fontSize: 26 }}>{match.home_score}</span>
              <span style={{ color: "#a0b2c6", fontSize: 20, fontWeight: 700 }}>:</span>
              <span style={{ color: "#0f2235", fontWeight: 900, fontSize: 26 }}>{match.away_score}</span>
            </div>
          ) : (
            <span style={{ color: "#e67e22", transform: "scale(1.1)", display: "inline-block", fontWeight: 900, fontSize: 18 }}>VS</span>
          )}
        </div>

        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ color: "#0f2235", fontWeight: 800, fontSize: 16 }}>{match.away_team}</div>
        </div>
      </div>

      {finished && (
        <div style={{ textAlign: "center", marginTop: 12, pt: 8, borderTop: "1px dashed #edf2f7", color: "#0056b3", fontSize: 12, fontWeight: 600 }}>
          Batafsil o'yin qaydnomasi va statistika →
        </div>
      )}
    </div>
  );
}
