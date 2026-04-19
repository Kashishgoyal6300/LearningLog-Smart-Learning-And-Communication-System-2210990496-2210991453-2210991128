import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const loginAdmin = async () => {
    try {
      const res = await api.post("/auth/login", form);

      // Check role
      if (res.data.role !== "ADMIN") {
        alert("Not an admin account");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      navigate("/admin/dashboard");
    } catch (e) {
      alert("Invalid admin credentials!");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Admin Login</h2>
          <p style={styles.subtitle}>Access the admin dashboard</p>
        </div>

        <input
          style={styles.input}
          placeholder="Admin Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button style={styles.btn} onClick={loginAdmin}>
          Login
        </button>
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
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "clamp(15px, 5vw, 20px)",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    padding: "clamp(25px, 5vw, 40px)",
    background: "white",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
  },
  header: {
    marginBottom: "clamp(20px, 5vw, 30px)",
  },
  title: {
    fontSize: "clamp(22px, 5vw, 28px)",
    fontWeight: 700,
    color: "#2c3e50",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "clamp(12px, 3vw, 14px)",
    color: "#7f8c8d",
  },
  input: {
    width: "100%",
    padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
    marginBottom: "clamp(12px, 2vw, 16px)",
    borderRadius: "8px",
    border: "2px solid #ecf0f1",
    fontSize: "clamp(13px, 2vw, 14px)",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
  },
  btn: {
    width: "100%",
    padding: "clamp(10px, 2vw, 12px) clamp(16px, 3vw, 16px)",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "clamp(14px, 2vw, 16px)",
    fontWeight: 600,
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
};
