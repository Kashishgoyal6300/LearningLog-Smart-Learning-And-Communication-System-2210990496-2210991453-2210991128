import { useState, useContext, useEffect } from "react";
import Calendar from "./CalendarPage";
import LogEditor from "../components/LogEditor";
import Header from "../components/Header";
import AnalyticsCard from "../components/AnalyticsCard";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function LogsPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const { logoutPopup, cancelLogout, token } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  return (
    <div style={{
      ...styles.page,
      background: theme.background,
      color: theme.text,
    }}>
      {/* ✅ COMMON HEADER */}
      <Header />

      {/* LOGOUT POPUP */}
      {logoutPopup && (
        <div style={{
          ...styles.popupOverlay,
          background: theme.modalBackdrop,
        }}>
          <div style={{
            ...styles.popup,
            background: theme.background,
            color: theme.text,
          }}>
            <h3>Logging out</h3>
            <p>You will be redirected in 5 seconds</p>
            <button style={{
              ...styles.cancelBtn,
              background: theme.textSecondary,
            }} onClick={cancelLogout}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={styles.container}>
        {/* LEFT PANEL */}
        <div style={{
          ...styles.leftPanel,
          background: theme.surface,
          borderRightColor: theme.border,
        }}>
          <Calendar onDateSelect={setSelectedDate} />
        </div>

        {/* RIGHT PANEL */}
        <div style={{
          ...styles.rightPanel,
          background: theme.background,
        }}>
          {/* 📊 ANALYTICS */}
          <AnalyticsCard />

          {/* 📝 LOG EDITOR */}
          <LogEditor selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  );
}


const styles = {
  page: {
    minHeight: "100vh",
    fontFamily: "Segoe UI, Roboto, sans-serif",
    transition: "background-color 0.3s ease, color 0.3s ease",
  },

  container: {
    display: "grid",
    gridTemplateColumns: "30% 1fr",
    minHeight: "calc(100vh - 70px)",
    gap: 0,
  },

  leftPanel: {
    padding: "clamp(15px, 4vw, 30px)",
    borderRight: "1px solid",
    borderRightColor: "#ddd",
    overflowY: "auto",
    maxHeight: "calc(100vh - 70px)",
  },

  rightPanel: {
    padding: "clamp(20px, 4vw, 40px)",
    overflowY: "auto",
    maxHeight: "calc(100vh - 70px)",
  },

  popupOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    padding: "clamp(10px, 3vw, 20px)",
  },

  popup: {
    padding: "clamp(20px, 5vw, 30px)",
    borderRadius: "14px",
    textAlign: "center",
    width: "100%",
    maxWidth: "320px",
  },

  cancelBtn: {
    marginTop: "clamp(12px, 2vw, 16px)",
    padding: "clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)",
    background: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "clamp(12px, 2vw, 14px)",
  },
};
