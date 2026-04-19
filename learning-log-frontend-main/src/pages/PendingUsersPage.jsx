import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function PendingUsersPage() {
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const navigate = useNavigate();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadPending = async () => {
    const res = await api.get("/admin/pending");
    setUsers(res.data);
  };

  useEffect(() => {
    loadPending();
  }, []);

  const sendOne = async (id) => {
    setSendingId(id);
    try {
      await api.post(`/admin/pending/${id}/send`, {}, { timeout: 60000 });
      showToast("✅ Reminder sent! Check Eclipse console for delivery status.");
    } catch (err) {
      showToast("❌ Failed to send: " + (err.response?.data || err.message), "error");
    } finally {
      setSendingId(null);
    }
  };

  const sendAll = async () => {
    setSendingId("all");
    try {
      await api.post("/admin/pending/send-all", {}, { timeout: 60000 });
      showToast("✅ Reminders sent! Check Eclipse console for delivery status.");
    } catch (err) {
      showToast("❌ Failed: " + (err.response?.data || err.message), "error");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div style={styles.page}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", zIndex: 9999,
          background: toast.type === "error" ? "#e53935" : "#27ae60", color: "white",
          padding: "14px 24px", borderRadius: "12px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
          fontSize: "15px", fontWeight: 600,
          maxWidth: "360px"
        }}>
          {toast.msg}
        </div>
      )}

      <button style={styles.backBtn} onClick={() => navigate("/admin/dashboard")}>
        ← Back to Dashboard
      </button>

      <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#2c3e50", marginBottom: "25px" }}>⏰ Users Who Did Not Log Today</h2>

      <button
        style={{ ...styles.sendAllBtn, opacity: sendingId === "all" ? 0.7 : 1 }}
        onClick={sendAll}
        disabled={sendingId === "all"}
      >
        {sendingId === "all" ? "⏳ Sending..." : "📧 Send Reminder to ALL"}
      </button>

      {users.length === 0 ? (
        <p style={{ marginTop: "20px", color: "#27ae60", fontSize: "16px", fontWeight: 600 }}>✅ Everyone logged today!</p>
      ) : (
        users.map((u) => (
          <div key={u.id} style={styles.card}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#2c3e50" }}>{u.name}</h3>
              <small style={{ color: "#7f8c8d", marginTop: "4px", display: "block" }}>{u.email}</small>
            </div>

            <button
              style={{ ...styles.sendBtn, opacity: sendingId === u.id ? 0.7 : 1 }}
              onClick={() => sendOne(u.id)}
              disabled={sendingId === u.id}
            >
              {sendingId === u.id ? "⏳ Sending..." : "📧 Send Email"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: "30px",
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
  },
  card: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px",
    background: "white",
    borderRadius: "12px",
    border: "1px solid #ecf0f1",
    marginBottom: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
  },
  sendBtn: {
    background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    padding: "10px 18px",
    color: "white",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "13px",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  sendAllBtn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: "8px",
    padding: "12px 24px",
    border: "none",
    cursor: "pointer",
    marginBottom: "25px",
    fontWeight: 600,
    fontSize: "14px",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  backBtn: {
    padding: "10px 18px",
    background: "#95a5a6",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
    marginBottom: "20px",
    fontWeight: 600,
    fontSize: "13px",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
};
