import { useState } from "react";

export default function StandingsTable({ teams }) {
  const [hoveredRow, setHoveredRow] = useState(null);

  const sorted = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = (a.goals_for || 0) - (a.goals_against || 0);
    const gdB = (b.goals_for || 0) - (b.goals_against || 0);
    if (gdB !== gdA) return gdB - gdA;
    return a.name.localeCompare(b.name);
  });

  return (
    <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #b3d4fc", overflow: "hidden", boxShadow: "0 8px 24px rgba(0, 86, 179, 0.05)" }}>
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #b3d4fc",
          color: "#0056b3",
          fontWeight: 800,
          fontSize: 14,
          background: "#f8f9fa",
          letterSpacing: 0.5
        }}
      >
        📊 TURNIR JADVALI
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f6fc", borderBottom: "1px solid #b3d4fc" }}>
              {["#", "Jamoa", "O", "G", "D", "M", "GF", "GA", "TN", "Ball"].map((h, i) => (
                <th
                  key={i}
                  style={{
                    color: "#4a7090",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "12px 14px",
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
              const gf = team.goals_for || 0;
              const ga = team.goals_against || 0;
              const gd = gf - ga;
              const played = (team.wins || 0) + (team.draws || 0) + (team.losses || 0);
              const isFirst = idx === 0;
              const isHovered = hoveredRow === team.id;

              return (
                <tr
                  key={team.id}
                  onMouseEnter={() => setHoveredRow(team.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    borderBottom: "1px solid #edf2f7",
                    background: isHovered ? "#f0f6fc" : isFirst ? "rgba(0, 86, 179, 0.02)" : "transparent",
                    transition: "background 0.2s ease",
                  }}
                >
                  <td style={{ padding: "14px 12px", textAlign: "center", color: isFirst ? "#0056b3" : "#5a738e", fontWeight: 800, fontSize: 13 }}>
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{team.logo || "⚽️"}</span>
                      <span style={{ color: "#0f2235", fontWeight: 700, fontSize: 14 }}>{team.name}</span>
                    </div>
                  </td>
                  {[played, team.wins || 0, team.draws || 0, team.losses || 0, gf, ga, gd >= 0 ? "+" + gd : gd].map(
                    (v, i) => (
                      <td
                        key={i}
                        style={{
                          padding: "14px 12px",
                          textAlign: "center",
                          color: i === 6 ? (gd > 0 ? "#2ec4b6" : gd < 0 ? "#dc3545" : "#5a738e") : "#5a738e",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {v}
                      </td>
                    )
                  )}
                  <td style={{ padding: "14px 12px", textAlign: "center" }}>
                    <span
                      style={{
                        background: isFirst ? "#0056b3" : "#e1eefc",
                        color: isFirst ? "#ffffff" : "#0056b3",
                        fontWeight: 800,
                        fontSize: 13,
                        borderRadius: 6,
                        padding: "5px 10px",
                        display: "inline-block",
                        minWidth: 20
                      }}
                    >
                      {team.points || 0}
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
