import { useState, useContext, useEffect, useRef } from "react";
import { ThemeContext } from "../context/ThemeContext";

// Simple Markdown-like formatter
const formatMarkdown = (text, isDark = true) => {
  if (!text) return "";
  let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const bg = isDark ? "rgba(0,0,0,0.3)" : "#f4f4f4";
    const border = isDark ? "rgba(255,255,255,0.1)" : "#ddd";
    const color = isDark ? "#4ec9b0" : "#333";
    return `<pre style="background: ${bg}; padding: 12px; border-radius: 8px; margin: 8px 0; overflow-x: auto; font-family: monospace; border: 1px solid ${border}; font-size: 13px;"><code style="color: ${color};">${code.trim()}</code></pre>`;
  });
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const bg = isDark ? "rgba(0,0,0,0.2)" : "#e9ecef";
    const color = isDark ? "#ce9178" : "#d63384";
    return `<code style="background: ${bg}; padding: 2px 4px; border-radius: 4px; font-family: monospace; color: ${color};">${code}</code>`;
  });
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 800;">$1</strong>');
  html = html.replace(/^\s*\* (.*$)/gm, '<li style="margin-left: 15px; margin-bottom: 2px;">$1</li>');
  return html.split("\n").join("<br />");
};

const SYSTEM_PROMPT = "You are a helpful AI assistant. Provide professional, polite, and well-formatted answers like ChatGPT. Use Markdown (bold, code blocks, lists) for structure.";


export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, isDark } = useContext(ThemeContext);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I am your AI assistant. How can I help you today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg = { role: "user", content: inputText };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      // Create chat history for Ollama context
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      chatHistory.push(userMsg);

      const response = await fetch("/ollama/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3.2:latest",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...chatHistory
          ],
          stream: true,
          options: {
            repeat_penalty: 1.2,
            temperature: 0.7
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to connect to AI");
      }

      setLoading(false); // Remove "Thinking..." indicator
      // Add empty message for the assistant
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.message?.content) {
              fullContent += parsed.message.content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = fullContent;
                return newMessages;
              });
            }
          } catch (e) {
            console.error("Error parsing stream chunk", e);
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Error connecting to Ollama. Make sure it is running." }]);
      setLoading(false);
    }
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
            background: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)" // distinct from chat widget
          }}>
            <h3 style={styles.headerTitle}>🤖 AI Assistant</h3>
            <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* Messages Area */}
          <div style={{ ...styles.messagesArea, background: isDark ? theme.surface : "#f8f9fa" }}>
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div key={idx} style={{
                  ...styles.messageWrapper,
                  justifyContent: isUser ? "flex-end" : "flex-start"
                }}>
                  <div style={{ maxWidth: "85%" }}>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: isUser ? "#0072ff" : theme.textSecondary,
                      display: "block",
                      marginBottom: "3px",
                      paddingLeft: isUser ? "0" : "4px",
                      textAlign: isUser ? "right" : "left",
                    }}>{isUser ? "You" : "AI Assistant"}</span>
                    <div style={{
                      ...styles.messageBubble,
                      maxWidth: "100%",
                      background: isUser ? "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)" : (isDark ? theme.background : "#e9ecef"),
                      color: isUser ? "white" : theme.text,
                      borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      border: isUser ? "none" : `1px solid ${theme.border}`
                    }}>
                      {isUser ? (
                        <p style={styles.messageText}>{msg.content}</p>
                      ) : (
                        <div style={styles.messageText} dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content, isDark) }} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {loading && (
              <div style={{ ...styles.messageWrapper, justifyContent: "flex-start" }}>
                <div style={{ ...styles.messageBubble, background: (isDark ? theme.background : "#e9ecef"), border: `1px solid ${theme.border}` }}>
                  <p style={{ ...styles.messageText, fontStyle: "italic", color: theme.textSecondary }}>Thinking...</p>
                </div>
              </div>
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
              placeholder="Ask me anything..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handeKeyPress}
              disabled={loading}
            />
            <button
              style={{
                ...styles.sendBtn,
                background: inputText.trim() && !loading ? "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)" : theme.surface,
                color: inputText.trim() && !loading ? "white" : theme.textSecondary,
                cursor: inputText.trim() && !loading ? "pointer" : "default"
              }}
              onClick={handleSend}
              disabled={loading}
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
            background: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
            boxShadow: `0 4px 15px ${theme.shadowColorHeavy}`
          }}
          onClick={() => setIsOpen(true)}
        >
          <span style={styles.fabIcon}>🤖</span>
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    bottom: "30px",
    left: "30px", // Put on the left so it doesn't overlap the chat with admin on the right
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
    fontSize: "28px",
    color: "white"
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
  messageWrapper: {
    display: "flex",
    width: "100%",
  },
  messageBubble: {
    maxWidth: "100%",
    padding: "10px 14px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },
  messageText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "1.5",
    whiteSpace: "pre-wrap",
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
