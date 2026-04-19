import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import Header from "../components/Header";
import { useToast } from "../context/ToastContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Helper function to check if user logged in today
const isLoggedInToday = (lastLoginDate) => {
  if (!lastLoginDate) return false;
  const today = new Date();
  const lastLogin = new Date(lastLoginDate);

  return (
    lastLogin.getFullYear() === today.getFullYear() &&
    lastLogin.getMonth() === today.getMonth() &&
    lastLogin.getDate() === today.getDate()
  );
};

// Helper function to format last login date
const formatLastLogin = (lastLoginDate) => {
  if (!lastLoginDate) return "Never";

  const date = new Date(lastLoginDate);
  const today = new Date();

  // Check if it's today
  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  // Check if it's yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  // Otherwise return full date
  return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
};

export default function AdminDashboard() {

  const [selectedHistory, setSelectedHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [stats, setStats] = useState(null);
  const [reminderAnalytics, setReminderAnalytics] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUserLogs, setSelectedUserLogs] = useState(null);
  const [userLogsLoading, setUserLogsLoading] = useState(false);
  const [userLoginStatus, setUserLoginStatus] = useState({}); // Track login status for each user
  const [roleChangeConfirm, setRoleChangeConfirm] = useState(null); // { email, currentRole, action }

  const navigate = useNavigate();
  const { theme, isDark } = useContext(ThemeContext);
  const { showToast } = useToast();

  // logged-in admin email (from token storage)
  const loggedInEmail = localStorage.getItem("email");

  // ---------- LOAD STATS ----------
  const loadStats = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      setStats(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAnalytics = async () => {
    try {
        const res = await api.get("/admin/analytics/reminders");
        setReminderAnalytics(res.data);
    } catch(e) {
        console.error("Failed to load analytics", e);
    }
  };

  // ---------- CALCULATE STATS FOR REGULAR USERS ONLY ----------
  const calculateUserStats = () => {
    // Get only regular users (not admins)
    const regularUsers = users.filter(u => u.role !== "ADMIN");

    const totalUsers = regularUsers.length;
    const loggedToday = regularUsers.filter(u => userLoginStatus[u.id]).length;
    const notLoggedToday = totalUsers - loggedToday;

    return {
      totalUsers,
      usersLoggedToday: loggedToday,
      usersNotLoggedToday: notLoggedToday,
    };
  };


  // ---------- LOAD USERS ----------
  const loadUsers = async () => {
    try {
      const res = await api.get("/admin/users");

      // ❌ hide logged-in admin
      const filtered = res.data.filter(
        (u) => u.email !== loggedInEmail
      );

      console.log("User data:", filtered); // Debug log
      setUsers(filtered);

      // Check login status for each user
      const loginStatusMap = {};
      for (const user of filtered) {
        if (user.role !== "ADMIN") {
          const loggedInToday = await checkUserLoggedToday(user.id);
          loginStatusMap[user.id] = loggedInToday;
        }
      }
      setUserLoginStatus(loginStatusMap);
    } catch (e) {
      showToast("Failed to load users", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  // ---------- CHECK IF USER LOGGED IN TODAY ----------
  const checkUserLoggedToday = async (userId) => {
    try {
      const res = await api.get(`/users/${userId}`);
      const logs = res.data.logs || [];

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Check if any log is from today
      return logs.some(log => {
        const logDate = new Date(log.date).toISOString().split('T')[0];
        return logDate === todayStr;
      });
    } catch (e) {
      console.error("Failed to check user logs:", e);
      return false;
    }
  };
const viewLogHistory = async (logId, logTitle) => {
  setHistoryLoading(true);

  try {
    const res = await api.get(`/admin/log-history/${logId}`);

    setSelectedHistory({
      logTitle,
      history: res.data,
    });

  } catch (e) {
    //alert("Failed to load history");
    console.error(e);
  } finally {
    setHistoryLoading(false);
  }
};
  // ---------- VIEW USER LOGS ----------
  // ---------- VIEW USER LOGS ----------
const viewUserLogs = async (userId, userName) => {
  setUserLogsLoading(true);

  try {
    const res = await api.get(`/users/${userId}`);

    setSelectedUserLogs({
      userId,
      userName,
      logs: res.data.logs,
    });

  } catch (e) {
    showToast("Failed to load user logs", "error");
  } finally {
    setUserLogsLoading(false);
  }
};


   

  // ---------- TOGGLE ROLE ----------
  const toggleRole = (email, currentRole) => {
    const action = currentRole === "ADMIN" ? "REMOVING ADMIN" : "MAKING ADMIN";
    setRoleChangeConfirm({ email, currentRole, action });
  };

  const handleConfirmRoleChange = async () => {
    const { email } = roleChangeConfirm;
    setRoleChangeConfirm(null);
    try {
      await api.post("/admin/change-role", null, {
        params: { email },
      });

      showToast("Role updated successfully", "success");
      loadUsers();
      loadStats();
    } catch (e) {
      showToast(e.response?.data || "Failed to change role", "error");
    }
  };

  useEffect(() => {
    loadStats();
    loadAnalytics();
    loadUsers();
  }, []);

  if (!stats) return <h2 style={{ padding: "20px" }}>Loading...</h2>;

  return (
    <>
      <Header />
      <div style={{
        ...styles.page,
        background: theme.background,
        color: theme.text,
      }}>
        {/* LOGS MODAL */}

        {selectedUserLogs && (
          <div style={{
            ...styles.modalOverlay,
            background: theme.modalBackdrop,
          }}>
            <div style={{
              ...styles.modal,
              background: theme.background,
              boxShadow: `0 10px 40px ${theme.shadowColorHeavy}`,
            }}>
              <div style={{
                ...styles.modalHeader,
                background: theme.primaryGradient,
                borderBottomColor: theme.border,
              }}>
                <h2 style={{ margin: 0, color: "#2c3e50", fontSize: "24px" }}>
                  📋 {selectedUserLogs.userName}'s Logs
                </h2>
                <button
                  style={{
                    ...styles.closeBtn,
                    background: "rgba(255, 255, 255, 0.2)",
                  }}
                  onClick={() => setSelectedUserLogs(null)}
                >
                  ✕
                </button>
              </div>

              {userLogsLoading ? (
                <p style={{ textAlign: "center", color: theme.textSecondary, padding: "20px" }}>Loading logs...</p>
              ) : selectedUserLogs.logs.length === 0 ? (
                <p style={{ textAlign: "center", color: theme.textSecondary, padding: "20px" }}>No logs found for this user</p>
              ) : (
                <div style={{ ...styles.logsList, color: theme.text }}>
                  {selectedUserLogs.logs.map((log) => (
                    <div key={log.id} style={{
                      ...styles.logItem,
                      background: theme.surface,
                      borderColor: theme.border,
                    }}>

                      <div>
                        <h4 style={{ margin: "0 0 8px 0", color: theme.text, fontSize: "16px", fontWeight: 700 }}>
                          {log.title}
                        </h4>
                        <p style={{ margin: "0 0 8px 0", color: theme.textSecondary, fontSize: "13px" }}>
                          📅 <b>{log.date}</b>
                        </p>
                        <p style={{ margin: "0 0 8px 0", color: theme.text, lineHeight: "1.6", fontSize: "14px" }}>
                          {log.description}
                        </p>
                        <small style={{ color: theme.textTertiary }}>
                          🏷️ Tag: <b>{log.tag || "No tag"}</b>
                        </small>
                      </div>
                      <div style={{ marginTop: "10px" }}>
                        <button
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "12px",
                            background: theme.primaryGradient,
                            color: "white",
                          }}
                          onClick={() => viewLogHistory(log.id, log.title)}
                        >
                          🕒 View Edit History
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* HISTORY MODAL */}
{selectedHistory && (
  <div style={{
    ...styles.modalOverlay,
    background: theme.modalBackdrop,
  }}>
    <div style={{
      ...styles.modal,
      background: theme.background,
      boxShadow: `0 10px 40px ${theme.shadowColorHeavy}`,
    }}>

      <div style={{
        ...styles.modalHeader,
        background: theme.secondaryGradient,
      }}>
        <h2>🕒 Edit History — {selectedHistory.logTitle}</h2>

        <button
          style={styles.closeBtn}
          onClick={() => setSelectedHistory(null)}
        >
          ✕
        </button>
      </div>

      {historyLoading ? (
        <p style={{ padding: "20px", textAlign: "center" }}>
          Loading history...
        </p>
      ) : (
        <div style={{ padding: "20px", overflowY: "auto", maxHeight: "60vh" }}>
          {selectedHistory.history.map((h, idx) => (
            <div key={h.id ?? idx} style={{
              border: `1px solid ${theme.border}`,
              borderRadius: "10px",
              padding: "15px",
              marginBottom: "15px",
              background: theme.surface,
            }}>
              <p><b>Edited By:</b> {h.editedBy}</p>
              <p><b>Edited At:</b> {new Date(h.editedAt).toLocaleString()}</p>

              <hr />

              <p><b>Old Title:</b> {h.oldTitle}</p>
              <p><b>New Title:</b> {h.newTitle}</p>

              <p><b>Old Description:</b> {h.oldDescription}</p>
              <p><b>New Description:</b> {h.newDescription}</p>

              <p><b>Old Tag:</b> {h.oldTag}</p>
              <p><b>New Tag:</b> {h.newTag}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  </div>
)}

        <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "30px", color: theme.text }}>📊 Admin Dashboard</h1>

        {/* -------- STATS -------- */}
        <div style={{
          ...styles.card,
          background: theme.primaryGradient,
          boxShadow: `0 4px 15px ${theme.shadowColor}`,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            {(() => {
              const userStats = calculateUserStats();
              return (
                <>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>Total Users</p>
                    <p style={{ margin: "8px 0 0 0", fontSize: "28px", fontWeight: 700 }}>{userStats.totalUsers}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>Logged Today ✓</p>
                    <p style={{ margin: "8px 0 0 0", fontSize: "28px", fontWeight: 700 }}>{userStats.usersLoggedToday}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>Not Logged ✗</p>
                    <p style={{ margin: "8px 0 0 0", fontSize: "28px", fontWeight: 700 }}>{userStats.usersNotLoggedToday}</p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* -------- REMINDER ANALYTICS CHART -------- */}
        <div style={{
          ...styles.card,
          background: theme.surface,
          boxShadow: `0 4px 15px ${theme.shadowColor}`,
          marginBottom: "30px",
          color: theme.text
        }}>
          <h2 style={{ marginTop: 0, fontSize: "20px", fontWeight: 600, marginBottom: "20px" }}>
            📈 Reminders Sent per Month
          </h2>
          {reminderAnalytics.length > 0 ? (
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reminderAnalytics} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                  <XAxis dataKey="month" stroke={theme.textSecondary} />
                  <YAxis allowDecimals={false} stroke={theme.textSecondary} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: "8px", color: theme.text }}
                    itemStyle={{ color: "#764ba2", fontWeight: 600 }}
                  />
                  <Line type="monotone" dataKey="count" name="Reminders Sent" stroke="#764ba2" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <p style={{ textAlign: "center", color: theme.textSecondary }}>Loading analytics...</p>
          )}
        </div>

        <button
          style={{
            ...styles.btn,
            background: theme.secondaryGradient,
            boxShadow: `0 4px 15px ${theme.shadowColor}`,
          }}
          onClick={() => navigate("/admin/pending")}
        >
          👥 View Pending Users
        </button>

        <button
          style={{
            ...styles.btn,
            background: theme.primaryGradient,
            boxShadow: `0 4px 15px ${theme.shadowColor}`,
            marginLeft: "15px"
          }}
          onClick={() => navigate("/admin/chat")}
        >
          💬 Live Chat
        </button>

        {/* -------- USERS LIST -------- */}
        <h2 style={{ marginTop: "40px", fontSize: "24px", fontWeight: 700, color: theme.text }}>👨‍💼 Admin Management</h2>

        {loadingUsers ? (
          <p style={{ textAlign: "center", color: theme.textSecondary }}>Loading admins...</p>
        ) : users.filter(u => u.role === "ADMIN").length === 0 ? (
          <p style={{ textAlign: "center", color: theme.textSecondary }}>No admins available</p>
        ) : (
          users.filter(u => u.role === "ADMIN").map((u) => (
            <div key={u.id} style={{
              ...styles.userCard,
              background: theme.surface,
              borderColor: theme.border,
              color: theme.text,
            }}>
              <div>
                <strong style={{ fontSize: "16px", color: theme.text }}>{u.name}</strong>
                <p style={{ margin: "6px 0", color: theme.textSecondary, fontSize: "14px" }}>{u.email}</p>
                <small style={{ color: theme.secondary }}>
                  Role: <b style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>ADMIN</b>
                </small>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  style={{
                    ...styles.roleBtn,
                    background: theme.dangerGradient,
                    color: "white",
                  }}
                  onClick={() => toggleRole(u.email, u.role)}
                >
                  Remove Admin
                </button>
              </div>
            </div>
          ))
        )}

        {/* -------- REGULAR USERS -------- */}
        <h2 style={{ marginTop: "40px", fontSize: "24px", fontWeight: 700, color: theme.text }}>👥 Users Management</h2>

        {loadingUsers ? (
          <p style={{ textAlign: "center", color: theme.textSecondary }}>Loading users...</p>
        ) : users.filter(u => u.role !== "ADMIN").length === 0 ? (
          <p style={{ textAlign: "center", color: theme.textSecondary }}>No users available</p>
        ) : (
          users.filter(u => u.role !== "ADMIN").map((u) => {
            // Use the pre-fetched login status
            const isLoggedToday = userLoginStatus[u.id] || false;

            return (
              <div key={u.id} style={{
                ...styles.userCard,
                background: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <strong style={{ fontSize: "16px", color: theme.text }}>{u.name}</strong>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 600,
                        ...styles.statusBadge(isLoggedToday),
                      }}
                    >
                      {isLoggedToday ? "🟢 Logged Today" : "🔴 Not Logged Today"}
                    </span>
                  </div>
                  <p style={{ margin: "6px 0", color: theme.textSecondary, fontSize: "14px" }}>{u.email}</p>
                  <small style={{ color: theme.textTertiary }}>
                    Role: <b style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>USER</b>
                  </small>
                </div>

                <div style={styles.buttonGroup}>
                  <button
                    style={{
                      ...styles.logsBtn,
                      background: theme.secondaryGradient,
                    }}
                    onClick={() => viewUserLogs(u.id, u.name)}
                  >
                    📋 View Logs
                  </button>

                  <button
                    style={{
                      ...styles.roleBtn,
                      background: theme.primaryGradient,
                    }}
                    onClick={() => toggleRole(u.email, u.role)}
                  >
                    Make Admin
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ROLE CHANGE CONFIRM MODAL */}
      {roleChangeConfirm && (
        <div style={{
          ...styles.modalOverlay,
          zIndex: 10000,
          background: "rgba(0, 0, 0, 0.6)",
        }}>
          <div style={{
            ...styles.card,
            width: "350px",
            padding: "24px",
            textAlign: "center",
            background: theme.surface,
            color: theme.text,
            border: `1px solid ${theme.border}`,
            borderRadius: "20px",
            boxShadow: `0 15px 50px ${theme.shadowColorHeavy}`,
            margin: 0
          }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</div>
            <h3 style={{ margin: 0, marginBottom: "10px", fontSize: "18px" }}>Are you sure?</h3>
            <p style={{ margin: 0, marginBottom: "24px", fontSize: "14px", color: theme.textSecondary }}>
              You are about to <strong style={{color: "#e53935"}}>{roleChangeConfirm.action}</strong> for <br/>
              <span style={{color: theme.primary, fontWeight: "600"}}>{roleChangeConfirm.email}</span>
            </p>
            
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                style={{
                  ...styles.btn,
                  flex: 1,
                  margin: 0,
                  background: isDark ? "rgba(255,255,255,0.05)" : "#f0f0f5",
                  color: theme.text,
                  border: `1px solid ${theme.border}`
                }}
                onClick={() => setRoleChangeConfirm(null)}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.btn,
                  flex: 1,
                  margin: 0,
                  background: theme.primaryGradient,
                  color: "white",
                }}
                onClick={handleConfirmRoleChange}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ---------- STYLES ----------
const styles = {
  page: {
    minHeight: "calc(100vh - 70px)",
    padding: "clamp(15px, 5vw, 30px)",
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  card: {
    padding: "clamp(16px, 4vw, 24px)",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "12px",
    border: "none",
    width: "100%",
    color: "white",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
    marginBottom: "25px",
  },
  btn: {
    marginTop: "20px",
    padding: "clamp(10px, 2vw, 12px) clamp(18px, 3vw, 24px)",
    background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    color: "white",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "clamp(12px, 2vw, 14px)",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  userCard: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "clamp(10px, 3vw, 20px)",
    padding: "clamp(12px, 3vw, 18px)",
    border: "1px solid #ecf0f1",
    borderRadius: "12px",
    marginBottom: "12px",
    flexWrap: "wrap",
    background: "white",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
  },
  buttonGroup: {
    display: "flex",
    gap: "clamp(8px, 2vw, 10px)",
    flexWrap: "wrap",
    minWidth: "auto",
  },
  logsBtn: {
    color: "white",
    padding: "clamp(8px, 2vw, 10px) clamp(12px, 2vw, 16px)",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "clamp(11px, 2vw, 13px)",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    flex: 1,
    minWidth: "120px",
  },
  roleBtn: {
    color: "white",
    padding: "clamp(8px, 2vw, 10px) clamp(12px, 2vw, 16px)",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "clamp(11px, 2vw, 13px)",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    flex: 1,
    minWidth: "120px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
    padding: "clamp(10px, 3vw, 20px)",
  },
  modal: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
    maxWidth: "600px",
    width: "100%",
    maxHeight: "85vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
    borderBottom: "1px solid #ecf0f1",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  },
  closeBtn: {
    background: "rgba(255, 255, 255, 0.2)",
    border: "none",
    color: "white",
    fontSize: "24px",
    cursor: "pointer",
    borderRadius: "8px",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },
  logsList: {
    overflow: "auto",
    padding: "20px",
  },
  logItem: {
    padding: "16px",
    background: "#f8f9fa",
    borderRadius: "12px",
    marginBottom: "12px",
    border: "1px solid #ecf0f1",
  },
  statusBadge: (isLoggedToday) => ({
    background: isLoggedToday
      ? "linear-gradient(135deg, #38ef7d 0%, #11998e 100%)"
      : "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
    color: "white",
  }),
};
