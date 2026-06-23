import { useState } from "react";

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    if (password === correctPassword) {
      sessionStorage.setItem("bolodala_admin_ok", "1");
      onSuccess();
    } else {
      setError("Parol noto'g'ri");
    }
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 60px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "linear-gradient(135deg, #0f2235 0%, #132840 100%)",
          border: "2px solid #e74c3c",
          borderRadius: 12,
          padding: 28,
          width: "100%",
          maxWidth: 360,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>ADMIN KIRISH</div>
        </div>
        <label style={{ color: "#7a9bb5", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6 }}>
          PAROL
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          style={{
            background: "#0a1a2a",
            border: "1px solid #2a4060",
            borderRadius: 8,
            color: "#e8f0f8",
            padding: "10px 14px",
            fontSize: 14,
            width: "100%",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: 12,
          }}
        />
        {error && <div style={{ color: "#e74c3c", fontSize: 12, marginBottom: 12 }}>{error}</div>}
        <button
          type="submit"
          style={{
            width: "100%",
            background: "#e74c3c",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: 12,
            fontWeight: 800,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          KIRISH
        </button>
      </form>
    </div>
  );
}
