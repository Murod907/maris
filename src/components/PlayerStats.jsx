import { getRatingColor } from "../lib/helpers";

export default function PlayerStats({ allMatchPlayers }) {
  const playerMap = {};
  allMatchPlayers.forEach((p) => {
    if (!playerMap[p.name]) {
      playerMap[p.name] = { name: p.name, goals: 0, assists: 0, ratings: [], apps: 0 };
    }
    playerMap[p.name].goals += p.goals;
    playerMap[p.name].assists += p.assists;
    playerMap[p.name].ratings.push(Number(p.rating));
    playerMap[p.name].apps += 1;
  });

  const players = Object.values(playerMap)
    .map((p) => ({
      ...p,
      avgRating: p.ratings.length ? p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length : 0,
    }))
    .sort((a, b) => b.goals - a.goals || b.avgRating - a.avgRating);

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
        👤 O'YINCHILAR STATISTIKASI
      </div>
      {players.map((p, i) => (
        <div
          key={p.name}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            borderBottom: "1px solid #1a3050",
            background: i === 0 ? "rgba(0,212,170,0.04)" : "transparent",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "#4a7090", fontWeight: 700, minWidth: 20 }}>{i + 1}</span>
            <div>
              <div style={{ color: "#e8f0f8", fontWeight: 700, fontSize: 14 }}>{p.name}</div>
              <div style={{ color: "#4a7090", fontSize: 11, marginTop: 2 }}>
                {p.apps} o'yin • ⚽ {p.goals} • 🎯 {p.assists}
              </div>
            </div>
          </div>
          <div
            style={{
              background: getRatingColor(p.avgRating),
              color: "#0D1B2A",
              fontWeight: 900,
              fontSize: 15,
              borderRadius: 8,
              padding: "5px 12px",
            }}
          >
            {p.avgRating.toFixed(1)}
          </div>
        </div>
      ))}
      {players.length === 0 && (
        <div style={{ padding: 24, color: "#4a7090", textAlign: "center" }}>Hozircha ma'lumot yo'q</div>
      )}
    </div>
  );
}
