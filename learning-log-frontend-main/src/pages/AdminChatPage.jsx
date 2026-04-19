import { useState, useEffect, useContext, useRef } from "react";
import api from "../api/axios";
import { ChatContext } from "../context/ChatContext";
import { ThemeContext } from "../context/ThemeContext";
import Header from "../components/Header";

export default function AdminChatPage() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  const { 
    messages, setMessages, sendMessage, 
    activeRoom, setActiveRoom, unreadRooms, isConnected, lastMessageTime 
  } = useContext(ChatContext);
  const { theme, isDark } = useContext(ThemeContext);

  const [inputText, setInputText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load users
    api.get("/admin/users")
      .then(res => {
        const regularUsers = res.data.filter(u => u.role === "USER");
        setUsers(regularUsers);
        setLoadingUsers(false);
      })
      .catch(err => {
        console.error("Failed to load users", err);
        setLoadingUsers(false);
      });
  }, []);

  // When active room changes, load history
  useEffect(() => {
    if (activeRoom) {
      const token = localStorage.getItem("token");
      fetch(`http://localhost:8080/api/chat/history?room=${encodeURIComponent(activeRoom)}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
        .then(res => {
          if (!res.ok) return res.text().then(t => { throw new Error(t); });
          return res.json();
        })
        .then(data => {
          setMessages(data);
          setTimeout(() => messagesEndRef.current?.scrollIntoView(), 100);
        })
        .catch(err => console.error("Failed to load chat history:", err.message));
    } else {
      setMessages([]);
    }
  }, [activeRoom, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !activeRoom) return;
    sendMessage(activeRoom, inputText);
    setInputText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      <Header />
      <div style={{...styles.page, background: theme.background, color: theme.text}}>
        <div style={{...styles.container, background: theme.surface, borderColor: theme.border}}>
          
          {/* Sidebar */}
           <div style={{...styles.sidebar, borderRight: `1px solid ${theme.border}`}}>
             <div style={{padding: "16px 20px", borderBottom: `1px solid ${theme.border}`}}>
               <h3 style={{margin: 0, marginBottom: "12px", fontSize: "16px"}}>Users</h3>
               {/* Quick jump dropdown */}
               <select
                 value={activeRoom || ""}
                 onChange={e => setActiveRoom(e.target.value || null)}
                 style={{
                   width: "100%",
                   padding: "9px 14px",
                   borderRadius: "10px",
                   border: `1px solid ${theme.border}`,
                   background: isDark ? theme.background : "#f4f6f8",
                   color: theme.text,
                   fontSize: "14px",
                   fontWeight: "500",
                   cursor: "pointer",
                   outline: "none"
                 }}
               >
                 <option value="">— Select a user —</option>
                 {users.map(u => (
                   <option key={u.id} value={u.email}>{u.name} ({u.email})</option>
                 ))}
               </select>
             </div>
             
             {/* Diagnostic Status Bar */}
             <div style={{
               padding: "10px 20px", 
               fontSize: "11px", 
               background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
               borderBottom: `1px solid ${theme.border}`,
               display: "flex",
               justifyContent: "space-between",
               color: theme.textSecondary
             }}>
               <span>Conn: <span style={{color: isConnected ? "#28a745" : "#dc3545", fontWeight: "bold"}}>{isConnected ? "OK" : "ERR"}</span></span>
               <span>Unread: <strong style={{color: unreadRooms.length > 0 ? "#ff4757" : "inherit"}}>{unreadRooms.length}</strong></span>
               <span>Last: <strong style={{color: theme.primary}}>{lastMessageTime || "None"}</strong></span>
             </div>
            <div style={styles.userList}>
              {loadingUsers ? <p style={{padding: "20px"}}>Loading users...</p> : 
                users.map(u => (
                  <div 
                    key={u.id}
                    style={{
                      ...styles.userItem,
                      background: activeRoom === u.email ? theme.primaryGradient : "transparent",
                      color: activeRoom === u.email ? "white" : theme.text,
                    }}
                    onClick={() => setActiveRoom(u.email)}
                  >
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                      <div style={{fontWeight: "bold"}}>{u.name}</div>
                      {unreadRooms.includes(u.email) && (
                        <span style={{
                          background: "#ff4757", 
                          color: "white", 
                          borderRadius: "12px", 
                          padding: "2px 8px", 
                          fontSize: "10px", 
                          fontWeight: "bold",
                          boxShadow: "0 2px 5px rgba(255, 71, 87, 0.3)"
                        }}>NEW</span>
                      )}
                    </div>
                    <div style={{fontSize: "12px", opacity: 0.8}}>{u.email}</div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Chat Area */}
          <div style={styles.chatArea}>
            {!activeRoom ? (
              <div style={styles.emptyState}>
                <h2 style={{color: theme.textSecondary}}>Select a user to start chatting</h2>
              </div>
            ) : (
              <>
                <div style={{
                  ...styles.chatHeader,
                  background: theme.primaryGradient,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <h3 style={{margin: 0}}>Chatting with {users.find(u => u.email === activeRoom)?.name}</h3>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                      background: "rgba(255,80,80,0.85)",
                      border: "none",
                      borderRadius: "20px",
                      color: "white",
                      padding: "8px 18px",
                      fontWeight: "bold",
                      fontSize: "13px",
                      cursor: "pointer",
                      backdropFilter: "blur(4px)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      transition: "background 0.2s"
                    }}
                  >
                    🗑 Delete Chat
                  </button>
                </div>

                <div style={styles.messagesContainer}>
                  {messages.map((msg, idx) => {
                    const isAdmin = msg.senderRole === "ADMIN";
                    const activeUser = users.find(u => u.email === activeRoom);
                    const senderName = isAdmin ? "You" : (activeUser?.name || msg.senderEmail);
                    return (
                      <div key={idx} style={{
                        ...styles.messageWrapper,
                        justifyContent: isAdmin ? "flex-end" : "flex-start"
                      }}>
                        <div style={{ maxWidth: "70%" }}>
                          <span style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: isAdmin ? theme.primary : "#7b5ea7",
                            display: "block",
                            marginBottom: "3px",
                            paddingLeft: isAdmin ? "0" : "4px",
                            textAlign: isAdmin ? "right" : "left",
                          }}>{senderName}</span>
                          <div style={{
                            ...styles.messageBubble,
                            maxWidth: "100%",
                            background: isAdmin ? theme.primaryGradient : (isDark ? theme.background : "#e9ecef"),
                            color: isAdmin ? "white" : theme.text,
                            borderRadius: isAdmin ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                            border: isAdmin ? "none" : `1px solid ${theme.border}`
                          }}>
                            <p style={{margin: 0, fontSize: "15px"}}>{msg.content}</p>
                            <span style={{
                              display: "block",
                              textAlign: "right",
                              fontSize: "11px",
                              marginTop: "4px",
                              opacity: 0.8
                            }}>
                              {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div style={{
                  ...styles.inputArea,
                  borderTop: `1px solid ${theme.border}`,
                  background: theme.surface
                }}>
                  <input 
                    style={{
                      ...styles.input,
                      background: isDark ? theme.background : "#f4f6f8",
                      color: theme.text,
                      border: `1px solid ${theme.border}`
                    }}
                    placeholder="Type a reply..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button 
                    style={{
                      ...styles.sendBtn,
                      background: theme.primaryGradient
                    }}
                    onClick={handleSend}
                  >
                    Send
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

    {/* Custom Delete Confirmation Modal */}
    {showDeleteConfirm && (
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.45)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          background: "white", borderRadius: "18px",
          padding: "32px 36px", minWidth: "320px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>🗑️</div>
          <h3 style={{ margin: "0 0 8px", fontSize: "20px", color: "#1a1a2e" }}>Delete Chat?</h3>
          <p style={{ color: "#666", margin: "0 0 24px", fontSize: "14px" }}>
            This will permanently delete all messages with this user.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={() => {
                const token = localStorage.getItem("token");
                fetch(`http://localhost:8080/api/chat/history?room=${encodeURIComponent(activeRoom)}`, {
                  method: "DELETE",
                  headers: { "Authorization": `Bearer ${token}` }
                }).then(res => {
                  if (res.ok) {
                    setMessages([]);
                    setShowDeleteConfirm(false);
                  } else {
                    console.error("Failed to delete chat");
                  }
                });
              }}
              style={{
                background: "linear-gradient(135deg, #e53935, #c62828)",
                color: "white", border: "none", borderRadius: "10px",
                padding: "12px 28px", fontWeight: "bold", fontSize: "15px",
                cursor: "pointer", boxShadow: "0 4px 12px rgba(229,57,53,0.35)"
              }}
            >Yes, Delete</button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={{
                background: "#f0f0f0", color: "#333", border: "none",
                borderRadius: "10px", padding: "12px 28px",
                fontWeight: "bold", fontSize: "15px", cursor: "pointer"
              }}
            >Cancel</button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 70px)",
    padding: "clamp(15px, 5vw, 30px)",
    display: "flex",
    justifyContent: "center"
  },
  container: {
    width: "100%",
    maxWidth: "1200px",
    height: "calc(100vh - 120px)",
    borderRadius: "16px",
    display: "flex",
    overflow: "hidden",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    border: "1px solid"
  },
  sidebar: {
    width: "300px",
    display: "flex",
    flexDirection: "column",
  },
  userList: {
    flex: 1,
    overflowY: "auto",
  },
  userItem: {
    padding: "15px 20px",
    cursor: "pointer",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
    transition: "all 0.2s ease"
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chatHeader: {
    padding: "20px",
  },
  messagesContainer: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  messageWrapper: {
    display: "flex",
    width: "100%"
  },
  messageBubble: {
    maxWidth: "70%",
    padding: "12px 18px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
  },
  inputArea: {
    padding: "20px",
    display: "flex",
    gap: "15px",
    alignItems: "center"
  },
  input: {
    flex: 1,
    padding: "14px 20px",
    borderRadius: "24px",
    outline: "none",
    fontSize: "15px"
  },
  sendBtn: {
    padding: "12px 24px",
    borderRadius: "24px",
    border: "none",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "15px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  }
};
