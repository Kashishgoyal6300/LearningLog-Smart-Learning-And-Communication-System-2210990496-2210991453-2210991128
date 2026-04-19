import { useState, useEffect, useContext } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function CalendarPage({ onDateSelect }) {
  const navigate = useNavigate();
  const today = new Date();
  const { theme } = useContext(ThemeContext);

  // Fix timezone offset issue
  const formatDate = (date) =>
    new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];

  const todayFormatted = formatDate(today);

  const [selectedDay, setSelectedDay] = useState(today);

  useEffect(() => {
    onDateSelect(todayFormatted); // Auto-select today's logs
  }, []);

  const handleSelect = (day) => {
    if (!day) return;

    // Prevent selecting future dates
    if (day > today) return;

    setSelectedDay(day);

    const formatted = formatDate(day);
    onDateSelect(formatted);
  };

  return (
    <div style={{...styles.container, color: theme.text}}>
      <div style={styles.header}>
        <h2 style={{...styles.title, color: theme.text}}>📅 Select a Day</h2>
        <p style={{...styles.subtitle, color: theme.textSecondary}}>Choose a date to view or edit your logs</p>
      </div>

      <div style={styles.calendarWrapper}>
        <DayPicker
          mode="single"
          selected={selectedDay}
          onSelect={handleSelect}
          disabled={{ after: today }}
          defaultMonth={today}
          weekStartsOn={1}
        />
      </div>

      <button
        onClick={() => navigate("/users")}
        style={{
          ...styles.btn,
          background: theme.primaryGradient,
        }}
      >
        👥 View Other Users
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: "25px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  header: {
    marginBottom: "20px",
  },
  title: {
    fontSize: "22px",
    fontWeight: 700,
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "13px",
  },
  calendarWrapper: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "20px",
  },
  btn: {
    padding: "12px 20px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  
};
