import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { flushSync } from "react-dom";
import type { User, LoginRequest, RegisterRequest } from "@/types/task";
import { authApi } from "@/services/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (data: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (data: LoginRequest): Promise<User> => {
    console.log("[AuthContext] login() → calling API for:", data.email);
    const user = await authApi.login(data);
    console.log("[AuthContext] login() ← success, role:", user.role, "user:", user.username);
    // flushSync ensures React commits the state update *before* the caller
    // calls navigate(), preventing ProtectedRoute from seeing stale null state.
    flushSync(() => setUser(user));
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  };

  const register = async (data: RegisterRequest): Promise<User> => {
    console.log("[AuthContext] register() → calling API for:", data.email);
    const user = await authApi.register(data);
    console.log("[AuthContext] register() ← success, role:", user.role);
    flushSync(() => setUser(user));
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  };

  const logout = () => {
    authApi.logout().catch(() => {/* best-effort */});
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN",
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
