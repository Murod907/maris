import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { recalculateStandings } from "../lib/helpers";
import TopBar from "../components/TopBar";
import AdminLogin from "./AdminLogin";

const inputStyle = {
  background: "#0a1a2a",
  border: "1px solid #2a4060",
  borderRadius: 8,
  color: "#e8f0f8",
  padding: "10px 14px",
  fontSize: 13,
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = { 
  color: "#7a9bb5", 
  fontSize: 11, 
  fontWeight: 700, 
  letterSpacing: 0.5, 
  marginBottom: 4, 
  display: "block" 
};

export default function AdminApp() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("bolodala_admin_ok") === "1");

  if (!authed) {
    return (
      <div style={{ background: "#0D1B2A", minHeight: "100vh" }}>
        <TopBar isAdminRoute={true} />
        <AdminLogin onSuccess={() => setAuthed(true)} />
      </div>
    );
  }

  return (
    <div style={{ background: "#0D1B2A", minHeight: "100vh" }}>
      <TopBar isAdminRoute={true} />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
        <AdminPanel />
      </div>
    </div>
  );
}

function AdminPanel() {
  const [tab, setTab] = useState("match");
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [allMatchPlayers, setAllMatchPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingMatchId, setEditingMatchId] = useState(null);
  const [form, setForm] = useState({ match_date: "", home_team: "", away_team: "", home_score: "", away_score: "", status: "upcoming" });
  const [formPlayers, setFormPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState({ side: "home", name: "", rating: 7.0, goals: 0, assists: 0 });
  const [teamForm, setTeamForm] = useState({ name: "", logo: "⚽️" });
  const [teamFormPlayers, setTeamFormPlayers] = useState([]);
  const [newTeamPlayer, setNewTeamPlayer] = useState({ name: "", position: "Hujumchi" });
  const [players, setPlayers] = useState([]);

  async function loadAll() {
    setLoading(true);
    const [{ data: teamsData }, { data: matchesData }, { data: playersData }, { data: rosterData }] = await Promise.all([
      supabase.from("teams").select("*").order("name"),
      supabase.from("matches").select("*").order("match_date", { ascending: false }),
      supabase.from("match_players").select("*"),
      supabase.from("players").select("*").order("name"),
    ]);
    setTeams(teamsData || []);
    setMatches(matchesData || []);
    setAllMatchPlayers(playersData || []);
    setPlayers(rosterData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function startNewMatch() {
    setEditingMatchId(null);
    setForm({ match_date: "", home_team: "", away_team: "", home_score: "", away_score: "", status: "upcoming" });
    setFormPlayers([]);
  }

  function startEditMatch(m, forceStatus) {
    setEditingMatchId(m.id);
    setForm({
      match_date: m.match_date,
      home_team: m.home_team,
      away_team: m.away_team,
      home_score: m.home_score ?? "",
      away_score: m.away_score ?? "",
      status: forceStatus || m.status,
    });
    setFormPlayers(allMatchPlayers.filter((p) => p.match_id === m.id));
  }

  async function syncTeamStandings(updatedMatches) {
    const recalculated = recalculateStandings(teams, updatedMatches);
    await Promise.all(
      recalculated.map((t) =>
        supabase
          .from("teams")
          .update({
            wins: t.wins,
            draws: t.draws,
            losses: t.losses,
            goals_for: t.goals_for,
            goals_against: t.goals_against,
            points: t.points,
          })
          .eq("id", t.id)
      )
    );
  }
 async function saveMatch() {
    if (!form.home_team) {
      alert("Sana va ikkala jamoani tanlang");
      return;
    }
    if (!form.away_team) {
      alert("Sana va ikkala jamoani tanlang");
      return;
    }
    if (!form.match_date) {
      alert("Sana va ikkala jamoani tanlang");
      return;
    }
      return;
    }
    if (form.home_team === form.away_team) {
      alert("Bir xil jamoani tanlab bo'lmaydi");
      return;
    }
    setSaving(true);

    const payload = {
      match_date: form.match_date,
      home_team: form.home_team,
      away_team: form.away_team,
      status: form.status,
      home_score: form.status === "finished" ? Number(form.home_score) : null,
      away_score: form.status === "finished" ? Number(form.away_score) : null,
    };

    let matchId = editingMatchId;
    if (editingMatchId) {
      await supabase.from("matches").update(payload).eq("id", editingMatchId);
      await supabase.from("match_players").delete().eq("match_id", editingMatchId);
    } else {
      const { data, error } = await supabase.from("matches").insert(payload).select().single();
      if (error) {
        alert("Xatolik: " + error.message);
        setSaving(false);
        return;
      }
      matchId = data.id;
    }

    if (formPlayers.length > 0) {
      await supabase.from("match_players").insert(
        formPlayers.map((p) => ({
          match_id: matchId,
          side: p.side,
          name: p.name,
          rating: p.rating,
          goals: p.goals,
          assists: p.assists,
        }))
      );
    }

    const { data: freshMatches } = await supabase.from("matches").select("*");
    await syncTeamStandings(freshMatches || []);

    setSaving(false);
    startNewMatch();
    loadAll();
  }

  async function deleteMatch(id) {
    if (!confirm("Ushbu o'yinni o'chirishga ishonchingiz komilmi?")) return;
    await supabase.from("matches").delete().eq("id", id);
    const { data: freshMatches } = await supabase.from("matches").select("*");
    await syncTeamStandings(freshMatches || []);
    loadAll();
  } 

  function addPlayerToForm() {
    if (!newPlayer.name) return;
    setFormPlayers((list) => [
      ...list,
      { side: newPlayer.side, name: newPlayer.name, rating: Number(newPlayer.rating), goals: Number(newPlayer.goals), assists: Number(newPlayer.assists) },
    ]);
    setNewPlayer({ side: "home", name: "", rating: 7.0, goals: 0, assists: 0 });
  }

  function removePlayerFromForm(idx) {
    setFormPlayers((list) => list.filter((_, i) => i !== idx));
  }

  function addPlayerToTeamForm() {
    if (!newTeamPlayer.name) return;
    setTeamFormPlayers((list) => [...list, { name: newTeamPlayer.name, position: newTeamPlayer.position }]);
    setNewTeamPlayer({ name: "", position: "Hujumchi" });
  }

  function removePlayerFromTeamForm(idx) {
    setTeamFormPlayers((list) => list.filter((_, i) => i !== idx));
  }

  async function addTeam() {
    if (!teamForm.name) return;
    const { data, error } = await supabase
      .from("teams")
      .insert({ name: teamForm.name, logo: teamForm.logo || "⚽️" })
      .select()
      .single();
    if (error) {
      alert("Xatolik: " + error.message);
      return;
    }
    if (teamFormPlayers.length > 0) {
      await supabase.from("players").insert(
        teamFormPlayers.map((p) => ({ team_id: data.id, name: p.name, position: p.position }))
      );
    }
    setTeamForm({ name: "", logo: "⚽️" });
    setTeamFormPlayers([]);
    loadAll();
  }

  async function deletePlayer(id) {
    await supabase.from("players").delete().eq("id", id);
    loadAll();
  }

  async function deleteTeam(id) {
    if (!confirm("Jamoani o'chirishga ishonchingiz komilmi? Bog'liq o'yinlar saqlanib qoladi.")) return;
    await supabase.from("teams").delete().eq("id", id);
    loadAll();
  }

  if (loading) return <div style={{ color: "#4a7090", textAlign: "center", padding: 40 }}>Yuklanmoqda...</div>;

  return (
    <div style={{ background: "linear-gradient(135deg, #0f2235 0%, #132840 100%)", borderRadius: 12, border: "2px solid #e74c3c", overflow: "hidden" }}>
 <div style={{ background: "#e74c3c", padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>🔐</span>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>ADMIN PANELI</span>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #1e3a55" }}>
        {["match", "teams"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              background: tab === t ? "#1e3a55" : "transparent",
              color: tab === t ? "#E8F0F8" : "#4a7090",
              border: "none",
              padding: 12,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {t === "match" ? "⚽️ O'yin boshqaruvi" : "👥 Jamoalar"}
          </button>
        ))}
      </div>

      <div style={{ padding: 20 }}>
        {tab === "match" && (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: "#FFC107", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>KUTILMOQDA</div>
              {matches.filter((m) => m.status === "upcoming").length === 0 && (
                <div style={{ color: "#4a7090", fontSize: 13, marginBottom: 12 }}>Kutilayotgan o'yin yo'q</div>
              )}
              {matches.filter((m) => m.status === "upcoming").map((m) => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a1a2a", borderRadius: 8, padding: "10px 14px", marginBottom: 6 }}>
                  <span style={{ color: "#e8f0f8", fontSize: 13 }}>
                    {m.home_team} vs {m.away_team} • {m.match_date}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => startEditMatch(m, "finished")} style={{ background: "#E8F0F8", color: "#0D1B2A", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
                      ✅ Tugatish
                    </button>
                    <button onClick={() => startEditMatch(m)} style={{ background: "#2a4060", color: "#E8F0F8", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
                      ✏️
                    </button>
                    <button onClick={() => deleteMatch(m.id)} style={{ background: "#2a4060", color: "#e74c3c", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
                      🗑
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ color: "#7a9bb5", fontSize: 11, fontWeight: 700, marginBottom: 8, marginTop: 16 }}>TUGAGAN O'YINLAR</div>
              {matches.filter((m) => m.status === "finished").length === 0 && (
                <div style={{ color: "#4a7090", fontSize: 13 }}>Hali tugagan o'yin yo'q</div>
              )}
              {matches.filter((m) => m.status === "finished").map((m) => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a1a2a", borderRadius: 8, padding: "10px 14px", marginBottom: 6 }}>
                  <span style={{ color: "#e8f0f8", fontSize: 13 }}>
                    {m.home_team} {m.home_score}:{m.away_score} {m.away_team} • {m.match_date}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => startEditMatch(m)} style={{ background: "#2a4060", color: "#E8F0F8", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
 ✏️
                    </button>
                    <button onClick={() => deleteMatch(m.id)} style={{ background: "#2a4060", color: "#e74c3c", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #1e3a55", paddingTop: 20 }}>
              <div style={{ color: "#E8F0F8", fontWeight: 800, fontSize: 13, marginBottom: 16 }}>
                {editingMatchId ? "✏️ O'YINNI TAHRIRLASH" : "➕ YANGI O'YIN QO'SHISH"}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>SANA</label>
                  <input type="date" style={inputStyle} value={form.match_date} onChange={(e) => setForm((f) => ({ ...f, match_date: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>HOLAT</label>
                  <select style={inputStyle} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                    <option value="upcoming">Kutilmoqda</option>
                    <option value="finished">Tugadi</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>UY JAMOA</label>
                  <select style={inputStyle} value={form.home_team} onChange={(e) => setForm((f) => ({ ...f, home_team: e.target.value }))}>
                    <option value="">Tanlang</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>MEHMON JAMOA</label>
                  <select style={inputStyle} value={form.away_team} onChange={(e) => setForm((f) => ({ ...f, away_team: e.target.value }))}>
                    <option value="">Tanlang</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                {form.status === "finished" && (
                  <>
                    <div>
                      <label style={labelStyle}>UY HISOBI</label>
                      <input type="number" min={0} style={inputStyle} value={form.home_score} onChange={(e) => setForm((f) => ({ ...f, home_score: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>MEHMON HISOBI</label>
                      <input type="number" min={0} style={inputStyle} value={form.away_score} onChange={(e) => setForm((f) => ({ ...f, away_score: e.target.value }))} />
                    </div>
                  </>
                )}
              </div>

              {form.status === "finished" && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: "#7a9bb5", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>O'YINCHI QO'SHISH</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 60px 60px 60px auto", gap: 8, alignItems: "end" }}>
                    <div>
                      <label style={labelStyle}>TOMON</label>
                      <select style={inputStyle} value={newPlayer.side} onChange={(e) => setNewPlayer((p) => ({ ...p, side: e.target.value }))}>
                        <option value="home">{form.home_team || "Uy"}</option>
 <option value="away">{form.away_team || "Mehmon"}</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>ISM</label>
                      <input style={inputStyle} value={newPlayer.name} onChange={(e) => setNewPlayer((p) => ({ ...p, name: e.target.value }))} placeholder="Ism Familiya" />
                    </div>
                    <div>
                      <label style={labelStyle}>BALL</label>
                      <input type="number" step={0.1} min={1} max={10} style={inputStyle} value={newPlayer.rating} onChange={(e) => setNewPlayer((p) => ({ ...p, rating: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>GOL</label>
                      <input type="number" min={0} style={inputStyle} value={newPlayer.goals} onChange={(e) => setNewPlayer((p) => ({ ...p, goals: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>ASSIST</label>
                      <input type="number" min={0} style={inputStyle} value={newPlayer.assists} onChange={(e) => setNewPlayer((p) => ({ ...p, assists: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, visibility: "hidden" }}>.</label>
                      <button onClick={addPlayerToForm} style={{ background: "#E8F0F8", color: "#0D1B2A", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 800, cursor: "pointer", fontSize: 16 }}>
                        +
                      </button>
                    </div>
                  </div>

                  {[
                    { side: "home", label: form.home_team || "Uy" },
                    { side: "away", label: form.away_team || "Mehmon" },
                  ].map(
                    (s) =>
                      formPlayers.filter((p) => p.side === s.side).length > 0 && (
                        <div key={s.side} style={{ marginTop: 10 }}>
                          <div style={{ color: "#4a7090", fontSize: 11, marginBottom: 6 }}>{s.label}</div>
                          {formPlayers
                            .map((p, i) => ({ ...p, idx: i }))
                            .filter((p) => p.side === s.side)
                            .map((p) => (
                              <div key={p.idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a1a2a", borderRadius: 6, padding: "6px 12px", marginBottom: 4 }}>
                                <span style={{ color: "#e8f0f8", fontSize: 12 }}>
                                  {p.name} — ⭐️{p.rating} ⚽️{p.goals} 🎯{p.assists}
                                </span>
                                <button onClick={() => removePlayerFromForm(p.idx)} style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: 14 }}>
                                  ✕
                                </button>
                              </div>
                            ))}
                        </div>
                      )
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  onClick={saveMatch}
                  disabled={saving}
                  style={{ flex: 1, background: "#E8F0F8", color: "#0D1B2A", border: "none", borderRadius: 8, padding: 12, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", fontSize: 14, opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? "SAQLANMOQDA..." : editingMatchId ? "✅ SAQLASH" : "➕ QO'SHISH"}
                </button>
 {editingMatchId && (
                  <button onClick={startNewMatch} style={{ background: "#2a4060", color: "#7a9bb5", border: "none", borderRadius: 8, padding: "12px 20px", cursor: "pointer", fontWeight: 700 }}>
                    Bekor
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {tab === "teams" && (
          <>
            <div style={{ marginBottom: 20 }}>
              {teams.map((t) => (
                <div key={t.id} style={{ background: "#0a1a2a", borderRadius: 8, padding: "10px 14px", marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 20 }}>{t.logo}</span>
                    <span style={{ color: "#e8f0f8", fontSize: 13, flex: 1, marginLeft: 10 }}>{t.name}</span>
                    <span style={{ color: "#4a7090", fontSize: 12, marginRight: 10 }}>{t.points} ball</span>
                    <button onClick={() => deleteTeam(t.id)} style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: 14 }}>
                      🗑
                    </button>
                  </div>
                  {players.filter((p) => p.team_id === t.id).length > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #1e3a55" }}>
                      {players.filter((p) => p.team_id === t.id).map((p) => (
                        <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                          <span style={{ color: "#7a9bb5", fontSize: 12 }}>{p.name} — {p.position}</span>
                          <button onClick={() => deletePlayer(p.id)} style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: 12 }}>
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div style={{ borderTop: "1px solid #1e3a55", paddingTop: 16 }}>
              <div style={{ color: "#E8F0F8", fontWeight: 800, fontSize: 13, marginBottom: 12 }}>➕ YANGI JAMOA</div>
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>EMOJI</label>
                  <input style={inputStyle} value={teamForm.logo} onChange={(e) => setTeamForm((f) => ({ ...f, logo: e.target.value }))} maxLength={2} />
                </div>
                <div>
                  <label style={labelStyle}>JAMOA NOMI</label>
                  <input style={inputStyle} value={teamForm.name} onChange={(e) => setTeamForm((f) => ({ ...f, name: e.target.value }))} placeholder="Jamoa nomi" />
                </div>
              </div>

              <div style={{ color: "#7a9bb5", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>JAMOA OʻYINCHILARI (ixtiyoriy)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "end", marginBottom: 10 }}>
                <div>
                  <label style={labelStyle}>ISM</label>
                  <input style={inputStyle} value={newTeamPlayer.name} onChange={(e) => setNewTeamPlayer((p) => ({ ...p, name: e.target.value }))} placeholder="Ism Familiya" />
                </div>
                <div>
                  <label style={labelStyle}>POZITSIYA</label>
                  <select style={inputStyle} value={newTeamPlayer.position} onChange={(e) => setNewTeamPlayer((p) => ({ ...p, position: e.target.value }))}>
<option value="Darvozabon">Darvozabon</option>
                    <option value="Himoyachi">Himoyachi</option>
                    <option value="Yarim himoyachi">Yarim himoyachi</option>
                    <option value="Hujumchi">Hujumchi</option>
                  </select>
                </div>
                <div>
                  <label style={{ ...labelStyle, visibility: "hidden" }}>.</label>
                  <button onClick={addPlayerToTeamForm} style={{ background: "#E8F0F8", color: "#0D1B2A", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 800, cursor: "pointer", fontSize: 16 }}>
                    +
                  </button>
                </div>
              </div>
              
              {teamFormPlayers.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  {teamFormPlayers.map((p, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a1a2a", borderRadius: 6, padding: "6px 12px", marginBottom: 4 }}>
                      <span style={{ color: "#e8f0f8", fontSize: 12 }}>{p.name} — {p.position}</span>
                      <button onClick={() => removePlayerFromTeamForm(i)} style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: 14 }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={addTeam} style={{ width: "100%", background: "#E8F0F8", color: "#0D1B2A", border: "none", borderRadius: 8, padding: 12, fontWeight: 800, cursor: "pointer", fontSize: 14 }}>
                ➕ JAMOANI QOʻSHISH
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
