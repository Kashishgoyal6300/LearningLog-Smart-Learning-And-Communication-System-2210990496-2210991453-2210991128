import { useState, useContext, useRef, useEffect, useMemo } from "react";
import { ThemeContext } from "../context/ThemeContext";
import Header from "../components/Header";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

// Simple Java Syntax Highlighter
const highlightJava = (code) => {
  if (!code) return "";
  let html = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const patterns = [
    { regex: /\/\*[\s\S]*?\*\/|\/\/.*/, color: "#6a9955" }, // Comments
    { regex: /"(?:\\.|[^\\"])*"|'(?:\\.|[^\\'])*/, color: "#ce9178" }, // Strings
    { regex: /\b(public|protected|private|static|void|class|interface|enum|extends|implements|new|return|if|else|for|while|do|switch|case|default|break|continue|throw|throws|try|catch|finally|import|package|this|super|instanceof|volatile|transient|synchronized|native|strictfp|abstract|final|byte|short|int|long|float|double|boolean|char)\b/, color: "#569cd6" }, // Keywords
    { regex: /\b(String|System|Scanner|List|ArrayList|Map|HashMap|Set|HashSet|Integer|Double|Float|Long|Boolean|Character|Byte|Short|Math|Object|Exception|Thread)\b/, color: "#4ec9b0" }, // Types
    { regex: /\b\d+\b/, color: "#b5cea8" }, // Numbers
    { regex: /\b[a-z_][a-zA-Z0-9_]*\s*(?=\()/, color: "#dcdcaa" } // Methods
  ];
  let result = "";
  let pos = 0;
  while (pos < html.length) {
    let bestMatch = null;
    let bestPatternIdx = -1;
    for (let i = 0; i < patterns.length; i++) {
        const match = patterns[i].regex.exec(html.substring(pos));
        if (match && (bestMatch === null || match.index < bestMatch.index)) {
            bestMatch = match;
            bestPatternIdx = i;
        }
    }
    if (bestMatch && bestMatch.index === 0) {
        const matchedText = bestMatch[0];
        const color = patterns[bestPatternIdx].color;
        result += `<span style="color: ${color};">${matchedText}</span>`;
        pos += matchedText.length;
    } else if (bestMatch) {
        result += html.substring(pos, pos + bestMatch.index);
        pos += bestMatch.index;
    } else {
        result += html.substring(pos);
        break;
    }
  }
  return result;
};

