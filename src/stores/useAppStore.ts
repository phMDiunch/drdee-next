// src/stores/useAppStore.ts
import { create } from "zustand";
import type { Employee, DentalService } from "@prisma/client";

type Customer = {
  id: string;
  fullName: string;
  phone: string;
  customerCode?: string;
};

type AppState = {
  // Auth & Profile
  employeeProfile: Employee | null;
  isLoadingProfile: boolean;
  fetchEmployeeProfile: (uid: string) => Promise<void>;
  clearEmployeeProfile: () => void;

  // Shared Data
  activeEmployees: Employee[];
  dentalServices: DentalService[];
  customers: Customer[]; // ✅ THÊM
  fetchActiveEmployees: (
    employee?: Employee | null,
    force?: boolean
  ) => Promise<void>;
  fetchDentalServices: (force?: boolean) => Promise<void>;
  fetchCustomers: (force?: boolean) => Promise<void>; // ✅ THÊM
};

export const useAppStore = create<AppState>((set, get) => ({
  // --- STATE ---
  employeeProfile: null,
  isLoadingProfile: true,
  activeEmployees: [],
  dentalServices: [],
  customers: [], // ✅ THÊM DEFAULT VALUE

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

  fetchActiveEmployees: async (employee, force = false) => {
    if (!employee) return;

    if (!force && get().activeEmployees.length > 0) {
      return;
    }

    try {
      const params = new URLSearchParams({
        pageSize: "500",
        requestingUserId: employee.id,
        requestingUserRole: employee.role,
        requestingUserClinicId: employee.clinicId || "",
      });
      const res = await fetch(`/api/employees?${params.toString()}`);
      const data = await res.json();
      set({ activeEmployees: data.employees || [] });
    } catch (error) {
      console.error("Failed to fetch active employees:", error);
    }
  },

  fetchDentalServices: async (force = false) => {
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

  // ✅ THÊM ACTION MỚI
  fetchCustomers: async (force = false) => {
    if (!force && get().customers.length > 0) {
      return;
    }
    try {
      const res = await fetch("/api/customers");
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      set({ customers: data.customers || [] });
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      set({ customers: [] }); // ✅ Set empty array on error
    }
  },
}));
