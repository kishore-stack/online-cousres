import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "./api/client";

/* ================= TYPES ================= */

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  setAuth: (user: User, access: string, refresh: string) => void;
  clearAuth: () => void;
};

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType>(null!);

/* ================= PROVIDER ================= */

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- RESTORE SESSION ---------- */
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get<User>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
        setAccessToken(token);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /* ---------- LOGIN ---------- */
  const setAuth = (user: User, access: string, refresh: string) => {
    setUser(user);
    setAccessToken(access);

    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
  };

  /* ---------- LOGOUT ---------- */
  const clearAuth = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, loading, setAuth, clearAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useAuth = () => {
  return useContext(AuthContext);
};