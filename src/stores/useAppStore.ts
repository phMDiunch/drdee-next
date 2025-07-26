// src/stores/useAppStore.ts
import { create } from "zustand";
import type { Employee, DentalService } from "@prisma/client";

type AppState = {
  // Auth & Profile
  employeeProfile: Employee | null;
  isLoadingProfile: boolean;
  fetchEmployeeProfile: (uid: string) => Promise<void>;
  clearEmployeeProfile: () => void;

  // Shared Data
  activeEmployees: Employee[];
  dentalServices: DentalService[];
  fetchActiveEmployees: () => Promise<void>;
  fetchDentalServices: (force?: boolean) => Promise<void>; // Thêm tham số force
};

export const useAppStore = create<AppState>((set, get) => ({
  // --- STATE ---
  employeeProfile: null,
  isLoadingProfile: true,
  activeEmployees: [],
  dentalServices: [],

  // --- ACTIONS ---
  fetchEmployeeProfile: async (uid) => {
    if (!uid) {
      set({ employeeProfile: null, isLoadingProfile: false });
      return;
    }
    set({ isLoadingProfile: true });
    try {
      const res = await fetch(`/api/employees/by-uid?uid=${uid}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      const profile = await res.json();
      set({ employeeProfile: profile, isLoadingProfile: false });
    } catch (error) {
      console.error("Failed to fetch employee profile:", error);
      set({ employeeProfile: null, isLoadingProfile: false });
    }
  },

  clearEmployeeProfile: () => {
    set({ employeeProfile: null, isLoadingProfile: false });
  },

  fetchActiveEmployees: async () => {
    if (get().activeEmployees.length > 0) return;
    try {
      const params = new URLSearchParams({ pageSize: "500" });
      const res = await fetch(`/api/employees?${params.toString()}`);
      const data = await res.json();
      set({ activeEmployees: data.employees || [] });
    } catch (error) {
      console.error("Failed to fetch active employees:", error);
    }
  },

  // --- ACTION MỚI CHO DỊCH VỤ ---
  fetchDentalServices: async (force = false) => {
    // Nếu không bắt buộc tải lại (force=false) và đã có dữ liệu thì không gọi API
    if (!force && get().dentalServices.length > 0) {
      return;
    }
    try {
      const res = await fetch("/api/dental-services");
      const services = await res.json();
      set({ dentalServices: services });
    } catch (error) {
      console.error("Failed to fetch dental services:", error);
    }
  },
}));
