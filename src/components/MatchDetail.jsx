import { getRatingColor, getRatingBg } from "../lib/helpers";

export default function MatchDetail({ match, players, onClose }) {
  const homePlayers = players.filter((p) => p.side === "home");
  const awayPlayers = players.filter((p) => p.side === "away");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 34, 53, 0.7)",
        backdropFilter: "blur(6px)",
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
          background: "#ffffff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 600,
          border: "1px solid #b3d4fc",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 40px rgba(0, 86, 179, 0.15)",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #b3d4fc",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f8f9fa",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <div>
            <div style={{ color: "#0f2235", fontWeight: 900, fontSize: 18 }}>
              {match.home_team} <span style={{ color: "#0056b3" }}>{match.home_score}:{match.away_score}</span> {match.away_team}
            </div>
            <div style={{ color: "#5a738e", fontSize: 12, marginTop: 4, fontWeight: 600 }}>
              📅 {match.match_date} • O'yin bayonnomasi
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ 
              background: "#e1eefc", 
              border: "none", 
              color: "#0056b3", 
              fontSize: 16, 
              cursor: "pointer", 
              width: 32, 
              height: 32, 
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold"
            }}
          >
            ✕
          </button>
        </div>

        {[
          { label: match.home_team, list: homePlayers },
          { label: match.away_team, list: awayPlayers },
        ].map((side) => (
          <div key={side.label} style={{ padding: "18px 24px", borderBottom: "1px solid #edf2f7" }}>
            <div
              style={{
                color: "#0056b3",
                fontWeight: 800,
                fontSize: 12,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              ⚽️ {side.label}
            </div>
            {side.list.length === 0 ? (
              <div style={{ color: "#8a9eb2", fontSize: 13, fontStyle: "italic", padding: "6px 0" }}>
                Ushbu jamoa o'yinchilari haqida ma'lumot kiritilmagan
              </div>
            ) : (
              side.list.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: 10,
                    marginBottom: 8,
                    background: getRatingBg(p.rating),
                    border: `1px solid ${getRatingColor(p.rating)}22`,
                  }}
                >
                  <div>
                    <div style={{ color: "#0f2235", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                      {p.name}
                      {p.is_clean_sheet && (
                        <span style={{ background: "#2ec4b6", color: "#ffffff", fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                          🧤 Quruq o'yin
                        </span>
                      )}
                    </div>
                    <div style={{ color: "#5a738e", fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                      ⚽️ {p.goals || 0} gol • 🎯 {p.assists || 0} assist
                    </div>
                  </div>
                  <div
                    style={{
                      background: getRatingColor(p.rating),
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: 15,
                      borderRadius: 8,
                      padding: "5px 10px",
                      minWidth: 40,
                      textAlign: "center",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
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
