import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

// Production-level color schemes
const lightTheme = {
  name: "light",
  background: "#FFFFFF",
  surface: "#F8F9FA",
  surfaceHover: "#ECF0F1",
  text: "#2C3E50",
  textSecondary: "#7F8C8D",
  textTertiary: "#95A5A6",
  border: "#E1E8ED",
  primary: "#667EEA",
  primaryDark: "#764BA2",
  secondary: "#11998E",
  secondaryLight: "#38EF7D",
  danger: "#F5576C",
  dangerLight: "#F093FB",
  success: "#11998E",
  warning: "#F39C12",
  info: "#3498DB",
  // Gradients
  primaryGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  secondaryGradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  dangerGradient: "linear-gradient(135deg, #f93b1d 0%, #ea1e63 100%)",
  shadowColor: "rgba(0, 0, 0, 0.08)",
  shadowColorHeavy: "rgba(0, 0, 0, 0.2)",
  modalBackdrop: "rgba(0, 0, 0, 0.5)",
};

const darkTheme = {
  name: "dark",
  background: "#1A1A2E",
  surface: "#16213E",
  surfaceHover: "#0F3460",
  text: "#E8E8E8",
  textSecondary: "#A8A8B8",
  textTertiary: "#888896",
  border: "#2D3561",
  primary: "#667EEA",
  primaryDark: "#764BA2",
  secondary: "#11998E",
  secondaryLight: "#38EF7D",
  danger: "#FF6B6B",
  dangerLight: "#FF8E8E",
  success: "#11998E",
  warning: "#FFA500",
  info: "#3498DB",
  // Gradients (same as light, but will appear differently on dark background)
  primaryGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  secondaryGradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  dangerGradient: "linear-gradient(135deg, #f93b1d 0%, #ea1e63 100%)",
  shadowColor: "rgba(0, 0, 0, 0.3)",
  shadowColorHeavy: "rgba(0, 0, 0, 0.5)",
  modalBackdrop: "rgba(0, 0, 0, 0.7)",
};

export default function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem("theme");
    if (saved) {
      return saved === "dark";
    }
    // Otherwise check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const theme = isDark ? darkTheme : lightTheme;

  // Save preference to localStorage
  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
    // Update document root background color
    document.documentElement.style.backgroundColor = theme.background;
    document.documentElement.style.color = theme.text;
  }, [isDark, theme]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
