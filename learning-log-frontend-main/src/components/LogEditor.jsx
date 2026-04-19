import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import api from "../pages/api";

export default function LogEditor({ selectedDate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [logs, setLogs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [viewAll, setViewAll] = useState(false);
  const { theme } = useContext(ThemeContext);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  const isEditable = true;

  useEffect(() => {
    if (!selectedDate || viewAll) return;
    loadLogsForDate();
  }, [selectedDate, viewAll]);

  const loadLogsForDate = async () => {
    if (!selectedDate) return;
    const res = await api.get(`/logs/date?date=${selectedDate}`);
    setLogs(res.data);
  };

  const loadAllLogs = async () => {
    const res = await api.get("/logs/my");
    setLogs(res.data);
  };

  const handleSave = async () => {
    if (!isEditable) {
      alert("❌ You can only save logs for today");
      return;
    }

    await api.post("/logs", { date: selectedDate, title, description, tag });
    resetForm();

    viewAll ? loadAllLogs() : loadLogsForDate();
  };

  const handleUpdate = async () => {
    await api.put(`/logs/${editingId}`, { title, description, tag });

    resetForm();

    viewAll ? loadAllLogs() : loadLogsForDate();
  };

  const handleDelete = async (id) => {
    await api.delete(`/logs/${id}`);
    viewAll ? loadAllLogs() : loadLogsForDate();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTag("");
    setEditingId(null);
  };

  return (
    <div>
      <h2 style={{ ...styles.sectionTitle, color: theme.text }}>
        {viewAll ? "All Your Logs" : selectedDate ? `Logs for ${selectedDate}` : "Select a Date"}
      </h2>

      {/* BUTTONS */}
      <div style={styles.topBar}>
        <button
          style={{ ...styles.btnPrimary, background: theme.primaryGradient }}
          onClick={() => {
            setViewAll(true);
            loadAllLogs();
          }}
        >
          View All Logs
        </button>

        {viewAll && selectedDate && (
          <button
            style={{ ...styles.btnSecondary, background: theme.textSecondary }}
            onClick={() => {
              setViewAll(false);
              loadLogsForDate();
            }}
          >
            Back to Selected Date
          </button>
        )}
      </div>

      {/* FORM - ONLY FOR TODAY */}
      {isEditable && (
        <>
          {/* RULE MESSAGE */}
          {selectedDate && !isEditable && (
            <div style={{
              ...styles.warning,
              background: theme.isDark ? theme.surface : "#fff3cd",
              borderColor: theme.warning,
              color: theme.warning,
            }}>
              ❌ Editing allowed only for TODAY — {today}
            </div>
          )}

          {/* FORM */}
          <div style={{
            ...styles.form,
            background: theme.surface,
          }}>
            <input
              style={{
                ...styles.input,
                background: theme.background,
                color: theme.text,
                borderColor: theme.border,
              }}
              placeholder="Title"
              disabled={!isEditable}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              style={{
                ...styles.textarea,
                background: theme.background,
                color: theme.text,
                borderColor: theme.border,
              }}
              placeholder="Description"
              disabled={!isEditable}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              style={{
                ...styles.input,
                background: theme.background,
                color: theme.text,
                borderColor: theme.border,
              }}
              placeholder="Tag"
              disabled={!isEditable}
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />

            {editingId ? (
              <button style={{ ...styles.btnPrimary, background: theme.primaryGradient }} disabled={!isEditable} onClick={handleUpdate}>
                Update Log
              </button>
            ) : (
              <button style={{ ...styles.btnPrimary, background: theme.primaryGradient }} disabled={!isEditable} onClick={handleSave}>
                Save Log
              </button>
            )}
          </div>

          <hr style={{ margin: "25px 0", borderColor: theme.border }} />
        </>
      )}

      <h3 style={{ ...styles.sectionTitle, color: theme.text }}>{viewAll ? "All Logs" : "Logs"}</h3>

      {logs.map((log) => (
        <div key={log.id} style={{
          ...styles.logCard,
          background: theme.surface,
          borderColor: theme.border,
          color: theme.text,
          boxShadow: `0 2px 8px ${theme.shadowColor}`,
        }}>
          <p><b>Date:</b> {log.date}</p>
          <h4 style={{ color: theme.text }}>{log.title}</h4>
          <p style={{ color: theme.text }}>{log.description}</p>
          <small style={{ color: theme.textSecondary }}>Tag: {log.tag}</small>

          <div style={styles.cardActions}>
            <button
              style={{
                ...styles.btnSmall,
                background: theme.secondaryGradient,

              }}

              onClick={() => {
                setEditingLog(log);
                setTitle(log.title);
                setDescription(log.description);
                setTag(log.tag);
                setEditModalOpen(true);
              }}
            >
              Edit
            </button>

            <button style={{ ...styles.btnDelete, background: theme.dangerGradient }} onClick={() => handleDelete(log.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}

        {editModalOpen && (
  <div style={modalStyles.overlay}>
    <div style={modalStyles.modal}>

      <h2>Edit Log</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        style={modalStyles.input}
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        style={modalStyles.textarea}
      />

      <input
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        placeholder="Tag"
        style={modalStyles.input}
      />

      <button
        onClick={async () => {
          await api.put(`/logs/${editingLog.id}`, {
            title,
            description,
            tag,
          });

          setEditModalOpen(false);
          viewAll ? loadAllLogs() : loadLogsForDate();
        }}
        style={modalStyles.updateBtn}
      >
        Update Log
      </button>

      <button
        onClick={() => setEditModalOpen(false)}
        style={modalStyles.cancelBtn}
      >
        Cancel
      </button>

    </div>
  </div>
)}


    </div>
  );
}

const styles = {
  warning: {
    padding: "clamp(10px, 2vw, 14px) clamp(12px, 2vw, 16px)",
    borderRadius: "8px",
    border: "2px solid",
    marginBottom: "20px",
    fontWeight: 500,
    fontSize: "clamp(12px, 2vw, 14px)",
  },
  sectionTitle: {
    fontSize: "clamp(18px, 4vw, 24px)",
    fontWeight: 700,
    marginBottom: "clamp(15px, 3vw, 20px)",
  },
  topBar: {
    display: "flex",
    gap: "clamp(8px, 2vw, 12px)",
    marginBottom: "clamp(20px, 3vw, 25px)",
    flexWrap: "wrap",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "clamp(12px, 2vw, 16px)",
    padding: "clamp(15px, 3vw, 20px)",
    borderRadius: "12px",
    marginBottom: "clamp(20px, 3vw, 25px)",
  },
  input: {
    padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
    borderRadius: "8px",
    border: "2px solid",
    fontSize: "clamp(13px, 2vw, 14px)",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
    minHeight: "120px",
    borderRadius: "8px",
    border: "2px solid",
    fontSize: "clamp(13px, 2vw, 14px)",
    fontFamily: "inherit",
    resize: "vertical",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
  },
  btnPrimary: {
    padding: "clamp(10px, 2vw, 12px) clamp(18px, 3vw, 24px)",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    border: "none",
    fontWeight: 600,
    fontSize: "clamp(12px, 2vw, 14px)",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  btnSecondary: {
    padding: "clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)",
    color: "white",
    borderRadius: "8px",
    border: "none",
    fontWeight: 600,
    fontSize: "clamp(12px, 2vw, 14px)",
    transition: "all 0.3s ease",
  },
  btnSmall: {
    padding: "clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)",
    borderRadius: "6px",
    border: "none",
    color: "white",
    fontWeight: 600,
    fontSize: "clamp(11px, 1.5vw, 12px)",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  btnDelete: {
    padding: "clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)",
    borderRadius: "6px",
    border: "none",
    color: "white",
    fontWeight: 600,
    fontSize: "clamp(11px, 1.5vw, 12px)",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  logCard: {
    padding: "clamp(12px, 3vw, 18px)",
    borderRadius: "12px",
    border: "1px solid",
    marginBottom: "clamp(12px, 2vw, 15px)",
    transition: "all 0.3s ease",
  },
  cardActions: {
    display: "flex",
    gap: "clamp(8px, 2vw, 10px)",
    marginTop: "clamp(12px, 2vw, 15px)",
    flexWrap: "wrap",
  },
  
};

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    padding: "25px",
    borderRadius: "10px",
    width: "400px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  textarea: {
    width: "100%",
    minHeight: "100px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  updateBtn: {
    background: "#007bff",
    color: "white",
    padding: "8px 15px",
    border: "none",
    borderRadius: "6px",
    marginRight: "10px",
    cursor: "pointer",
  },
  cancelBtn: {
    background: "#6c757d",
    color: "white",
    padding: "8px 15px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};