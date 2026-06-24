import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import TopBar from "../components/TopBar";
import MatchCard from "../components/MatchCard";
import MatchDetail from "../components/MatchDetail";
import StandingsTable from "../components/StandingsTable";
import PlayerStats from "../components/PlayerStats";

export default function PublicApp() {
  const [view, setView] = useState("matches");
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [allMatchPlayers, setAllMatchPlayers] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedMatchPlayers, setSelectedMatchPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    const [{ data: teamsData }, { data: matchesData }, { data: playersData }] = await Promise.all([
      supabase.from("teams").select("*"),
      supabase.from("matches").select("*").order("match_date", { ascending: true }),
      supabase.from("match_players").select("*"),
    ]);
    setTeams(teamsData || []);
    setMatches(matchesData || []);
    setAllMatchPlayers(playersData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function openMatch(match) {
    setSelectedMatch(match);
    setSelectedMatchPlayers(allMatchPlayers.filter((p) => p.match_id === match.id));
  }

  const upcoming = matches.filter((m) => m.status === "upcoming");
  const finished = matches.filter((m) => m.status === "finished");

  return (
    <div style={{ background: "#0D1B2A", minHeight: "100vh" }}>
      <TopBar view={view} setView={setView} isAdminRoute={false} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
        <div
          style={{
            background: "linear-gradient(135deg, #0f2235 0%, #132840 50%, #0f2235 100%)",
            border: "1px solid #1e3a55",
            borderRadius: 12,
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div style={{ color: "#E8F0F8", fontWeight: 900, fontSize: 20 }}>⛰️ Bolodala Super Liga</div>
            <div style={{ color: "#4a7090", fontSize: 12, marginTop: 2 }}>Boʻstonliq tumani • 2026 Mavsumi</div>
          </div>
          <div style={{ display: "flex", gap: 16, textAlign: "center" }}>
            <div>
              <div style={{ color: "#e8f0f8", fontWeight: 800, fontSize: 22 }}>{teams.length}</div>
              <div style={{ color: "#4a7090", fontSize: 10 }}>JAMOA</div>
            </div>
            <div>
              <div style={{ color: "#e8f0f8", fontWeight: 800, fontSize: 22 }}>{finished.length}</div>
              <div style={{ color: "#4a7090", fontSize: 10 }}>O'YIN</div>
            </div>
            <div>
              <div style={{ color: "#e8f0f8", fontWeight: 800, fontSize: 22 }}>{upcoming.length}</div>
              <div style={{ color: "#4a7090", fontSize: 10 }}>KUTILMOQDA</div>
            </div>
          </div>
        </div>

        {loading && <div style={{ color: "#4a7090", textAlign: "center", padding: 40 }}>Yuklanmoqda...</div>}

        {!loading && view === "matches" && (
          <div>
            {upcoming.length > 0 && (
              <>
                <div style={{ color: "#FFC107", fontWeight: 700, fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>
                  KEYINGI O'YINLAR
                </div>
                {upcoming.map((m) => (
                  <MatchCard key={m.id} match={m} onSelect={openMatch} />
                ))}
              </>
            )}
 <div
              style={{
                color: "#7a9bb5",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: 1,
                marginBottom: 8,
                marginTop: 16,
              }}
            >
              O'TGAN O'YINLAR
            </div>
            {finished.length === 0 && (
              <div style={{ color: "#4a7090", textAlign: "center", padding: 24 }}>Hali o'yinlar yo'q</div>
            )}
            {finished.map((m) => (
              <MatchCard key={m.id} match={m} onSelect={openMatch} />
            ))}
          </div>
        )}

        {!loading && view === "table" && <StandingsTable teams={teams} />}

        {!loading && view === "stats" && <PlayerStats allMatchPlayers={allMatchPlayers} />}
      </div>

      {selectedMatch && (
        <MatchDetail match={selectedMatch} players={selectedMatchPlayers} onClose={() => setSelectedMatch(null)} />
      )}
    </div>
  );
}
