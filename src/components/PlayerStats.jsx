
import { getRatingColor } from "../lib/helpers";

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
          background: badgeColor || "#e1eefc",
          color: badgeColor ? "#ffffff" : "#0056b3",
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

export default function PlayerStats({ allMatchPlayers, matches, teams }) {
  // ===== O'yinchilar bo'yicha yig'indi =====
  const playerMap = {};
  (allMatchPlayers || []).forEach((p) => {
    if (!playerMap[p.name]) {
      playerMap[p.name] = { name: p.name, goals: 0, assists: 0, ratings: [], apps: 0, cleanSheets: 0 };
    }
    playerMap[p.name].goals += (p.goals || 0);
    playerMap[p.name].assists += (p.assists || 0);
    playerMap[p.name].ratings.push(Number(p.rating || 0));
    playerMap[p.name].apps += 1;
    if (p.is_clean_sheet) {
      playerMap[p.name].cleanSheets += 1;
    }
  });

  const players = Object.values(playerMap).map((p) => ({
    ...p,
    avgRating: p.ratings.length ? p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length : 0,
  }));

  const topScorers = [...players].filter((p) => p.goals > 0).sort((a, b) => b.goals - a.goals).slice(0, 5);
  const topAssisters = [...players].filter((p) => p.assists > 0).sort((a, b) => b.assists - a.assists).slice(0, 5);
  const topRated = [...players].sort((a, b) => b.avgRating - a.avgRating).slice(0, 5);
  const topIndividualCleanSheets = [...players].filter((p) => p.cleanSheets > 0).sort((a, b) => b.cleanSheets - a.cleanSheets).slice(0, 5);

  // ===== Jamoalar bo'yicha yig'indi =====
  const finished = (matches || []).filter((m) => m.status === "finished" && m.home_score != null && m.away_score != null);

  const cleanSheetsMap = {};
  (teams || []).forEach((t) => (cleanSheetsMap[t.name] = 0));
  finished.forEach((m) => {
    if (Number(m.away_score) === 0 && cleanSheetsMap[m.home_team] != null) cleanSheetsMap[m.home_team] += 1;
    if (Number(m.home_score) === 0 && cleanSheetsMap[m.away_team] != null) cleanSheetsMap[m.away_team] += 1;
  });

  const topCleanSheets = (teams || [])
    .map((t) => ({ name: t.name, logo: t.logo, cleanSheets: cleanSheetsMap[t.name] || 0 }))
    .filter((t) => t.cleanSheets > 0)
    .sort((a, b) => b.cleanSheets - a.cleanSheets)
    .slice(0, 5);

  const teamRatingsMap = {};
  (teams || []).forEach((t) => (teamRatingsMap[t.name] = []));
  (allMatchPlayers || []).forEach((p) => {
    const match = finished.find((m) => m.id === p.match_id);
    if (!match) return;
    const teamName = p.side === "home" ? match.home_team : match.away_team;
    if (teamRatingsMap[teamName]) teamRatingsMap[teamName].push(Number(p.rating || 0));
  });

  const topTeamRating = (teams || [])
    .map((t) => {
      const ratings = teamRatingsMap[t.name] || [];
      const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      return { name: t.name, logo: t.logo, avg, count: ratings.length };
    })
    .filter((t) => t.count > 0)
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  return (
    <div>
      <StatCard title="⚽️ TO'PURARLAR" emptyText="Hozircha gol urilmagan" children={topScorers.map((p, i) => (
        <Row key={p.name} rank={i + 1} name={p.name} sub={`${p.apps} o'yin`} badgeValue={`${p.goals} ta`} badgeColor={getRatingColor(p.avgRating)} />
      ))} />

      <StatCard title="🎯 ASSISTENTLAR" emptyText="Hozircha assist berilmagan" children={topAssisters.map((p, i) => (
        <Row key={p.name} rank={i + 1} name={p.name} sub={`${p.apps} o'yin`} badgeValue={`${p.assists} ta`} badgeColor={getRatingColor(p.avgRating)} />
      ))} />

      <StatCard title="⭐️ ENG YUQORI OʻRTACHA BALL (FUTBOLCHILAR)" emptyText="Hozircha ma'lumot yo'q" children={topRated.map((p, i) => (
        <Row key={p.name} rank={i + 1} name={p.name} sub={`${p.apps} o'yin`} badgeValue={p.avgRating.toFixed(1)} badgeColor={getRatingColor(p.avgRating)} />
      ))} />

      <StatCard title="🧤 INDIVIDUAL QURUQ O'YINLAR (DARVOZABONLAR)" emptyText="Hozircha darvozabonlarda quruq o'yin yo'q" children={topIndividualCleanSheets.map((p, i) => (
        <Row key={p.name} rank={i + 1} name={p.name} sub={`${p.apps} o'yin`} badgeValue={`${p.cleanSheets} ta`} badgeColor="#2ec4b6" />
      ))} />

      <StatCard title="🛡 ENG KOʻP QURUQ OʻYIN (JAMOALAR)" emptyText="Hozircha quruq o'yin yo'q" children={topCleanSheets.map((t, i) => (
        <Row key={t.name} rank={i + 1} name={`${t.logo || "⚽️"} ${t.name}`} badgeValue={`${t.cleanSheets} ta`} badgeColor="#4a7090" />
      ))} />

      <StatCard title="🏆 ENG YUQORI OʻRTACHA BALLGA EGA JAMOA" emptyText="Hozircha ma'lumot yo'q" children={topTeamRating.map((t, i) => (
        <Row key={t.name} rank={i + 1} name={`${t.logo || "⚽️"} ${t.name}`} badgeValue={t.avg.toFixed(1)} badgeColor={getRatingColor(t.avg)} />
      ))} />
    </div>
  );
}
