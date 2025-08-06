// src/contexts/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
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

  // 🚀 Add tracking for preventing duplicate auth processing
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const currentUserIdRef = useRef<string | null>(null);

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
        currentUserIdRef.current = session.user.id; // 🚀 Track user ID
        await fetchEmployeeProfile(session.user.id); // <--- Lấy profile

        // ✅ AUTO-LOAD employees and dental services after profile loaded (sequential)
        const currentProfile = useAppStore.getState().employeeProfile;
        if (currentProfile) {
          await fetchActiveEmployees(currentProfile);
          await fetchDentalServices(); // ✅ ADD dental services auto-load
        }
      } else {
        clearEmployeeProfile(); // <--- Xóa profile nếu không có session
        currentUserIdRef.current = null; // 🚀 Clear user ID
      }
      setLoading(false);
      setInitialLoadComplete(true); // 🚀 Mark initial load complete
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state change:", event, !!session?.user);

        // 🚀 Skip processing for INITIAL_SESSION if we already completed initial load
        if (event === "INITIAL_SESSION" && initialLoadComplete) {
          console.log("⏩ Skipping INITIAL_SESSION - already loaded");
          return;
        }

        // 🚀 Skip processing for SIGNED_IN if same user and already loaded
        if (
          event === "SIGNED_IN" &&
          initialLoadComplete &&
          currentUserIdRef.current &&
          session?.user?.id === currentUserIdRef.current
        ) {
          console.log("⏩ Skipping SIGNED_IN - same user already logged in");
          return;
        }

        if (session?.user) {
          // 🚀 Only update if user actually changed
          if (
            !currentUserIdRef.current ||
            currentUserIdRef.current !== session.user.id
          ) {
            console.log("✅ Setting new user:", session.user.id);
            setUser({ id: session.user.id, email: session.user.email! });
            currentUserIdRef.current = session.user.id;
            await fetchEmployeeProfile(session.user.id); // <--- Lấy profile

            // ✅ AUTO-LOAD employees and dental services after profile loaded (sequential)
            const currentProfile = useAppStore.getState().employeeProfile;
            if (currentProfile) {
              await fetchActiveEmployees(currentProfile);
              await fetchDentalServices(); // ✅ ADD dental services auto-load
            }
          } else {
            console.log("⏩ User unchanged, skipping profile fetch");
          }
        } else {
          console.log("❌ No session, clearing profile");
          setUser(null);
          currentUserIdRef.current = null;
          clearEmployeeProfile(); // <--- Xóa profile khi logout
        }
        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
