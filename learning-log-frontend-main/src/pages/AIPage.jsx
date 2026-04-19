import { useState, useContext, useEffect, useRef } from "react";
import { ThemeContext } from "../context/ThemeContext";
import Header from "../components/Header";
import { useToast } from "../context/ToastContext";

// Simple Markdown-like formatter
const formatMarkdown = (text, isDark = true) => {
  if (!text) return "";
  // 1. Escape HTML first
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. Code blocks (```code```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const bg = isDark ? "rgba(0,0,0,0.3)" : "#f8f9fa";
    const border = isDark ? "rgba(255,255,255,0.1)" : "#dee2e6";
    const color = isDark ? "#4ec9b0" : "#333";
    return `<pre style="background: ${bg}; padding: 15px; border-radius: 10px; margin: 10px 0; overflow-x: auto; font-family: monospace; border: 1px solid ${border};"><code style="color: ${color};">${code.trim()}</code></pre>`;
  });

  // 3. Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const bg = isDark ? "rgba(0,0,0,0.2)" : "#e9ecef";
    const color = isDark ? "#ce9178" : "#d63384";
    return `<code style="background: ${bg}; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: ${color};">${code}</code>`;
  });

  // 4. Bold (**text**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: inherit; font-weight: 800;">$1</strong>');

  // 5. Lists (* item)
  html = html.replace(/^\s*\* (.*$)/gm, '<li style="margin-left: 20px; margin-bottom: 5px;">$1</li>');

  // 6. Line breaks
  return html.split('\n').join('<br />');
};

