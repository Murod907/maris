export const getRatingColor = (r) => {
  if (r >= 8) return "#00D4AA";
  if (r >= 7) return "#4CAF50";
  if (r >= 6) return "#FFC107";
  return "#F44336";
};

export const getRatingBg = (r) => {
  if (r >= 8) return "rgba(0,212,170,0.15)";
  if (r >= 7) return "rgba(76,175,80,0.15)";
  if (r >= 6) return "rgba(255,193,7,0.15)";
  return "rgba(244,67,54,0.15)";
};

export function recalculateStandings(teams, matches) {
  const stats = {};
  teams.forEach((t) => {
    stats[t.name] = {
      ...t,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      points: 0,
    };
  });

  matches
    .filter((m) => m.status === "finished" && m.home_score != null && m.away_score != null)
    .forEach((m) => {
      const home = stats[m.home_team];
      const away = stats[m.away_team];
      if (!home || !away) return;

      home.goals_for += m.home_score;
      home.goals_against += m.away_score;
      away.goals_for += m.away_score;
      away.goals_against += m.home_score;

      if (m.home_score > m.away_score) {
        home.wins += 1;
        home.points += 3;
        away.losses += 1;
      } else if (m.home_score < m.away_score) {
        away.wins += 1;
        away.points += 3;
        home.losses += 1;
      } else {
        home.draws += 1;
        away.draws += 1;
        home.points += 1;
        away.points += 1;
      }
    });

  return Object.values(stats);
}
