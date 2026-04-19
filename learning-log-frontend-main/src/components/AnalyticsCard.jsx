import { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { getAnalyticsSummary } from "../api/analytics";

export default function AnalyticsCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await getAnalyticsSummary();
        setData(res);
      } catch (e) {
        console.error("Failed to load analytics", e);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return <div style={{
      ...styles.card,
      background: theme.surface,
      color: theme.text,
    }}>Loading analytics...</div>;
  }

  if (!data) {
    return <div style={{
      ...styles.card,
      background: theme.surface,
      color: theme.text,
    }}>Analytics unavailable</div>;
  }

  return (
    <div style={{
      ...styles.card,
      background: theme.surface,
      color: theme.text,
      boxShadow: `0 8px 30px ${theme.shadowColor}`,
    }}>
      <h3 style={{...styles.title, color: theme.text}}>📊 Your Learning Analytics</h3>

      <div style={styles.grid}>
        <Stat label="Total Logs" value={data.totalLogs} />
        <Stat label="This Week" value={data.logsThisWeek} />
        <Stat label="This Month" value={data.logsThisMonth} />
        <Stat label="Current Streak 🔥" value={`${data.currentStreak} days`} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  const { theme } = useContext(ThemeContext);
  
  return (
    <div style={{
      ...styles.statBox,
      background: theme.background,
      color: theme.text,
    }}>
      <p style={{...styles.statLabel, color: theme.textSecondary}}>{label}</p>
      <p style={{...styles.statValue, color: theme.primary}}>{value}</p>
    </div>
  );
}

const styles = {
  card: {
    borderRadius: "14px",
    padding: "20px 30px",
    marginBottom: "30px",
  },
  title: {
    marginBottom: "15px",
    fontSize: "20px",
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
  },
  statBox: {
    borderRadius: "10px",
    padding: "15px",
    textAlign: "center",
  },
  statLabel: {
    fontSize: "13px",
    marginBottom: "6px",
  },
  statValue: {
    fontSize: "22px",
    fontWeight: 700,
  },
};