export default function JavaCompilerPage() {
  const { theme, isDark } = useContext(ThemeContext);
  const { showToast } = useToast();
  
  // Hierarchical File System State
  const [fs, setFs] = useState(() => {
    const saved = localStorage.getItem("java_fs_v2");
    if (saved) return JSON.parse(saved);
    return [
      { id: "root", name: "LEARNING-PROJECT", type: "folder", parentId: null, isOpen: true },
      { id: "1", name: "Main.java", type: "file", content: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java Compiler!");\n    }\n}', parentId: "root" }
    ];
  });
  
  const [activeFileId, setActiveFileId] = useState("1");
  const [selectedFolderId, setSelectedFolderId] = useState("root");
  const [sidebarTab, setSidebarTab] = useState("explorer"); // explorer, search, git
  
  // Sidebar states
  const [creationMode, setCreationMode] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [output, setOutput] = useState("Run your code to see results...");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle");
  const [terminalHeight, setTerminalHeight] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  
  const terminalRef = useRef(null);
  const editorRef = useRef(null);
  const highlightRef = useRef(null);
  
  const activeFile = fs.find(f => f.id === activeFileId && f.type === "file");

  // Persistence
  useEffect(() => {
    localStorage.setItem("java_fs_v2", JSON.stringify(fs));
  }, [fs]);

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return fs.filter(f => f.type === "file" && (f.name.toLowerCase().includes(query) || f.content.toLowerCase().includes(query)));
  }, [fs, searchQuery]);

  // Terminal Resizing
  const startResizing = (e) => { e.preventDefault(); setIsResizing(true); };
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 100 && newHeight < window.innerHeight - 200) setTerminalHeight(newHeight);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleScroll = () => {
    if (highlightRef.current && editorRef.current) {
      highlightRef.current.scrollTop = editorRef.current.scrollTop;
      highlightRef.current.scrollLeft = editorRef.current.scrollLeft;
    }
  };

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [output]);

  const handleCreate = () => {
    if (!newItemName.trim()) { setCreationMode(null); return; }
    let name = newItemName.trim();
    if (creationMode === "file" && !name.endsWith(".java")) name += ".java";
    if (fs.some(item => item.name.toLowerCase() === name.toLowerCase() && item.parentId === selectedFolderId)) {
      showToast("Item already exists", "error");
      return;
    }
    const newItem = {
      id: Date.now().toString(),
      name: name,
      type: creationMode,
      parentId: selectedFolderId,
      ...(creationMode === "file" ? { content: `public class ${name.replace(".java", "")} {\n    public static void main(String[] args) {\n        System.out.println("Hello from ${name}!");\n    }\n}` } : { isOpen: true })
    };
    setFs([...fs, newItem]);
    if (creationMode === "file") setActiveFileId(newItem.id);
    setNewItemName("");
    setCreationMode(null);
    showToast(`Created ${name}`, "success");
  };

  const deleteItem = (e, id) => {
    e.stopPropagation();
    if (id === "root") return;
    const getRecursiveIds = (pid) => {
      let ids = [pid];
      fs.filter(item => item.parentId === pid).forEach(child => ids = [...ids, ...getRecursiveIds(child.id)]);
      return ids;
    };
    const idsToDelete = getRecursiveIds(id);
    const updatedFs = fs.filter(item => !idsToDelete.includes(item.id));
    setFs(updatedFs);
    if (idsToDelete.includes(activeFileId)) {
      setActiveFileId(updatedFs.filter(i => i.type === "file")[0]?.id || null);
    }
    showToast("Item deleted", "info");
  };

  const toggleFolder = (e, id) => {
    e.stopPropagation();
    setFs(fs.map(item => item.id === id ? { ...item, isOpen: !item.isOpen } : item));
    setSelectedFolderId(id);
  };

  const handleRun = async () => {
    if (!activeFile) return;
    setLoading(true); setStatus("idle"); setOutput(`Compiling ${activeFile.name} and running...\n`);
    try {
      const res = await api.post("/compiler/run", { code: activeFile.content });
      const data = res.data;
      if (data.status === "success") { setStatus("success"); setOutput(data.output || "Program finished."); }
      else { setStatus("error"); setOutput(data.output); }
    } catch (e) { setStatus("error"); setOutput("❌ Execution failed."); }
    finally { setLoading(false); }
  };

  const renderExplorer = (parentId, depth = 0) => {
    const children = fs.filter(item => item.parentId === parentId);
    return children.sort((a,b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "folder" ? -1 : 1)).map(item => (
      <div key={item.id}>
        <div 
          onClick={(e) => item.type === "folder" ? toggleFolder(e, item.id) : setActiveFileId(item.id)}
          style={{
            ...styles.fileRow,
            paddingLeft: `${(depth + 1) * 12}px`,
            background: (item.type === "file" && activeFileId === item.id) || (item.type === "folder" && selectedFolderId === item.id) ? "#37373d" : "transparent"
          }}
        >
          <span style={{color: "#858585", marginRight: "6px", fontSize: "10px", width: "12px", display: "inline-block", textAlign: "center"}}>
            {item.type === "folder" ? (item.isOpen ? "▼" : "▶") : ""}
          </span>
          <span style={{color: item.type === "folder" ? "#eab308" : "#519aba", marginRight: "6px"}}>
            {item.type === "folder" ? "📁" : "☕"}
          </span>
          <span style={{flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{item.name}</span>
          <button style={styles.deleteFileBtn} onClick={(e) => deleteItem(e, item.id)}>✕</button>
        </div>
        {item.type === "folder" && item.isOpen && (
          <div style={styles.folderContents}>
            {creationMode && selectedFolderId === item.id && (
              <div style={{...styles.fileInputWrapper, paddingLeft: `${(depth + 2) * 12 + 10}px`}}>
                <input autoFocus style={styles.fileInput} value={newItemName} onChange={e => setNewItemName(e.target.value)} onBlur={handleCreate} onKeyDown={e => e.key === "Enter" && handleCreate()} placeholder={creationMode === "file" ? "name.java" : "name"} />
              </div>
            )}
            {renderExplorer(item.id, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div style={{...styles.page, background: "#1e1e1e", color: "#d4d4d4"}}>
      <Header />
      <div style={styles.appContainer}>
        {/* Activity Bar */}
        <div style={styles.activityBar}>
          <div style={sidebarTab === "explorer" ? styles.activeIcon : styles.inactiveIcon} onClick={() => setSidebarTab("explorer")} title="Explorer">📄</div>
          <div style={sidebarTab === "search" ? styles.activeIcon : styles.inactiveIcon} onClick={() => setSidebarTab("search")} title="Search">🔍</div>
          <div style={sidebarTab === "git" ? styles.activeIcon : styles.inactiveIcon} onClick={() => setSidebarTab("git")} title="Source Control">🌿</div>
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          {sidebarTab === "explorer" && (
            <>
              <div style={styles.sidebarHeader}>
                <span style={{fontSize: "11px", color: "white"}}>EXPLORER</span>
                <div style={{display: "flex", gap: "6px"}}>
                  <button style={styles.toolBtn} onClick={() => setCreationMode("file")} title="New File">➕☕</button>
                  <button style={styles.toolBtn} onClick={() => setCreationMode("folder")} title="New Folder">➕📁</button>
                </div>
              </div>
              <div 
                style={styles.sidebarSection}
                onClick={(e) => { if (e.target === e.currentTarget) setSelectedFolderId(null); }}
              >
                {creationMode && selectedFolderId === null && (
                  <div style={styles.fileInputWrapper}>
                    <input autoFocus style={styles.fileInput} value={newItemName} onChange={e => setNewItemName(e.target.value)} onBlur={handleCreate} onKeyDown={e => e.key === "Enter" && handleCreate()} placeholder={creationMode === "file" ? "name.java" : "name"} />
                  </div>
                )}
                {renderExplorer(null)}
              </div>
            </>
          )}

          {sidebarTab === "search" && (
            <>
              <div style={styles.sidebarHeader}><span style={{fontSize: "11px", color: "white"}}>SEARCH</span></div>
              <div style={styles.sidebarSection}>
                <div style={styles.searchContainer}>
                  <input style={styles.searchInput} placeholder="Search text in files..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div style={styles.searchResults}>
                  {searchResults.length > 0 ? searchResults.map(f => (
                    <div key={f.id} style={styles.searchResultItem} onClick={() => { setActiveFileId(f.id); setSidebarTab("explorer"); }}>
                      <div style={{fontWeight: "bold", fontSize: "12px", color: "#4da6ff"}}>{f.name}</div>
                      <div style={{fontSize: "11px", color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                        {f.content.substring(Math.max(0, f.content.toLowerCase().indexOf(searchQuery.toLowerCase()) - 20), Math.min(f.content.length, f.content.toLowerCase().indexOf(searchQuery.toLowerCase()) + 40)).trim()}
                      </div>
                    </div>
                  )) : searchQuery && <div style={{padding: "20px", textAlign: "center", color: "#888"}}>No results found</div>}
                </div>
              </div>
            </>
          )}

          {sidebarTab === "git" && (
            <>
              <div style={styles.sidebarHeader}><span style={{fontSize: "11px", color: "white"}}>SOURCE CONTROL</span></div>
              <div style={styles.sidebarSection}>
                <div style={{padding: "20px", color: "#888", textAlign: "center", fontSize: "14px"}}>
                  <div style={{fontSize: "40px", marginBottom: "15px"}}>🌿</div>
                  <div style={{marginBottom: "10px"}}>The project is currently tracking local changes.</div>
                  <div style={{fontSize: "12px", background: "#333", padding: "10px", borderRadius: "5px", color: "#4ec9b0"}}>Auto-Save Enabled</div>
                  <div style={{marginTop: "20px", fontSize: "11px"}}>Version history is stored in your LocalStorage.</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Editor Area */}
        <div style={{...styles.editorArea, pointerEvents: isResizing ? "none" : "auto"}}>
          <div style={styles.tabsHeader}>
            {activeFile && (
              <div style={styles.activeTab}><span style={{color: "#519aba", marginRight: "6px"}}>☕</span>{activeFile.name}</div>
            )}
          </div>
          <div style={styles.mainContent}>
            <div style={styles.editorWrapper}>
              <div style={styles.lineNumbers}>{(activeFile?.content || "").split("\n").map((_, i) => (<div key={i} style={styles.lineNum}>{i + 1}</div>))}</div>
              <div style={styles.editorRelative}>
                <pre ref={highlightRef} style={styles.highlightOverlay} dangerouslySetInnerHTML={{ __html: highlightJava(activeFile?.content) + "\n" }} />
                <textarea ref={editorRef} spellCheck={false} onScroll={handleScroll} style={styles.textArea} value={activeFile?.content || ""}
                  onChange={(e) => setFs(fs.map(f => f.id === activeFileId ? {...f, content: e.target.value} : f))}
                />
              </div>
              <button disabled={loading} onClick={handleRun} style={{...styles.runButton, background: loading ? "#3e3e3e" : "#007acc"}}>
                {loading ? "⌛ Running..." : "▶ Run"}
              </button>
            </div>
            <div style={{...styles.resizer, background: isResizing ? "#007acc" : "transparent"}} onMouseDown={startResizing} />
            <div style={{...styles.terminalContainer, height: terminalHeight}}>
              <div style={styles.terminalHeader}><div style={styles.terminalTab}>TERMINAL</div></div>
              <div ref={terminalRef} style={{...styles.terminalOutput, color: status === "error" ? "#f44747" : (status === "success" ? "#4da6ff" : "#d4d4d4")}}>
                <div style={{color: "#888", marginBottom: "8px", fontSize: "12px"}}>PS C:\Users\LearningApp&gt; java {activeFile?.name.replace(".java", "")}</div>
                <pre style={styles.pre}>{output}</pre>
                {loading && <span style={styles.cursor}>█</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace" },
  appContainer: { flex: 1, display: "flex", overflow: "hidden" },
  activityBar: { width: "48px", background: "#333333", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "12px", gap: "20px", flexShrink: 0 },
  activeIcon: { fontSize: "24px", color: "#ffffff", borderLeft: "2px solid #ffffff", paddingLeft: "4px", width: "100%", textAlign: "center", cursor: "pointer", opacity: 1 },
  inactiveIcon: { fontSize: "24px", color: "#858585", cursor: "pointer", transition: "opacity 0.2s", ":hover": { color: "white" }, opacity: 0.6 },
  sidebar: { width: "260px", background: "#252526", color: "#bbbbbb", display: "flex", flexDirection: "column", borderRight: "1px solid #333", flexShrink: 0 },
  sidebarHeader: { padding: "10px 12px 10px 20px", fontWeight: "bold", display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: "35px" },
  toolBtn: { background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: "12px" },
  sidebarSection: { padding: "10px 0", overflowY: "auto", flex: 1 },
  fileRow: { padding: "4px 12px", display: "flex", alignItems: "center", cursor: "pointer", fontSize: "13px", transition: "background 0.1s" },
  folderContents: { display: "flex", flexDirection: "column" },
  fileInputWrapper: { padding: "4px 12px" },
  fileInput: { width: "90%", background: "#3c3c3c", border: "1px solid #007acc", color: "#fff", outline: "none", fontSize: "12px", padding: "2px 4px" },
  deleteFileBtn: { background: "none", border: "none", color: "#858585", cursor: "pointer", fontSize: "10px", marginLeft: "auto", padding: "0 4px" },
  searchContainer: { padding: "0 15px 15px 15px" },
  searchInput: { width: "100%", background: "#3c3c3c", border: "1px solid #3c3c3c", color: "white", padding: "5px 10px", fontSize: "13px", outline: "none", borderRadius: "2px", ":focus": { borderColor: "#007acc" } },
  searchResults: { display: "flex", flexDirection: "column" },
  searchResultItem: { padding: "10px 15px", cursor: "pointer", ":hover": { background: "#2a2d2e" }, borderBottom: "1px solid #333" },
  editorArea: { flex: 1, display: "flex", flexDirection: "column", background: "#1e1e1e", minWidth: 0 },
  tabsHeader: { height: "35px", background: "#252526", display: "flex" },
  activeTab: { padding: "0 15px", display: "flex", alignItems: "center", fontSize: "13px", background: "#1e1e1e", borderTop: "1px solid #007acc", color: "white" },
  mainContent: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  editorWrapper: { flex: 3, display: "flex", position: "relative", overflow: "hidden" },
  lineNumbers: { width: "45px", background: "#1e1e1e", color: "#858585", textAlign: "right", padding: "20px 10px 0 0", fontSize: "14px" },
  lineNum: { height: "21px", lineHeight: "21px" },
  editorRelative: { flex: 1, position: "relative" },
  highlightOverlay: { margin: 0, padding: "20px 10px", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, fontSize: "14px", lineHeight: "21px", whiteSpace: "pre-wrap", color: "#d4d4d4", fontFamily: "inherit", pointerEvents: "none", overflow: "hidden" },
  textArea: { display: "block", width: "100%", height: "100%", background: "transparent", border: "none", outline: "none", color: "transparent", caretColor: "white", fontSize: "14px", lineHeight: "21px", padding: "20px 10px", resize: "none", fontFamily: "inherit", tabSize: 4 },
  runButton: { position: "absolute", top: "20px", right: "30px", padding: "10px 20px", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", zIndex: 10, fontWeight: "bold" },
  resizer: { height: "4px", cursor: "ns-resize", zIndex: 100 },
  terminalContainer: { borderTop: "1px solid #333", display: "flex", flexDirection: "column", background: "#1e1e1e" },
  terminalHeader: { padding: "0 20px", display: "flex", alignItems: "center", height: "30px", background: "#1e1e1e", borderBottom: "1px solid #333" },
  terminalTab: { fontSize: "11px", color: "#858585", textTransform: "uppercase", fontWeight: "bold" },
  terminalOutput: { flex: 1, padding: "15px", overflowY: "auto", fontSize: "13px" },
  pre: { margin: 0, whiteSpace: "pre-wrap" },
  cursor: { animation: "blink 1s infinite" }
};
