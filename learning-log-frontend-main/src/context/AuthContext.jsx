import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [user, setUser] = useState(null); // 👈 PROFILE

  useEffect(() => {
    if (token && !user) {
      api.get("/profile")
        .then(res => setUser(res.data))
        .catch(err => console.error("Failed to fetch profile in AuthContext", err));
    }
  }, [token, user]);

  const login = async (token, role, email) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    if (email) localStorage.setItem("email", email);
    setToken(token);
    setRole(role);

    // 🔥 FETCH PROFILE AFTER LOGIN
    const res = await api.get("/profile");
    setUser(res.data);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
