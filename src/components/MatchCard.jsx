export default function MatchCard({ match, onSelect }) {
  const finished = match.status === "finished";
  return (
    <div
      onClick={() => finished && onSelect(match)}
      style={{
        background: "linear-gradient(135deg, #0f2235 0%, #132840 100%)",
        border: "1px solid #1e3a55",
        borderRadius: 12,
        padding: "16px 20px",
        marginBottom: 10,
        cursor: finished ? "pointer" : "default",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#E8F0F8")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e3a55")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ color: "#4a7090", fontSize: 11, fontWeight: 600 }}>
          📅 {match.match_date} • Bolodala maydonchasi
        </span>
        <span
          style={{
            background: finished ? "rgba(232,240,248,0.1)" : "rgba(255,193,7,0.1)",
            color: finished ? "#E8F0F8" : "#FFC107",
            border: 1px solid ${finished ? "#E8F0F8" : "#FFC107"},
            borderRadius: 4,
            padding: "2px 8px",
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {finished ? "TUGADI" : "KUTILMOQDA"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1, textAlign: "right" }}>
          <div style={{ color: "#e8f0f8", fontWeight: 800, fontSize: 16 }}>{match.home_team}</div>
        </div>
        <div style={{ padding: "0 20px", textAlign: "center", minWidth: 100 }}>
          {finished ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 28 }}>{match.home_score}</span>
              <span style={{ color: "#4a7090", fontSize: 18 }}>:</span>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 28 }}>{match.away_score}</span>
            </div>
          ) : (
            <span style={{ color: "#FFC107", fontWeight: 800, fontSize: 22 }}>VS</span>
          )}
        </div>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ color: "#e8f0f8", fontWeight: 800, fontSize: 16 }}>{match.away_team}</div>
        </div>
      </div>

      {finished && (
        <div style={{ textAlign: "center", marginTop: 8, color: "#4a7090", fontSize: 11 }}>
          Batafsil ko'rish uchun bosing →
        </div>
      )}
    </div>
  );
}
