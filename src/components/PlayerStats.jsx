function StatCard({ title, emptyText, children }) {
  return (
    <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #b3d4fc", overflow: "hidden", marginBottom: 20, boxShadow: "0 8px 24px rgba(0, 86, 179, 0.05)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #b3d4fc", color: "#0056b3", fontWeight: 800, fontSize: 14, background: "#f8f9fa", letterSpacing: 0.5 }}>
        {title}
      </div>
      {children.length === 0 ? (
        <div style={{ padding: 28, color: "#5a738e", textAlign: "center", fontSize: 13 }}>{emptyText}</div>
      ) : (
        children
      )}
    </div>
  );
}

function Row({ rank, name, sub, badgeValue, badgeColor }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderBottom: "1px solid #edf2f7",
        background: rank === 1 ? "rgba(0, 86, 179, 0.02)" : "transparent",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ color: "#4a7090", fontWeight: 800, minWidth: 20, fontSize: 13 }}>
          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
        </span>
        <div>
          <div style={{ color: "#0f2235", fontWeight: 700, fontSize: 14 }}>{name}</div>
          {sub && <div style={{ color: "#5a738e", fontSize: 11, marginTop: 2, fontWeight: 500 }}>{sub}</div>}
        </div>
      </div>
      <div
        style={{
          background: badgeColor || "#0056b3",
          color: "#ffffff",
          fontWeight: 800,
          fontSize: 13,
          borderRadius: 8,
          padding: "5px 12px",
          minWidth: 24,
          textAlign: "center"
        }}
      >
        {badgeValue}
      </div>
    </div>
  );
}

export default function PlayerStats({ allMatchPlayers }) {
  // ===== FAQAT TO'PURARLARNL HISOBLASH =====
  const playerMap = {};
  
  (allMatchPlayers || []).forEach((p) => {
    if (!playerMap[p.name]) {
      playerMap[p.name] = { name: p.name, goals: 0, apps: 0 };
    }
    playerMap[p.name].goals += (p.goals || 0);
    playerMap[p.name].apps += 1;
  });

  // Goli bor hamma o'yinchilarni saralash (barcha gollar ko'rinadi)
  const topScorers = Object.values(playerMap)
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals);

  return (
    <div>
      <StatCard 
        title="⚽️ TO'PURARLAR RO'YXATI" 
        emptyText="Hozircha ligada gol urilmagan"
        children={topScorers.map((p, i) => (
          <Row 
            key={p.name} 
            rank={i + 1} 
            name={p.name} 
            sub={p.apps + " ta o'yinda qatnashgan"} 
            badgeValue={p.goals + " ta gol"} 
            badgeColor="#2ecc71" 
          />
        ))} 
      />
    </div>
  );
}
