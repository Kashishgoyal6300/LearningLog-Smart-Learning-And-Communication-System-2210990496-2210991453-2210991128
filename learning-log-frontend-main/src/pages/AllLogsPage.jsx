import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AllLogsPage() {
  const [logs, setLogs] = useState([]);

 

  // ---------- LOAD ALL LOGS ----------
  const loadLogs = async () => {
    const res = await api.get("/api/logs/my");
    setLogs(res.data);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // ---------- DELETE ----------
  const handleDelete = async (id) => {
    await api.delete(`/api/logs/${id}`);
    loadLogs();
  };

  // ---------- GROUP LOGS BY DATE ----------
  const logsByDate = logs.reduce((groups, log) => {
    if (!groups[log.date]) groups[log.date] = [];
    groups[log.date].push(log);
    return groups;
  }, {});

  // Sort dates: latest first
  const sortedDates = Object.keys(logsByDate).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1>All Your Logs</h1>

      {sortedDates.map((date) => (
        <div key={date} style={{ marginBottom: "30px" }}>
          
          {/* DATE HEADER */}
          <h2 style={{ color: "#007bff" }}>{date}</h2>
          <hr />

          {logsByDate[date].map((log) => (
            <div
              key={log.id}
              style={{
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                marginBottom: "15px",
                background: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              {/* TITLE */}
              <h3>{log.title}</h3>

              {/* DATE INSIDE CARD */}
              <p style={{ fontSize: "14px", color: "#666" }}>
                <strong>Date:</strong> {log.date}
              </p>

              {/* DESCRIPTION */}
              <p>{log.description}</p>

              {/* TAG */}
              <small style={{ color: "#777" }}>
                Tag: {log.tag || "No tag"}
              </small>

              {/* ACTION BUTTONS */}
              <div style={{ marginTop: "10px" }}>
                <button
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "none",
                    marginRight: "10px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(log.id)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>

            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

