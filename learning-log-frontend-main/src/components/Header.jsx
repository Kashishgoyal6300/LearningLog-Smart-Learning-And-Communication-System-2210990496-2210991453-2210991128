import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const { logout } = useContext(AuthContext);
  const { showToast } = useToast();
  const { theme, isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/profile");
        setProfile(res.data);
      } catch (e) {
        console.error("Profile load failed", e);
        setError(true);
      }
    };

    loadProfile();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownOpen && !e.target.closest('[data-dropdown-container]')) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleEditClick = (field) => {
    setEditModal(field);
    setEditForm({ [field]: profile?.[field] || "" });
  };

  const handleSaveChange = async () => {
    setLoading(true);
    try {
      if (editModal === "password") {
        await api.put("/profile/password", {
          newPassword: editForm.password,
        });

        showToast("Password updated successfully", "success");
      } else {
        const res = await api.put("/profile", editForm);
        setProfile(res.data);

        showToast("Profile updated successfully", "success");
      }

      setEditModal(null);
      setDropdownOpen(false);
    } catch (e) {
      showToast(e.response?.data || "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <div style={{
        ...styles.header,
        background: theme.primaryGradient,
        borderBottomColor: theme.border,
      }}>
        <div style={styles.left}>
          <h3 style={styles.logo} onClick={() => navigate("/")} title="Go to home">
            📚 Learning Log
          </h3>
          <button 
            style={{
              ...styles.navItem, 
              color: "white", 
              marginLeft: "24px",
              background: "rgba(255,255,255,0.15)"
            }} 
            onClick={() => navigate("/ai")}
          >
            🤖 AI Assistant
          </button>
          <button 
            style={{
              ...styles.navItem, 
              color: "white", 
              marginLeft: "12px",
              background: "rgba(255,255,255,0.15)"
            }} 
            onClick={() => navigate("/compiler")}
          >
            💻 Java Compiler
          </button>
        </div>

        <div style={styles.right}>
          <button
            style={{
              ...styles.themeToggle,
              background: theme.surface,
              color: theme.text,
              border: `2px solid ${theme.border}`,
            }}
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          {error ? (
            <span style={styles.error}>Profile unavailable</span>
          ) : profile ? (
            <div style={styles.profileContainer} data-dropdown-container="true">
              <button
                style={styles.profileBtn}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                title={profile.name}
              >
                <div style={styles.avatar}>{getInitials(profile.name)}</div>
              </button>

              {dropdownOpen && (
                <div style={{
                  ...styles.dropdown,
                  background: theme.background,
                  boxShadow: `0 8px 32px ${theme.shadowColorHeavy}`,
                }}>
                  <div style={{
                    ...styles.dropdownHeader,
                    background: theme.surface,
                    borderBottomColor: theme.border,
                  }}>
                    <div style={styles.avatarLarge}>{getInitials(profile.name)}</div>
                    <div>
                      <p style={{...styles.dropdownName, color: theme.text}}>{profile.name}</p>
                      <p style={{...styles.dropdownEmail, color: theme.textSecondary}}>{profile.email}</p>
                    </div>
                  </div>

                  <div style={{...styles.dropdownDivider, borderTopColor: theme.border}}></div>

                  <button
                    style={{...styles.dropdownItem, color: theme.text}}
                    onClick={() => {
                      handleEditClick("name");
                    }}
                  >
                    ✏️ Edit Name
                  </button>

                  <button
                    style={{...styles.dropdownItem, color: theme.text}}
                    onClick={() => {
                      handleEditClick("email");
                    }}
                  >
                    ✉️ Change Email
                  </button>

                  <button
                    style={{...styles.dropdownItem, color: theme.text}}
                    onClick={() => {
                      handleEditClick("password");
                    }}
                  >
                    🔐 Change Password
                  </button>

                  <div style={{...styles.dropdownDivider, borderTopColor: theme.border}}></div>

                  <button
                    style={{...styles.dropdownItem, ...styles.logoutItem, color: theme.danger}}
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                      navigate("/");
                    }}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <span style={styles.loading}>Loading...</span>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editModal && (
        <div style={{...styles.modalOverlay, background: theme.modalBackdrop}} onClick={() => setEditModal(null)}>
          <div style={{...styles.modal, background: theme.background, color: theme.text}} onClick={(e) => e.stopPropagation()}>
            <h3 style={{...styles.modalTitle, color: theme.text}}>
              {editModal === "name" && "✏️ Edit Name"}
              {editModal === "email" && "✉️ Change Email"}
              {editModal === "password" && "🔐 Change Password"}
            </h3>

            <div style={styles.modalForm}>
              <label style={{...styles.label, color: theme.primary}}>
                {editModal === "name" && "New Name"}
                {editModal === "email" && "New Email"}
                {editModal === "password" && "New Password"}
              </label>
              <input
                style={{...styles.input, background: theme.surface, color: theme.text, borderColor: theme.border}}
                type={editModal === "password" ? "password" : "text"}
                placeholder={
                  editModal === "name" ? "Enter your name" :
                  editModal === "email" ? "Enter your email" :
                  "Enter new password"
                }
                value={editForm[editModal] || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, [editModal]: e.target.value })
                }
              />
            </div>

            <div style={styles.modalButtons}>
              <button
                style={{...styles.btnCancel, background: theme.surface, color: theme.text, border: `2px solid ${theme.border}`}}
                onClick={() => setEditModal(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                style={{...styles.btnSave, background: theme.primaryGradient}}
                onClick={handleSaveChange}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  header: {
    height: "70px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 max(15px, 5%)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
  },
  left: {
    display: "flex",
    alignItems: "center",
  },
  navItem: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  logo: {
    margin: 0,
    fontWeight: 700,
    fontSize: "clamp(16px, 3vw, 20px)",
    color: "white",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  themeToggle: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },
  profileContainer: {
    position: "relative",
  },
  profileBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    transition: "all 0.3s ease",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: 700,
    fontSize: "14px",
    border: "2px solid white",
    transition: "all 0.3s ease",
  },

  dropdown: {
    position: "absolute",
    top: "60px",
    right: 0,
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
    width: "clamp(250px, 90vw, 280px)",
    maxHeight: "80vh",
    overflowY: "auto",
    overflow: "hidden",
    zIndex: 1001,
    animation: "slideDown 0.3s ease",
  },
  dropdownHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    background: "linear-gradient(135deg, #f5f7fa 0%, #e8ebf0 100%)",
    borderBottom: "1px solid #ecf0f1",
  },
  avatarLarge: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: 700,
    fontSize: "16px",
    flexShrink: 0,
  },
  dropdownName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 700,
    color: "#2c3e50",
  },
  dropdownEmail: {
    margin: "4px 0 0 0",
    fontSize: "12px",
    color: "#7f8c8d",
  },
  dropdownDivider: {
    height: "1px",
    background: "#ecf0f1",
  },
  dropdownItem: {
    width: "100%",
    padding: "12px 16px",
    border: "none",
    background: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    color: "#2c3e50",
    transition: "all 0.2s ease",
  },
  logoutItem: {
    color: "#c62828",
    fontWeight: 600,
  },
  loading: {
    fontSize: "14px",
    color: "white",
  },
  error: {
    fontSize: "14px",
    color: "#ffcccc",
  },
  
  // MODAL STYLES
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
    zIndex: 2000,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "white",
    borderRadius: "16px",
    padding: "clamp(20px, 5vw, 30px)",
    maxWidth: "400px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
  },
  modalTitle: {
    margin: "0 0 20px 0",
    fontSize: "clamp(16px, 4vw, 20px)",
    fontWeight: 700,
    color: "#2c3e50",
  },
  modalForm: {
    marginBottom: "25px",
  },
  label: {
    display: "block",
    fontSize: "clamp(11px, 2vw, 13px)",
    fontWeight: 600,
    color: "#667eea",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
    border: "2px solid #ecf0f1",
    borderRadius: "8px",
    fontSize: "clamp(13px, 2vw, 14px)",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
  },
  modalButtons: {
    display: "flex",
    gap: "12px",
    flexDirection: "column",
  },
  btnCancel: {
    flex: 1,
    padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
    background: "#ecf0f1",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "clamp(12px, 2vw, 13px)",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  btnSave: {
    flex: 1,
    padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "clamp(12px, 2vw, 13px)",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
};
