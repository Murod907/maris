import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { recalculateStandings } from "../lib/helpers";
import TopBar from "../components/TopBar";
import AdminLogin from "./AdminLogin";

const inputStyle = {
  background: "#ffffff",
  border: "1px solid #b3d4fc",
  borderRadius: 8,
  color: "#0f2235",
  padding: "10px 14px",
  fontSize: 13,
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = { 
  color: "#4a7090", 
  fontSize: 11, 
  fontWeight: 700, 
  letterSpacing: 0.5, 
  marginBottom: 4, 
  display: "block" 
};

// Ballarga qarab kartochka ranglarini aniqlash funksiyasi
function getRatingColor(rating) {
  const r = Number(rating);
  if (r >= 8.5) return "#2ecc71"; // To'q yashil
  if (r >= 7.5) return "#27ae60"; // Yashil
  if (r >= 6.5) return "#f1c40f"; // Sariq
  if (r >= 5.5) return "#e67e22"; // To'q sariq
  return "#e74c3c"; // Qizil
}

export default function AdminApp() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("bolodala_admin_ok") === "1");

  if (!authed) {
    return (
      <div style={{ background: "#f0f6fc", minHeight: "100vh" }}>
        <TopBar isAdminRoute={true} />
        <AdminLogin onSuccess={() => setAuthed(true)} />
      </div>
    );
  }

  return (
    <div style={{ background: "#f0f6fc", minHeight: "100vh" }}>
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
  
  const [newPlayer, setNewPlayer] = useState({ side: "home", player_id: "", rating: "7.0", goals: "0", assists: "0", is_clean_sheet: false });
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

  function getPlayersForTeam(teamName) {
    const foundTeam = teams.find((t) => t.name === teamName);
    if (!foundTeam) return [];
    return players.filter((p) => p.team_id === foundTeam.id);
  }

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
      status: forceStatus ? forceStatus : m.status,
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
    if (!form.home_team || !form.away_team || !form.match_date) {
      alert("Sana va ikkala jamoani tanlang");
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
          player_id: p.player_id,
          side: p.side,
          rating: parseFloat(p.rating) || 0,
          goals: parseInt(p.goals) || 0,
          assists: parseInt(p.assists) || 0,
          is_clean_sheet: p.is_clean_sheet || false,
        }))
      );
    }

    const { data: freshMatches } = await supabase.from("matches").select("*");
    await syncTeamStandings(freshMatches ? freshMatches : []);

    startNewMatch();
    await loadAll();
    setSaving(false);
  }

  async function deleteMatch(id) {
    if (!confirm("Ushbu o'yinni o'chirishga ishonchingiz komilmi?")) return;
    await supabase.from("matches").delete().eq("id", id);
    const { data: freshMatches } = await supabase.from("matches").select("*");
    await syncTeamStandings(freshMatches ? freshMatches : []);
    loadAll();
  }

  // SEN SO'RAGAN VA TUGMANI JONLANTIRADIGAN ASOSIY FUNKSIYA
  function addPlayerToForm() {
    if (!newPlayer.player_id) {
      alert("Iltimos, ro'yxatdan o'yinchini tanlang!");
      return;
    }
    
    const targetPlayer = players.find((p) => String(p.id) === String(newPlayer.player_id));
    if (!targetPlayer) {
      alert("O'yinchi topilmadi!");
      return;
    }

    setFormPlayers((list) => [
      ...list,
      {
        side: newPlayer.side,
        player_id: targetPlayer.id,
        name: targetPlayer.name,
        rating: Number(newPlayer.rating) || 7.0,
        goals: Number(newPlayer.goals) || 0,
        assists: Number(newPlayer.assists) || 0,
        is_clean_sheet: newPlayer.is_clean_sheet || false,
      },
    ]);
    
    setNewPlayer((p) => ({ ...p, player_id: "", rating: "7.0", goals: "0", assists: "0", is_clean_sheet: false }));
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
    if (teamFormPlayers.length < 5) {
      alert("Yangi jamoaga o'yinchi qo'shish majburiy! (Kamida 5 ta o'yinchi bo'lishi kerak)");
      return;
    }
    const logoValue = teamForm.logo ? teamForm.logo : "⚽️";
    const { data, error } = await supabase
      .from("teams")
      .insert({ name: teamForm.name, logo: logoValue })
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

  if (loading) return <div style={{ color: "#0056b3", textAlign: "center", padding: 40, fontWeight: "bold" }}>Yuklanmoqda...</div>;

  return (
    <div style={{ background: "#ffffff", borderRadius: 16, boxShadow: "0 10px 30px rgba(0, 86, 179, 0.08)", border: "1px solid #b3d4fc", overflow: "hidden" }}>
      <div style={{ background: "#0056b3", padding: "14px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>🔐</span>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: 0.5 }}>BOLODALA SUPER LIGA • ADMIN PANEL</span>
      </div>

      <div style={{ display: "flex", background: "#f8f9fa", borderBottom: "1px solid #b3d4fc" }}>
        {["match", "teams"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              background: tab === t ? "#ffffff" : "transparent",
              color: tab === t ? "#0056b3" : "#5a738e",
              border: "none",
              borderBottom: tab === t ? "3px solid #0056b3" : "none",
              padding: 14,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {t === "match" ? "⚽️ O'yin boshqaruvi" : "👥 Jamoalar va Tarkib"}
          </button>
        ))}
      </div>

      <div style={{ padding: 24 }}>
        {tab === "match" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: "#0056b3", fontSize: 11, fontWeight: 800, marginBottom: 8, letterSpacing: 0.5 }}>KUTILMOQDA</div>
              {matches.filter((m) => m.status === "upcoming").length === 0 && (
                <div style={{ color: "#8a9eb2", fontSize: 13, marginBottom: 12 }}>Kutilayotgan o'yin yo'q</div>
              )}
              {matches.filter((m) => m.status === "upcoming").map((m) => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0f6fc", borderRadius: 10, padding: "12px 16px", marginBottom: 6, border: "1px solid #d0e3fa" }}>
                  <span style={{ color: "#0f2235", fontSize: 13, fontWeight: 600 }}>
                    {m.home_team} vs {m.away_team} • <span style={{ color: "#7fa6cd" }}>{m.match_date}</span>
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => startEditMatch(m, "finished")} style={{ background: "#0056b3", color: "#ffffff", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
                      ✅ Tugatish
                    </button>
                    <button onClick={() => startEditMatch(m)} style={{ background: "#e1eefc", color: "#0056b3", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
                      ✏️ Tahrirlash
                    </button>
                    <button onClick={() => deleteMatch(m.id)} style={{ background: "#fff0f0", color: "#dc3545", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
                      🗑
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ color: "#5a738e", fontSize: 11, fontWeight: 800, marginBottom: 8, marginTop: 20, letterSpacing: 0.5 }}>TUGAGAN O'YINLAR</div>
              {matches.filter((m) => m.status === "finished").length === 0 && (
                <div style={{ color: "#8a9eb2", fontSize: 13 }}>Hali tugagan o'yin yo'q</div>
              )}
              {matches.filter((m) => m.status === "finished").map((m) => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", borderRadius: 10, padding: "12px 16px", marginBottom: 6, border: "1px solid #e1e8ed" }}>
                  <span style={{ color: "#0f2235", fontSize: 13, fontWeight: 600 }}>
                    {m.home_team} <strong style={{ color: "#0056b3" }}>{m.home_score}:{m.away_score}</strong> {m.away_team} • <span style={{ color: "#a0b2c6" }}>{m.match_date}</span>
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => startEditMatch(m)} style={{ background: "#e1eefc", color: "#0056b3", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
                      ✏️ Stat Kiritish
                    </button>
                    <button onClick={() => deleteMatch(m.id)} style={{ background: "#fff0f0", color: "#dc3545", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "2px dashed #b3d4fc", paddingTop: 20 }}>
              <div style={{ color: "#0056b3", fontWeight: 800, fontSize: 13, marginBottom: 16 }}>
                {editingMatchId ? "✏️ O'YINNI TAHRIRLASH & STATISTIKA" : "➕ YANGI O'YIN QO'SHISH"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
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
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>MEHMON JAMOA</label>
                  <select style={inputStyle} value={form.away_team} onChange={(e) => setForm((f) => ({ ...f, away_team: e.target.value }))}>
                    <option value="">Tanlang</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
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

              {form.status === "finished" && form.home_team && form.away_team && (
                <div style={{ marginBottom: 16, background: "#f0f6fc", padding: 16, borderRadius: 12, border: "1px solid #b3d4fc" }}>
                  <div style={{ color: "#0056b3", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>📋 INDIVIDUAL STATISTIKA (RO'YXATDAN TANLASH)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr 65px 55px 55px 75px auto", gap: 8, alignItems: "end" }}>
                    <div>
                      <label style={labelStyle}>TOMON</label>
                      <select style={inputStyle} value={newPlayer.side} onChange={(e) => setNewPlayer((p) => ({ ...p, side: e.target.value, player_id: "" }))}>
                        <option value="home">Uy ({form.home_team})</option>
                        <option value="away">Mehmon ({form.away_team})</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>FUTBOLCHINI TANLANG</label>
                      <select 
  style={inputStyle} 
  value={newPlayer.player_id || ""} 
  onChange={(e) => {
    const selectedId = e.target.value;
    setNewPlayer(prev => ({
      ...prev,
      player_id: selectedId
    }));
  }}
>
  <option value="">-- Tanlang --</option>
  {getPlayersForTeam(newPlayer.side === "home" ? form.home_team : form.away_team).map((p) => (
    <option key={p.id} value={p.id}>
      {p.name} ({p.position})
    </option>
  ))}
</select>
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
                    <div style={{ textAlign: "center" }}>
                      <label style={labelStyle}>QURUQ O'YIN</label>
                      <input type="checkbox" checked={newPlayer.is_clean_sheet} onChange={(e) => setNewPlayer((p) => ({ ...p, is_clean_sheet: e.target.checked }))} style={{ width: 18, height: 18, cursor: "pointer" }} />
                    </div>
                    <div>
                      {/* O'YINCHI QO'SHISH TUGMASI (PLYUS) */}
                      <button onClick={addPlayerToForm} style={{ background: "#0056b3", color: "#ffffff", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 800, cursor: "pointer", fontSize: 14 }}>
                        +
                      </button>
                    </div>
                  </div>

                  {[{ side: "home", label: form.home_team }, { side: "away", label: form.away_team }].map((s) => (
                    <div key={s.side} style={{ marginTop: 16 }}>
                      <div style={{ color: "#4a7090", fontSize: 12, fontWeight: 800, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        {s.label} jamoasi ko'rsatkichlari:
                      </div>
                      {formPlayers.filter((p) => p.side === s.side).length === 0 ? (
                        <div style={{ color: "#8a9eb2", fontSize: 11, fontStyle: "italic", padding: "6px 0" }}>Ushbu jamoa o'yinchilari haqida ma'lumot kiritilmagan</div>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          {formPlayers
                            .map((p, i) => ({ ...p, idx: i }))
                            .filter((p) => p.side === s.side)
                            .map((p) => (
                              <div 
                                key={p.idx} 
                                style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  justifyContent: "space-between", 
                                  padding: "10px 14px", 
                                  borderRadius: 10, 
                                  marginBottom: 6, 
                                  background: getRatingColor(p.rating),
                                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
                                }}
                              >
                                <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                                  <span>{p.name}</span>
                                  {p.is_clean_sheet && (
                                    <span style={{ background: "rgba(255,255,255,0.25)", color: "#ffffff", fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>🧤 Quruq</span>
                                  )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{ color: "#ffffff", fontSize: 11, textAlign: "right" }}>
                                    ⚽️ {p.goals || 0} • 🎯 {p.assists || 0}
                                  </div>
                                  <div style={{ background: "rgba(255,255,255,0.25)", color: "#ffffff", fontWeight: 800, fontSize: 14, borderRadius: 6, padding: "3px 8px", minWidth: 32, textAlign: "center" }}>
                                    {Number(p.rating).toFixed(1)}
                                  </div>
                                  <button onClick={() => removePlayerFromForm(p.idx)} style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", fontSize: 13, fontWeight: "bold" }}>
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={saveMatch}
                  disabled={saving}
                  style={{ flex: 1, background: "#0056b3", color: "#ffffff", border: "none", borderRadius: 8, padding: 14, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", fontSize: 14, opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? "SAQLANMOQDA..." : editingMatchId ? "✅ MATCHNI SAQLASH" : "➕ O'YINNI QO'SHISH"}
                </button>
                {editingMatchId && (
                  <button onClick={startNewMatch} style={{ background: "#e1eefc", color: "#0056b3", border: "none", borderRadius: 8, padding: "12px 20px", cursor: "pointer", fontWeight: 700 }}>
                    Bekor
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {tab === "teams" && (
          <>
            <div style={{ background: "#f8f9fa", padding: 20, borderRadius: 12, border: "1px solid #b3d4fc", marginBottom: 20 }}>
              <div style={{ color: "#0056b3", fontWeight: 800, fontSize: 13, marginBottom: 12 }}>➕ YANGI JAMOA TASHKIL ETISH</div>
              <div style={{ display: "grid", gridTemplateColumns: "70px 2fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>EMOJI</label>
                  <input style={inputStyle} value={teamForm.logo} onChange={(e) => setTeamForm((f) => ({ ...f, logo: e.target.value }))} maxLength={2} />
                </div>
                <div>
                  <label style={labelStyle}>JAMOA NOMI</label>
                  <input style={inputStyle} value={teamForm.name} onChange={(e) => setTeamForm((f) => ({ ...f, name: e.target.value }))} placeholder="Jamoa nomi" />
                </div>
              </div>

              <div style={{ background: "#ffffff", padding: 14, borderRadius: 8, border: "1px solid #d0e3fa", marginBottom: 12 }}>
                <div style={{ color: "#e67e22", fontSize: 11, fontWeight: 800, marginBottom: 8 }}>⚠️ JAMOA AZOLARI TARKIBI (KAMIDA 5 TA SHART! Kiritildi: {teamFormPlayers.length} ta)</div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr auto", gap: 8, alignItems: "end", marginBottom: 10 }}>
                  <div>
                    <label style={labelStyle}>ISM FAMILIYASI</label>
                    <input style={inputStyle} value={newTeamPlayer.name} onChange={(e) => setNewTeamPlayer((p) => ({ ...p, name: e.target.value }))} placeholder="Futbolchi ismi" />
                  </div>
                  <div>
                    <label style={labelStyle}>POZITSIYASI</label>
                    <select style={inputStyle} value={newTeamPlayer.position} onChange={(e) => setNewTeamPlayer((p) => ({ ...p, position: e.target.value }))}>
                      <option value="Darvozabon">Darvozabon</option>
                      <option value="Himoyachi">Himoyachi</option>
                      <option value="Yarim himoyachi">Yarim himoyachi</option>
                      <option value="Hujumchi">Hujumchi</option>
                    </select>
                  </div>
                  <div>
                    <button onClick={addPlayerToTeamForm} style={{ background: "#0056b3", color: "#ffffff", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 800, cursor: "pointer" }}>
                      +
                    </button>
                  </div>
                </div>

                {teamFormPlayers.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    {teamFormPlayers.map((p, i) => (
                      <span key={i} style={{ background: "#e1eefc", color: "#0056b3", padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                        {p.name} ({p.position})
                        <b onClick={() => removePlayerFromTeamForm(i)} style={{ color: "#dc3545", cursor: "pointer" }}>✕</b>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={addTeam} 
                disabled={teamFormPlayers.length < 5}
                style={{ width: "100%", background: teamFormPlayers.length < 5 ? "#cccccc" : "#0056b3", color: "#ffffff", border: "none", borderRadius: 8, padding: 12, fontWeight: 800, cursor: teamFormPlayers.length < 5 ? "not-allowed" : "pointer", fontSize: 14 }}
              >
                ➕ JAMOANI TARKIBI BILAN SAQLASH
              </button>
            </div>
            
            <div style={{ color: "#0056b3", fontSize: 11, fontWeight: 800, marginBottom: 10, letterSpacing: 0.5 }}>RO'YXATDAGI JAMOALAR REYTINGI</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
              {teams.map((t) => (
                <div key={t.id} style={{ background: "#ffffff", borderRadius: 10, padding: "14px 16px", border: "1px solid #e1e8ed" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 20 }}>{t.logo}</span>
                    <span style={{ color: "#0f2235", fontSize: 14, fontWeight: 700, flex: 1, marginLeft: 10 }}>{t.name}</span>
                    <span style={{ color: "#0056b3", fontSize: 12, fontWeight: 700, marginRight: 15 }}>{t.points} Ochko</span>
                    <button onClick={() => deleteTeam(t.id)} style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer", fontSize: 14 }}>
                      🗑
                    </button>
                  </div>
                  {players.filter((p) => p.team_id === t.id).length > 0 && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #edf2f7", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {players.filter((p) => p.team_id === t.id).map((p) => (
                        <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8f9fa", padding: "4px 8px", borderRadius: 6, border: "1px solid #edf2f7" }}>
                          <span style={{ color: "#5a738e", fontSize: 11, fontWeight: 600 }}>{p.name} <i style={{ fontWeight: 400, color: "#a0b2c6" }}>({p.position})</i></span>
                          <button onClick={() => deletePlayer(p.id)} style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer", fontSize: 11 }}>
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
