import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || localStorage.getItem("tala_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("tala_user");
    return stored ? JSON.parse(stored) : null;
  });

  async function login(phone, password) {
    const data = await api("/login", {
      method: "POST",
      body: JSON.stringify({ phone, password })
    });
    saveSession(data);
  }

  async function register(name, phone, password) {
    const data = await api("/register", {
      method: "POST",
      body: JSON.stringify({ name, phone, password })
    });
    saveSession(data);
  }

  function saveSession(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("tala_token", data.token);
    localStorage.setItem("tala_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("tala_token");
    localStorage.removeItem("tala_user");
    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    function clearExpiredSession() {
      setToken(null);
      setUser(null);
    }

    window.addEventListener("tala:session-expired", clearExpiredSession);
    return () => window.removeEventListener("tala:session-expired", clearExpiredSession);
  }, []);

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, register, logout }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
