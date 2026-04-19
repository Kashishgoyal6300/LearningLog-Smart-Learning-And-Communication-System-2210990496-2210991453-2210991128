import { useState, useContext, useEffect, useRef } from "react";
import { ChatContext } from "../context/ChatContext";
import { ThemeContext } from "../context/ThemeContext";

export default function ChatWidget({ userEmail }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { messages, sendMessage, setMessages } = useContext(ChatContext);
  const { theme, isDark } = useContext(ThemeContext);
  const [inputText, setInputText] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteChat = () => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8080/api/chat/history?room=${encodeURIComponent(userEmail)}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    }).then(res => {
      if (res.ok) setMessages([]);
    });
    setShowMenu(false);
  };

  // Load chat history when widget opens
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem("token");
      if (!token || !userEmail) return;
      fetch(`http://localhost:8080/api/chat/history?room=${encodeURIComponent(userEmail)}`, {
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
        .catch(err => console.error("Could not fetch chat history:", err.message));
    }
  }, [isOpen, userEmail]);

  // Reset unread badge immediately when user opens the chat
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [isOpen]);

  // Only increment badge for new messages that arrive while chat is closed
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.senderEmail !== userEmail) {
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(userEmail, inputText);
    setInputText("");
  };

  const handeKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div style={styles.container}>
      {isOpen && (
        <div style={{
          ...styles.chatWindow, 
          background: isDark ? theme.background : "#ffffff",
          borderColor: theme.border,
          boxShadow: `0 10px 40px ${theme.shadowColorHeavy}`
        }}>
          {/* Header */}
          <div style={{
            ...styles.header,
            background: theme.primaryGradient
          }}>
            <h3 style={styles.headerTitle}>💬 Chat with Admin</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Three-dots menu */}
              <div ref={menuRef} style={{ position: "relative" }}>
                <button
                  style={{...styles.closeBtn, fontSize: "18px", letterSpacing: "2px"}}
                  onClick={() => setShowMenu(prev => !prev)}
                  title="Options"
                >⋮</button>
                {showMenu && (
                  <div style={{
                    position: "absolute",
                    top: "36px",
                    right: 0,
                    background: "white",
                    borderRadius: "10px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                    overflow: "hidden",
                    zIndex: 100,
                    minWidth: "150px"
                  }}>
                    <button
                      onClick={handleDeleteChat}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "none",
                        background: "white",
                        color: "#e53935",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >🗑 Delete Chat</button>
                  </div>
                )}
              </div>
              <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{...styles.messagesArea, background: isDark ? theme.surface : "#f8f9fa"}}>
            {messages.length === 0 ? (
              <p style={{...styles.noMessages, color: theme.textSecondary}}>No messages yet. Say hello!</p>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.senderEmail === userEmail;
                const senderName = isMe ? "You" : "Admin";
                return (
                  <div key={idx} style={{
                    ...styles.messageWrapper,
                    justifyContent: isMe ? "flex-end" : "flex-start"
                  }}>
                    <div style={{ maxWidth: "80%" }}>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: isMe ? theme.primary : theme.textSecondary,
                        display: "block",
                        marginBottom: "3px",
                        paddingLeft: isMe ? "0" : "4px",
                        textAlign: isMe ? "right" : "left",
                      }}>{senderName}</span>
                      <div style={{
                        ...styles.messageBubble,
                        maxWidth: "100%",
                        background: isMe ? theme.primaryGradient : (isDark ? theme.background : "#e9ecef"),
                        color: isMe ? "white" : theme.text,
                        borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        border: isMe ? "none" : `1px solid ${theme.border}`
                      }}>
                        <p style={styles.messageText}>{msg.content}</p>
                        <span style={{
                          ...styles.time,
                          color: isMe ? "rgba(255,255,255,0.7)" : theme.textSecondary
                        }}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            ...styles.inputArea,
            background: isDark ? theme.background : "#ffffff",
            borderTop: `1px solid ${theme.border}`
          }}>
            <input 
              type="text"
              style={{
                ...styles.input,
                background: isDark ? theme.surface : "#f1f3f5",
                color: theme.text,
                border: `1px solid ${theme.border}`
              }}
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handeKeyPress}
            />
            <button 
              style={{
                ...styles.sendBtn,
                background: inputText.trim() ? theme.primaryGradient : theme.surface,
                color: inputText.trim() ? "white" : theme.textSecondary,
                cursor: inputText.trim() ? "pointer" : "default"
              }}
              onClick={handleSend}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button 
          style={{
            ...styles.fab,
            background: theme.primaryGradient,
            boxShadow: `0 4px 15px ${theme.shadowColorHeavy}`
          }}
          onClick={() => setIsOpen(true)}
        >
          {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
          <span style={styles.fabIcon}>💬</span>
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    zIndex: 9999,
  },
  fab: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },
  fabIcon: {
    fontSize: "24px",
    color: "white"
  },
  badge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    background: "#ff4757",
    color: "white",
    fontSize: "12px",
    fontWeight: "bold",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid white",
  },
  chatWindow: {
    width: "350px",
    height: "500px",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    border: "1px solid",
    animation: "slideUp 0.3s ease",
  },
  header: {
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    margin: 0,
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
  },
  closeBtn: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "white",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    transition: "background 0.2s",
  },
  messagesArea: {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  noMessages: {
    textAlign: "center",
    marginTop: "40px",
    fontSize: "14px",
  },
  messageWrapper: {
    display: "flex",
    width: "100%",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: "10px 14px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },
  messageText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "1.4",
  },
  time: {
    fontSize: "10px",
    display: "block",
    textAlign: "right",
    marginTop: "4px",
  },
  inputArea: {
    padding: "16px",
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: "10px 16px",
    borderRadius: "20px",
    outline: "none",
    fontSize: "14px",
    transition: "border 0.2s",
  },
  sendBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    transition: "all 0.2s",
  }
};
