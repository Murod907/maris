export default function TopBar({ view, setView, isAdminRoute }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0D1B2A 0%, #1a2d42 100%)",
        borderBottom: "2px solid #00D4AA",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>⛰️</span>
          <div>
            <div style={{ color: "#00D4AA", fontWeight: 800, fontSize: 15, letterSpacing: 0.5 }}>
              BOLODALA
            </div>
            <div style={{ color: "#7a9bb5", fontSize: 10, fontWeight: 600, letterSpacing: 2 }}>
              SUPER LIGA 2025
            </div>
          </div>
        </a>

        {!isAdminRoute && (
          <div style={{ display: "flex", gap: 6 }}>
            {["matches", "table", "stats"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  background: view === v ? "#00D4AA" : "transparent",
                  color: view === v ? "#0D1B2A" : "#7a9bb5",
                  border: "1px solid " + (view === v ? "#00D4AA" : "#2a4060"),
                  borderRadius: 6,
                  padding: "5px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {v === "matches" ? "O'yinlar" : v === "table" ? "Jadval" : "Statistika"}
              </button>
            ))}
            <a
              href="/admin"
              style={{
                background: "transparent",
                color: "#7a9bb5",
                border: "1px solid #2a4060",
                borderRadius: 6,
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.5,
                display: "flex",
                alignItems: "center",
              }}
            >
              🔑 Admin
            </a>
          </div>
        )}

        {isAdminRoute && (
          <a
            href="/"
            style={{
              color: "#00D4AA",
              fontSize: 12,
              fontWeight: 700,
              border: "1px solid #00D4AA",
              borderRadius: 6,
              padding: "5px 12px",
            }}
          >
            ← Saytga qaytish
          </a>
        )}
      </div>
    </div>
  );
}