export default function AIPage() {
  const { theme, isDark } = useContext(ThemeContext);
  const { showToast } = useToast();

  const SYSTEM_PROMPT = "You are a helpful and intelligent AI assistant. You provide high-quality, professional, and polite answers like ChatGPT. Use Markdown for structure, bolding, and code blocks.";

  // ... (existing states)
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("ai_sessions");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentSessionId, setCurrentSessionId] = useState(null);
  // ... [OMITTING INTERMEDIATE LINES for brevity in replacement chunk] ...
  // I will target the handleSend and rendering logic specifically below.

  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get current session
  const currentSession = sessions.find(s => s.id === currentSessionId) || null;
  const messages = currentSession ? currentSession.messages : [];

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem("ai_sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle New Chat
  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newSession = {
      id: newId,
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString()
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newId);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Handle Delete Chat
  const handleDeleteChat = (id, e) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (currentSessionId === id) {
      setCurrentSessionId(updated.length > 0 ? updated[0].id : null);
    }
    showToast("Chat deleted", "info");
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setLoading(false);
      showToast("Response stopped", "info");
    }
  };

  // Handle Send Message
  const handleSend = async (overrideText = null) => {
    const textToSend = overrideText !== null ? overrideText : inputText;
    if (!textToSend.trim()) return;

    let sessionId = currentSessionId;
    let currentSessions = [...sessions];

    // If no session selected, create one
    if (!sessionId) {
      const newId = Date.now().toString();
      const newSession = {
        id: newId,
        title: textToSend.slice(0, 30) + (textToSend.length > 30 ? "..." : ""),
        messages: [],
        createdAt: new Date().toISOString()
      };
      currentSessions = [newSession, ...currentSessions];
      setSessions(currentSessions);
      setCurrentSessionId(newId);
      sessionId = newId;
    }

    const userMsg = { role: "user", content: textToSend, id: Date.now().toString() };

    // Update session title if it's the first message
    const sessionIdx = currentSessions.findIndex(s => s.id === sessionId);
    if (currentSessions[sessionIdx].messages.length === 0) {
      currentSessions[sessionIdx].title = textToSend.slice(0, 30) + (textToSend.length > 30 ? "..." : "");
    }

    const updatedMessages = [...currentSessions[sessionIdx].messages, userMsg];
    currentSessions[sessionIdx].messages = updatedMessages;
    setSessions([...currentSessions]);

    if (overrideText === null) setInputText("");
    setLoading(true);

    // Setup AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/ollama/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: "llama3.2:latest",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...updatedMessages.map(m => ({ role: m.role, content: m.content }))
          ],
          stream: true,
          options: {
            temperature: 0.7,
            repeat_penalty: 1.2,
            num_ctx: 2048
          }
        })
      });

      if (!response.ok) throw new Error("Ollama connection failed");

      setLoading(false);
      setIsStreaming(true);

      // Add empty assistant message
      const aiMsgId = (Date.now() + 1).toString();
      setSessions(prev => {
        const next = [...prev];
        const idx = next.findIndex(s => s.id === sessionId);
        next[idx].messages = [...next[idx].messages, { role: "assistant", content: "", id: aiMsgId }];
        return next;
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullContent = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(l => l.trim());

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.message?.content) {
                fullContent += parsed.message.content;
                setSessions(prev => {
                  const next = [...prev];
                  const idx = next.findIndex(s => s.id === sessionId);
                  const msgIdx = next[idx].messages.findIndex(m => m.id === aiMsgId);
                  if (msgIdx !== -1) {
                    next[idx].messages[msgIdx].content = fullContent;
                  }
                  return next;
                });
              }
            } catch (e) {
              console.warn("JSON parse error in stream", e);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Stream aborted by user");
      } else {
        console.error(error);
        showToast("Could not connect to Ollama", "error");
        setSessions(prev => {
          const next = [...prev];
          const idx = next.findIndex(s => s.id === sessionId);
          next[idx].messages = [...next[idx].messages, { role: "assistant", content: "Error: Make sure Ollama is running ($env:OLLAMA_ORIGINS=\"*\" ; ollama serve)", id: Date.now().toString() }];
          return next;
        });
      }
    } finally {
      setLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Handle Edit Message
  const handleEdit = (msgId) => {
    const sessionIdx = sessions.findIndex(s => s.id === currentSessionId);
    if (sessionIdx === -1) return;

    const msgIdx = sessions[sessionIdx].messages.findIndex(m => m.id === msgId);
    if (msgIdx === -1) return;

    const oldText = sessions[sessionIdx].messages[msgIdx].content;

    // Truncate messages after this point
    const newMessages = sessions[sessionIdx].messages.slice(0, msgIdx);

    const updatedSessions = [...sessions];
    updatedSessions[sessionIdx].messages = newMessages;
    setSessions(updatedSessions);

    setInputText(oldText);
    inputRef.current?.focus();
  };

  return (
    <div style={{ ...styles.page, background: theme.background, color: theme.text }}>
      <Header />

      <div style={styles.container}>
        {/* Sidebar */}
        <aside style={{
          ...styles.sidebar,
          background: isDark ? "rgba(22, 33, 62, 0.8)" : "rgba(248, 249, 250, 0.8)",
          borderColor: theme.border,
          backdropFilter: "blur(10px)"
        }}>
          <button style={{ ...styles.newChatBtn, background: theme.primaryGradient }} onClick={handleNewChat}>
            + New Chat
          </button>

          <div style={styles.chatList}>
            {sessions.map(s => (
              <div
                key={s.id}
                onClick={() => setCurrentSessionId(s.id)}
                style={{
                  ...styles.chatItem,
                  background: currentSessionId === s.id ? (isDark ? theme.surfaceHover : "#e9ecef") : "transparent",
                  color: currentSessionId === s.id ? theme.primary : theme.text
                }}
              >
                <span style={styles.chatTitle}>{s.title}</span>
                <button style={styles.deleteBtn} onClick={(e) => handleDeleteChat(s.id, e)}>✕</button>
              </div>
            ))}
            {sessions.length === 0 && (
              <p style={{ textAlign: "center", color: theme.textSecondary, marginTop: "20px", fontSize: "14px" }}>No chats yet</p>
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main style={styles.main}>
          {!currentSessionId ? (
            <div style={styles.welcome}>
              <div style={{ ...styles.aiIcon, background: theme.primaryGradient }}>🤖</div>
              <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "10px" }}>How can I help you?</h1>
              <p style={{ color: theme.textSecondary, fontSize: "18px" }}>Select a chat or start a new one to begin</p>
            </div>
          ) : (
            <div style={styles.chatArea}>
              <div style={styles.messagesContainer}>
                {messages.map((msg, idx) => (
                  <div key={msg.id} style={{
                    ...styles.messageWrapper,
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
                  }}>
                    <div style={{
                      ...styles.messageContent,
                      alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: "85%"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: theme.textSecondary }}>
                          {msg.role === "user" ? "You" : "Assistant"}
                        </span>
                        {msg.role === "user" && (
                          <button style={{ ...styles.smallActionBtn, color: theme.primary }} onClick={() => handleEdit(msg.id)}>
                            ✏️ Edit
                          </button>
                        )}
                      </div>
                      <div style={{
                        ...styles.bubble,
                        background: msg.role === "user" ? theme.primaryGradient : (isDark ? theme.surface : "#f1f3f5"),
                        color: msg.role === "user" ? "white" : theme.text,
                        borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        boxShadow: `0 4px 12px ${isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)"}`
                      }}>
                        {msg.role === "assistant" ? (
                          <div
                            style={styles.text}
                            dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content, isDark) || (loading && idx === messages.length - 1 ? "..." : "") }}
                          />
                        ) : (
                          <p style={styles.text}>{msg.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && !messages.some(m => m.role === "assistant" && m.content === "") && (
                  <div style={{ ...styles.messageWrapper, justifyContent: "flex-start" }}>
                    <div style={styles.shimmer}>Thinking...</div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div style={{ ...styles.inputWrapper, background: theme.background, borderTop: `1px solid ${theme.border}` }}>
                <div style={{ ...styles.inputContainer, background: isDark ? theme.surface : "#f8f9fa", border: `1px solid ${theme.border}` }}>
                  <textarea
                    ref={inputRef}
                    style={{ ...styles.textArea, color: theme.text }}
                    placeholder="Message AI Assistant..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    rows={1}
                  />
                  <button
                    onClick={isStreaming ? handleStop : () => handleSend()}
                    disabled={(!inputText.trim() && !isStreaming) || loading}
                    style={{
                      ...styles.sendButton,
                      background: (inputText.trim() || isStreaming) && !loading ? theme.primaryGradient : "transparent",
                      color: (inputText.trim() || isStreaming) && !loading ? "white" : theme.textTertiary,
                      fontSize: isStreaming ? "12px" : "18px"
                    }}
                  >
                    {isStreaming ? "■" : "➤"}
                  </button>
                </div>
                <p style={{ fontSize: "11px", color: theme.textTertiary, textAlign: "center", marginTop: "8px" }}>
                  Local AI may produce inaccurate information about people, places, or facts.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  container: {
    flex: 1,
    display: "flex",
    overflow: "hidden"
  },
  sidebar: {
    width: "280px",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    borderRight: "1px solid",
    transition: "all 0.3s ease",
    zIndex: 10
  },
  newChatBtn: {
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: "20px",
    transition: "transform 0.2s",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
  },
  chatList: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  chatItem: {
    padding: "12px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.2s ease",
    fontSize: "14px",
    fontWeight: "500",
    group: "true"
  },
  chatTitle: {
    flex: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginRight: "8px"
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#ff4757",
    cursor: "pointer",
    padding: "4px",
    opacity: 0.6,
    transition: "opacity 0.2s"
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    position: "relative"
  },
  welcome: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "40px"
  },
  aiIcon: {
    width: "80px",
    height: "80px",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
    marginBottom: "24px",
    boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)"
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "40px max(20px, 15%)",
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  messageWrapper: {
    display: "flex",
    width: "100%"
  },
  messageContent: {
    display: "flex",
    flexDirection: "column"
  },
  bubble: {
    padding: "14px 20px",
    transition: "all 0.3s ease"
  },
  text: {
    margin: 0,
    fontSize: "15px",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap"
  },
  smallActionBtn: {
    background: "none",
    border: "none",
    fontSize: "11px",
    cursor: "pointer",
    padding: "2px 6px",
    borderRadius: "4px",
    opacity: 0.8
  },
  inputWrapper: {
    padding: "20px max(20px, 15%) 30px",
    zIndex: 5
  },
  inputContainer: {
    borderRadius: "16px",
    padding: "8px 16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "box-shadow 0.3s ease"
  },
  textArea: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    resize: "none",
    fontSize: "15px",
    maxHeight: "200px",
    padding: "10px 0"
  },
  sendButton: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  shimmer: {
    padding: "14px 20px",
    borderRadius: "18px",
    background: "rgba(102, 126, 234, 0.1)",
    fontSize: "14px",
    color: "#667eea",
    fontStyle: "italic",
    animation: "pulse 1.5s infinite"
  }
};
