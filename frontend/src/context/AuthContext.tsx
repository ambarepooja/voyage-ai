import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  avatar_url?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (token && storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (e) {
      console.error("Failed to restore stored user", e);
    }
    return null;
  });

  const refreshUser = async (): Promise<User | null> => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const res = await api.get("/auth/me");
      if (res.data) {
        localStorage.setItem("user", JSON.stringify(res.data));
        setUser(res.data);
        return res.data;
      }
    } catch (e) {
      console.warn("Could not refresh current user profile", e);
    }
    return null;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      refreshUser();
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem("user", JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
