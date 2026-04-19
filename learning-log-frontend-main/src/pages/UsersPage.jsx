import { useEffect, useState, useContext } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import Header from "../components/Header";
import LogoutPopup from "../components/LogoutPopup";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { theme, isDark } = useContext(ThemeContext);

  const loadUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data); // Backend already filters out admins
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleLogout = () => {
    logout();
    setShowPopup(true);
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name) =>
    name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const avatarColors = [
    "linear-gradient(135deg,#667eea,#764ba2)",
    "linear-gradient(135deg,#f093fb,#f5576c)",
    "linear-gradient(135deg,#4facfe,#00f2fe)",
    "linear-gradient(135deg,#43e97b,#38f9d7)",
    "linear-gradient(135deg,#fa709a,#fee140)",
    "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  ];

  return (
    <div style={{ background: theme.background, color: theme.text, minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <Header />

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Page Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: theme.text }}>👥 Community</h2>
            <p style={{ margin: "6px 0 0", color: theme.textSecondary, fontSize: "14px" }}>{filtered.length} members</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => navigate("/logs")} style={{ padding: "10px 20px", background: isDark ? theme.surface : "#f0f0f5", border: `1px solid ${theme.border}`, borderRadius: "10px", color: theme.text, cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
              ← Logs
            </button>
            <button onClick={handleLogout} style={{ padding: "10px 20px", background: theme.dangerGradient, border: "none", borderRadius: "10px", color: "white", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
              Logout
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative", marginBottom: "28px" }}>
          <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: theme.textSecondary }}>🔍</span>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "14px 16px 14px 44px",
              borderRadius: "14px", border: `1px solid ${theme.border}`,
              background: isDark ? theme.surface : "white",
              color: theme.text, fontSize: "15px", outline: "none",
              boxSizing: "border-box",
              boxShadow: `0 2px 12px ${theme.shadowColor}`
            }}
          />
        </div>

        {/* Users Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: theme.textSecondary }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔎</div>
            <p style={{ fontSize: "16px", fontWeight: 500 }}>No users found</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "18px" }}>
            {filtered.map((u, idx) => (
              <div
                key={u.id}
                onMouseEnter={() => setHoveredId(u.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: isDark ? theme.surface : "white",
                  borderRadius: "18px",
                  border: `1px solid ${hoveredId === u.id ? "#764ba2" : theme.border}`,
                  padding: "24px",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: "12px", textAlign: "center",
                  transition: "all 0.25s ease",
                  transform: hoveredId === u.id ? "translateY(-4px)" : "none",
                  boxShadow: hoveredId === u.id
                    ? "0 12px 32px rgba(118,75,162,0.18)"
                    : `0 2px 10px ${theme.shadowColor}`,
                }}
              >
                <div style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  background: avatarColors[idx % avatarColors.length],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", fontWeight: "800", color: "white",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.15)"
                }}>
                  {getInitials(u.name)}
                </div>

                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: theme.text }}>{u.name}</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: theme.textSecondary }}>{u.email}</p>
                </div>

                <button
                  onClick={() => navigate(`/user/${u.id}`)}
                  style={{
                    marginTop: "4px", width: "100%",
                    padding: "11px", border: "none", borderRadius: "12px",
                    background: avatarColors[idx % avatarColors.length],
                    color: "white", fontWeight: 700, fontSize: "14px",
                    cursor: "pointer", letterSpacing: "0.3px"
                  }}
                >
                  View Work →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPopup && <LogoutPopup />}
    </div>
  );
}
