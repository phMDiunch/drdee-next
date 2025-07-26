// src/contexts/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../services/supabaseClient";
import { useAppStore } from "@/stores/useAppStore"; // <--- Import store

type AuthUser = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean; // Chỉ loading trạng thái của Supabase
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Lấy actions từ Zustand store
  const fetchEmployeeProfile = useAppStore(
    (state) => state.fetchEmployeeProfile
  );
  const clearEmployeeProfile = useAppStore(
    (state) => state.clearEmployeeProfile
  );

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
        await fetchEmployeeProfile(session.user.id); // <--- Lấy profile
      } else {
        clearEmployeeProfile(); // <--- Xóa profile nếu không có session
      }
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email! });
          await fetchEmployeeProfile(session.user.id); // <--- Lấy profile
        } else {
          setUser(null);
          clearEmployeeProfile(); // <--- Xóa profile khi logout
        }
        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [fetchEmployeeProfile, clearEmployeeProfile]);

  const login = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { error: error.message };
    }
    // Việc fetch profile đã được xử lý bởi onAuthStateChange
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange sẽ tự động được gọi và xóa profile
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
