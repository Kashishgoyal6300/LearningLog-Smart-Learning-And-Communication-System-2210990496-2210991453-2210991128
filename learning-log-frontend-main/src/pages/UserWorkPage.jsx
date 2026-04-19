import { useEffect, useState, useContext } from "react";
import api from "./api";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import Header from "../components/Header";

export default function UserWorkPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { theme, isDark } = useContext(ThemeContext);

  const loadUserData = async () => {
    try {
      const res = await api.get(`/users/${id}`);
      setData(res.data);
    } catch (e) {
      console.error("Error fetching user data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const getInitials = (name) =>
    name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const tagColors = {
    work: "#667eea", study: "#43e97b", health: "#f093fb",
    personal: "#fa709a", default: "#a18cd1"
  };

  if (loading) return (
    <div style={{ background: theme.background, minHeight: "100vh" }}>
      <Header />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center", color: theme.textSecondary }}>
          <div style={{ fontSize: "48px", marginBottom: "12px", animation: "spin 1s linear infinite" }}>⏳</div>
          <p style={{ fontSize: "16px" }}>Loading...</p>
        </div>
      </div>
    </div>
  );

  if (!data) return (
    <div style={{ background: theme.background, minHeight: "100vh" }}>
      <Header />
      <div style={{ padding: "40px", textAlign: "center", color: theme.textSecondary }}>
        <div style={{ fontSize: "48px" }}>😕</div>
        <p>User not found</p>
        <button onClick={() => navigate("/users")} style={{ padding: "10px 20px", background: theme.primaryGradient, color: "white", border: "none", borderRadius: "10px", cursor: "pointer" }}>← Back</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: theme.background, color: theme.text, minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <Header />

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Back Button */}
        <button
          onClick={() => navigate("/users")}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "10px 18px", marginBottom: "28px",
            background: isDark ? theme.surface : "#f0f0f5",
            border: `1px solid ${theme.border}`, borderRadius: "10px",
            color: theme.text, cursor: "pointer", fontWeight: 600, fontSize: "13px"
          }}
        >
          ← Back to Users
        </button>

        {/* Profile Card */}
        <div style={{
          background: isDark ? theme.surface : "white",
          borderRadius: "20px", border: `1px solid ${theme.border}`,
          padding: "32px", marginBottom: "28px",
          boxShadow: `0 4px 24px ${theme.shadowColor}`,
          display: "flex", alignItems: "center", gap: "24px"
        }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,#667eea,#764ba2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "28px", fontWeight: "800", color: "white",
            boxShadow: "0 6px 20px rgba(102,126,234,0.4)"
          }}>
            {getInitials(data.name)}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: theme.text }}>{data.name}</h2>
            <p style={{ margin: "6px 0 0", color: theme.textSecondary, fontSize: "14px" }}>📧 {data.email}</p>
            <p style={{ margin: "6px 0 0", color: theme.textSecondary, fontSize: "14px" }}>
              📝 <b style={{ color: theme.text }}>{data.logs?.length || 0}</b> log{data.logs?.length !== 1 ? "s" : ""} submitted
            </p>
          </div>
        </div>

        {/* Logs Section */}
        <h3 style={{ margin: "0 0 16px", fontSize: "20px", fontWeight: 700, color: theme.text }}>
          📚 Work Logs
        </h3>

        {data.logs?.length === 0 ? (
          <div style={{
            background: isDark ? theme.surface : "white",
            borderRadius: "16px", border: `1px solid ${theme.border}`,
            padding: "48px", textAlign: "center", color: theme.textSecondary
          }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
            <p style={{ fontSize: "16px", fontWeight: 500 }}>No logs submitted yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {data.logs.map((log) => {
              const tagColor = tagColors[log.tag?.toLowerCase()] || tagColors.default;
              return (
                <div
                  key={log.id}
                  style={{
                    background: isDark ? theme.surface : "white",
                    borderRadius: "16px", border: `1px solid ${theme.border}`,
                    padding: "22px 24px",
                    boxShadow: `0 2px 12px ${theme.shadowColor}`,
                    transition: "all 0.2s ease",
                    borderLeft: `4px solid ${tagColor}`
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                    <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: theme.text }}>{log.title}</h3>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                      {log.tag && (
                        <span style={{
                          padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700,
                          background: tagColor + "22", color: tagColor, border: `1px solid ${tagColor}44`
                        }}>
                          🏷️ {log.tag}
                        </span>
                      )}
                      <span style={{
                        padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                        background: isDark ? theme.background : "#f0f0f5", color: theme.textSecondary
                      }}>
                        📅 {log.date}
                      </span>
                    </div>
                  </div>
                  {log.description && (
                    <p style={{ margin: "12px 0 0", color: theme.textSecondary, lineHeight: "1.7", fontSize: "15px" }}>
                      {log.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
