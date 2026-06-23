export default function StandingsTable({ teams }) {
  const sorted = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goals_for - a.goals_against;
    const gdB = b.goals_for - b.goals_against;
    return gdB - gdA;
  });

  return (
    <div style={{ background: "#0f2235", borderRadius: 12, border: "1px solid #1e3a55", overflow: "hidden" }}>
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid #1e3a55",
          color: "#00D4AA",
          fontWeight: 800,
          fontSize: 14,
        }}
      >
        📊 TURNIR JADVALI
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0a1a2a" }}>
              {["#", "Jamoa", "O", "G", "D", "M", "GF", "GA", "FG", "Ball"].map((h, i) => (
                <th
                  key={i}
                  style={{
                    color: "#4a7090",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "10px 12px",
                    textAlign: i <= 1 ? "left" : "center",
                    letterSpacing: 0.5,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((team, idx) => {
              const gd = team.goals_for - team.goals_against;
              const played = team.wins + team.draws + team.losses;
              const highlight = idx === 0;
              return (
                <tr
                  key={team.id}
                  style={{
                    borderBottom: "1px solid #1a3050",
                    background: highlight ? "rgba(0,212,170,0.05)" : "transparent",
                  }}
                >
                  <td style={{ padding: 12, color: highlight ? "#00D4AA" : "#7a9bb5", fontWeight: 800, fontSize: 13 }}>
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                  </td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{team.logo}</span>
                      <span style={{ color: "#e8f0f8", fontWeight: 700, fontSize: 14 }}>{team.name}</span>
                    </div>
                  </td>
                  {[played, team.wins, team.draws, team.losses, team.goals_for, team.goals_against, gd >= 0 ? "+" + gd : gd].map(
                    (v, i) => (
                      <td
                        key={i}
                        style={{
                          padding: 12,
                          textAlign: "center",
                          color: i === 6 ? (gd > 0 ? "#00D4AA" : gd < 0 ? "#e74c3c" : "#7a9bb5") : "#7a9bb5",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {v}
                      </td>
                    )
                  )}
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <span
                      style={{
                        background: highlight ? "#00D4AA" : "#1e3a55",
                        color: highlight ? "#0D1B2A" : "#e8f0f8",
                        fontWeight: 900,
                        fontSize: 15,
                        borderRadius: 6,
                        padding: "4px 10px",
                      }}
                    >
                      {team.points}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
