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
  loading: boolean; // Will include both profile + employees loading
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
  const fetchActiveEmployees = useAppStore(
    (state) => state.fetchActiveEmployees
  );
  const fetchDentalServices = useAppStore((state) => state.fetchDentalServices);
  const isLoadingEmployees = useAppStore((state) => state.isLoadingEmployees);
  const isLoadingProfile = useAppStore((state) => state.isLoadingProfile);
  const isLoadingDentalServices = useAppStore(
    (state) => state.isLoadingDentalServices
  );

  // ✅ COMBINED loading state: include profile, employees, and dental services
  const combinedLoading =
    loading ||
    isLoadingProfile ||
    isLoadingEmployees ||
    isLoadingDentalServices;

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
        await fetchEmployeeProfile(session.user.id); // <--- Lấy profile

        // ✅ AUTO-LOAD employees and dental services after profile loaded (sequential)
        const currentProfile = useAppStore.getState().employeeProfile;
        if (currentProfile) {
          await fetchActiveEmployees(currentProfile);
          await fetchDentalServices(); // ✅ ADD dental services auto-load
        }
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

          // ✅ AUTO-LOAD employees and dental services after profile loaded (sequential)
          const currentProfile = useAppStore.getState().employeeProfile;
          if (currentProfile) {
            await fetchActiveEmployees(currentProfile);
            await fetchDentalServices(); // ✅ ADD dental services auto-load
          }
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
  }, [
    fetchEmployeeProfile,
    clearEmployeeProfile,
    fetchActiveEmployees,
    fetchDentalServices,
  ]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
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
    <AuthContext.Provider
      value={{ user, loading: combinedLoading, login, logout }}
    >
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
