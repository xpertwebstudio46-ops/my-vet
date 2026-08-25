"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { apiBaseUrl, apiClient, refreshAccessToken } from "@/lib/api/client";
import type { AuthResult, Role, User } from "@/lib/api/types";
import { getAccessToken, setAccessToken } from "@/lib/auth/access-token";

type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Exclude<Role, "ADMIN">;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function dashboardForRole(role: Role) {
  if (role === "ADMIN") return "/admin-dashboard";
  if (role === "VET") return "/vet-dashboard";
  return "/dashboard";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const restore = async () => {
      if (getAccessToken()) {
        try {
          return await apiClient<User>("/api/auth/me");
        } catch {
          // Fall through to the secure refresh-cookie flow.
        }
      }
      await refreshAccessToken();
      return apiClient<User>("/api/auth/me", {}, { retry: false });
    };

    void restore()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        setAccessToken(null);
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const update = (event: Event) => {
      const next = (event as CustomEvent<Partial<User>>).detail;
      setUser((current) => (current ? { ...current, ...next } : current));
    };
    window.addEventListener("myvet:user-updated", update);
    return () => window.removeEventListener("myvet:user-updated", update);
  }, []);

  useEffect(() => {
    if (!user || !getAccessToken()) {
      return;
    }
    const connection = io(apiBaseUrl(), { auth: { token: getAccessToken() }, withCredentials: true });
    connection.on("notification:new", (notification) => {
      window.dispatchEvent(new CustomEvent("myvet:notification", { detail: notification }));
    });
    return () => {
      connection.disconnect();
    };
    // A new authenticated user always owns a new socket connection.
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiClient<AuthResult>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
      { authenticated: false },
    );
    setAccessToken(result.accessToken);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await apiClient<AuthResult>(
      "/api/auth/register",
      { method: "POST", body: JSON.stringify(input) },
      { authenticated: false },
    );
    setAccessToken(result.accessToken);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient<{ loggedOut: boolean }>("/api/auth/logout", { method: "POST" }, { retry: false });
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
