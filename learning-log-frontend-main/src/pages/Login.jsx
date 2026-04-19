import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.role, res.data.email);
      res.data.role === "ADMIN"
        ? navigate("/admin/dashboard")
        : navigate("/logs");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={{
      ...styles.container,
      background: theme.isDark 
        ? theme.background 
        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    }}>
      {/* THEME TOGGLE BUTTON */}
      <button
        style={{
          ...styles.themeToggleBtn,
          background: theme.isDark ? theme.surface : "rgba(255, 255, 255, 0.2)",
          color: theme.isDark ? theme.text : "white",
          border: `2px solid ${theme.isDark ? theme.border : "rgba(255, 255, 255, 0.3)"}`,
        }}
        onClick={toggleTheme}
        title={theme.isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {theme.isDark ? "☀️" : "🌙"}
      </button>

      <div style={{
        ...styles.card,
        background: theme.background,
        color: theme.text,
        boxShadow: `0 10px 40px ${theme.shadowColorHeavy}`,
      }}>
        <div style={styles.header}>
          <h2 style={{...styles.title, color: theme.text}}>Welcome Back</h2>
          <p style={{...styles.subtitle, color: theme.textSecondary}}>Login to your account</p>
        </div>

        {error && <div style={{
          ...styles.errorMessage,
          background: theme.isDark ? "#3d1a1a" : "#ffebee",
          color: theme.danger,
          borderColor: theme.danger,
        }}>{error}</div>}

        <div style={styles.form}>
          <div style={styles.formGroup}>
            <label style={{...styles.label, color: theme.text}}>Email Address</label>
            <input
              style={{
                ...styles.input,
                background: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              }}
              placeholder="Enter your email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={{...styles.label, color: theme.text}}>Password</label>
            <input
              style={{
                ...styles.input,
                background: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              }}
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
          </div>

          <button
            style={{...styles.btn, ...styles.btnPrimary, background: theme.primaryGradient}}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <div style={styles.footer}>
          <p style={{color: theme.textSecondary}}>Don't have an account? <Link to="/signup" style={{...styles.link, color: theme.primary}}>Sign up here</Link></p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "clamp(15px, 5vw, 20px)",
    transition: "background-color 0.3s ease",
    position: "relative",
  },
  themeToggleBtn: {
    position: "fixed",
    top: "20px",
    right: "20px",
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    zIndex: 100,
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    borderRadius: "16px",
    padding: "clamp(25px, 5vw, 40px)",
    transition: "all 0.3s ease",
  },
  header: {
    textAlign: "center",
    marginBottom: "clamp(20px, 5vw, 30px)",
  },
  title: {
    fontSize: "clamp(22px, 5vw, 28px)",
    fontWeight: "700",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "clamp(12px, 3vw, 14px)",
  },
  form: {
    marginBottom: "20px",
  },
  formGroup: {
    marginBottom: "clamp(15px, 3vw, 20px)",
  },
  label: {
    display: "block",
    fontSize: "clamp(13px, 2vw, 14px)",
    fontWeight: "600",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
    fontSize: "clamp(13px, 2vw, 14px)",
    border: "2px solid",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  btn: {
    width: "100%",
    padding: "clamp(10px, 2vw, 12px) clamp(16px, 3vw, 16px)",
    fontSize: "clamp(14px, 2vw, 16px)",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "white",
  },
  btnPrimary: {},
  errorMessage: {
    padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "clamp(12px, 2vw, 14px)",
    fontWeight: "500",
    border: "1px solid",
  },
  footer: {
    textAlign: "center",
    fontSize: "clamp(12px, 2vw, 14px)",
  },
  link: {
    fontWeight: "600",
    textDecoration: "none",
    cursor: "pointer",
  },
};
