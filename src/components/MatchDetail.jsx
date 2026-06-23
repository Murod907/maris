import { getRatingColor, getRatingBg } from "../lib/helpers";

export default function MatchDetail({ match, players, onClose }) {
  const homePlayers = players.filter((p) => p.side === "home");
  const awayPlayers = players.filter((p) => p.side === "away");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0f2235",
          borderRadius: 16,
          width: "100%",
          maxWidth: 600,
          border: "1px solid #00D4AA",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #1e3a55",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ color: "#00D4AA", fontWeight: 800, fontSize: 18 }}>
              {match.home_team} {match.home_score}:{match.away_score} {match.away_team}
            </div>
            <div style={{ color: "#4a7090", fontSize: 12, marginTop: 4 }}>📅 {match.match_date}</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#4a7090", fontSize: 20, cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {[
          { label: match.home_team, list: homePlayers },
          { label: match.away_team, list: awayPlayers },
        ].map((side) => (
          <div key={side.label} style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a55" }}>
            <div
              style={{
                color: "#7a9bb5",
                fontWeight: 700,
                fontSize: 12,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {side.label}
            </div>
            {side.list.length === 0 ? (
              <div style={{ color: "#4a7090", fontSize: 13 }}>Ma'lumot yo'q</div>
            ) : (
              side.list.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: 8,
                    marginBottom: 6,
                    background: getRatingBg(p.rating),
                    border: 1px solid ${getRatingColor(p.rating)}22,
                  }}
                >
                  <div>
                    <div style={{ color: "#e8f0f8", fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                    <div style={{ color: "#7a9bb5", fontSize: 11, marginTop: 2 }}>
                      ⚽ {p.goals} gol • 🎯 {p.assists} assist
                    </div>
                  </div>
                  <div
                    style={{
                      background: getRatingColor(p.rating),
                      color: "#0D1B2A",
                      fontWeight: 900,
                      fontSize: 18,
                      borderRadius: 8,
                      padding: "6px 12px",
                      minWidth: 52,
                      textAlign: "center",
                    }}
                  >
                    {Number(p.rating).toFixed(1)}
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
