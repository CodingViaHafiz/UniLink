import { useCallback, useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { apiFetch } from "../lib/api";
import { AuthContext } from "./authContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    try {
      const data = await apiFetch("/auth/me", { method: "GET" });
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const register = async (payload) => {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    // Register returns { needsVerification: true } — no auto-login
    return data;
  };

  const login = async (payload) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    // flushSync forces React to commit setUser synchronously before returning,
    // so that navigate() in AuthPage sees isAuthenticated=true immediately.
    flushSync(() => setUser(data.user));
    return data.user;
  };

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      register,
      login,
      logout,
      refreshUser: loadCurrentUser,
    }),
    [isLoading, loadCurrentUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
