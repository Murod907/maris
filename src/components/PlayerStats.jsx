import { getRatingColor } from "../lib/helpers";

function StatCard({ title, emptyText, children }) {
  return (
    <div style={{ background: "#0f2235", borderRadius: 12, border: "1px solid #1e3a55", overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #1e3a55", color: "#E8F0F8", fontWeight: 800, fontSize: 14 }}>
        {title}
      </div>
      {children.length === 0 ? (
        <div style={{ padding: 24, color: "#4a7090", textAlign: "center" }}>{emptyText}</div>
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
        padding: "12px 20px",
        borderBottom: "1px solid #1a3050",
        background: rank === 1 ? "rgba(232,240,248,0.04)" : "transparent",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#4a7090", fontWeight: 700, minWidth: 20 }}>{rank}</span>
        <div>
          <div style={{ color: "#e8f0f8", fontWeight: 700, fontSize: 14 }}>{name}</div>
          {sub && <div style={{ color: "#4a7090", fontSize: 11, marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
      <div
        style={{
          background: badgeColor,
          color: "#0D1B2A",
          fontWeight: 900,
          fontSize: 15,
          borderRadius: 8,
          padding: "5px 12px",
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
  allMatchPlayers.forEach((p) => {
    if (!playerMap[p.name]) {
      playerMap[p.name] = { name: p.name, goals: 0, assists: 0, ratings: [], apps: 0 };
    }
    playerMap[p.name].goals += p.goals;
    playerMap[p.name].assists += p.assists;
    playerMap[p.name].ratings.push(Number(p.rating));
    playerMap[p.name].apps += 1;
  });
  const players = Object.values(playerMap).map((p) => ({
    ...p,
    avgRating: p.ratings.length ? p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length : 0,
  }));

  const topScorers = [...players].filter((p) => p.goals > 0).sort((a, b) => b.goals - a.goals).slice(0, 5);
  const topAssisters = [...players].filter((p) => p.assists > 0).sort((a, b) => b.assists - a.assists).slice(0, 5);
  const topRated = [...players].sort((a, b) => b.avgRating - a.avgRating).slice(0, 5);

  // ===== Jamoalar bo'yicha (quruq o'yin va o'rtacha ball) =====
  const finished = (matches || []).filter((m) => m.status === "finished" && m.home_score != null && m.away_score != null);

  const cleanSheetsMap = {};
  (teams || []).forEach((t) => (cleanSheetsMap[t.name] = 0));
  finished.forEach((m) => {
    if (m.away_score === 0 && cleanSheetsMap[m.home_team] != null) cleanSheetsMap[m.home_team] += 1;
    if (m.home_score === 0 && cleanSheetsMap[m.away_team] != null) cleanSheetsMap[m.away_team] += 1;
  });
  const topCleanSheets = (teams || [])
    .map((t) => ({ name: t.name, logo: t.logo, cleanSheets: cleanSheetsMap[t.name] || 0 }))
    .filter((t) => t.cleanSheets > 0)
    .sort((a, b) => b.cleanSheets - a.cleanSheets)
    .slice(0, 5);

  const teamRatingsMap = {};
  (teams || []).forEach((t) => (teamRatingsMap[t.name] = []));
  allMatchPlayers.forEach((p) => {
    const match = finished.find((m) => m.id === p.match_id);
    if (!match) return;
    const teamName = p.side === "home" ? match.home_team : match.away_team;
    if (teamRatingsMap[teamName]) teamRatingsMap[teamName].push(Number(p.rating));
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
      <StatCard title="⚽ TO'PURARLAR " emptyText="Hozircha gol urilmagan" children={topScorers.map((p, i) => (
        <Row key={p.name} rank={i + 1} name={p.name} sub={`${p.apps} o'yin`} badgeValue={p.goals} badgeColor={getRatingColor(p.avgRating)} />
      ))} />

      <StatCard title="🎯 ASSISTENTLAR" emptyText="Hozircha assist berilmagan" children={topAssisters.map((p, i) => (
        <Row key={p.name} rank={i + 1} name={p.name} sub={`${p.apps} o'yin`} badgeValue={p.assists} badgeColor={getRatingColor(p.avgRating)} />
      ))} />

      <StatCard title="⭐ ENG YUQORI OʻRTACHA BALL" emptyText="Hozircha ma'lumot yo'q" children={topRated.map((p, i) => (
        <Row key={p.name} rank={i + 1} name={p.name} sub={`${p.apps} o'yin`} badgeValue={p.avgRating.toFixed(1)} badgeColor={getRatingColor(p.avgRating)} />
      ))} />

      <StatCard title="🛡️ ENG KOʻP QURUQ OʻYIN" emptyText="Hozircha quruq o'yin yo'q" children={topCleanSheets.map((t, i) => (
        <Row key={t.name} rank={i + 1} name={`${t.logo} ${t.name}`} badgeValue={t.cleanSheets} badgeColor="#7a9bb5" />
      ))} />

      <StatCard title="🏆 ENG YUQORI OʻRTACHA BALLGA EGA JAMOA" emptyText="Hozircha ma'lumot yo'q" children={topTeamRating.map((t, i) => (
        <Row key={t.name} rank={i + 1} name={`${t.logo} ${t.name}`} badgeValue={t.avg.toFixed(1)} badgeColor={getRatingColor(t.avg)} />
      ))} />
    </div>
  );
}
