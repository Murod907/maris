
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
    <div style={{ background: "#f0f6fc", minHeight: "100vh" }}>
      <TopBar view={view} setView={setView} isAdminRoute={false} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
        {/* Premium Informatsion Panel */}
        <div
          style={{
            background: "linear-gradient(135deg, #0056b3 0%, #003d82 100%)",
            border: "1px solid #b3d4fc",
            borderRadius: 16,
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
            boxShadow: "0 8px 24px rgba(0, 86, 179, 0.08)"
          }}
        >
          <div>
            <div style={{ color: "#ffffff", fontWeight: 900, fontSize: 22, letterSpacing: 0.5 }}>⛰ Bolodala Super Liga</div>
            <div style={{ color: "#b3d4fc", fontSize: 12, marginTop: 4, fontWeight: 600 }}> BOLODALA SUPER LIGA • 2026 Mavsumi</div>
          </div>
          <div style={{ display: "flex", gap: 20, textAlign: "center" }}>
            <div>
              <div style={{ color: "#ffffff", fontWeight: 800, fontSize: 24 }}>{teams.length}</div>
              <div style={{ color: "#b3d4fc", fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>JAMOA</div>
            </div>
            <div>
              <div style={{ color: "#ffffff", fontWeight: 800, fontSize: 24 }}>{finished.length}</div>
              <div style={{ color: "#b3d4fc", fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>O'YIN TUGADI</div>
            </div>
            <div>
              <div style={{ color: "#ffffff", fontWeight: 800, fontSize: 24 }}>{upcoming.length}</div>
              <div style={{ color: "#b3d4fc", fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>KUTILMOQDA</div>
            </div>
          </div>
        </div>

        {loading && (
          <div style={{ color: "#0056b3", textAlign: "center", padding: 40, fontWeight: "bold" }}>
            Ma'lumotlar yuklanmoqda...
          </div>
        )}

        {!loading && view === "matches" && (
          <div>
            {upcoming.length > 0 && (
              <>
                <div style={{ color: "#e67e22", fontWeight: 800, fontSize: 11, letterSpacing: 1, marginBottom: 10 }}>
                  KEYINGI O'YINLAR
                </div>
                {upcoming.map((m) => (
                  <MatchCard key={m.id} match={m} onSelect={openMatch} />
                ))}
              </>
            )}

            <div
              style={{
                color: "#4a7090",
                fontWeight: 800,
                fontSize: 11,
                letterSpacing: 1,
                marginBottom: 10,
                marginTop: 24,
              }}
            >
              O'TGAN O'YINLAR
            </div>
            {finished.length === 0 && (
              <div style={{ color: "#5a738e", textAlign: "center", padding: 32, background: "#ffffff", borderRadius: 12, border: "1px solid #e1e8ed" }}>
                Hali yakunlangan o'yinlar mavjud emas.
              </div>
            )}
            {finished.map((m) => (
              <MatchCard key={m.id} match={m} onSelect={openMatch} />
            ))}
          </div>
        )}

        {!loading && view === "table" && <StandingsTable teams={teams} />}

        {!loading && view === "stats" && <PlayerStats allMatchPlayers={allMatchPlayers} matches={matches} teams={teams} />}
      </div>
      
      {selectedMatch && (
        <MatchDetail match={selectedMatch} players={selectedMatchPlayers} onClose={() => setSelectedMatch(null)} />
      )}
    </div>
  );
}
