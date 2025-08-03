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
  isLoadingEmployees: boolean; // ✅ ADD loading state for employees
  dentalServices: DentalService[];
  isLoadingDentalServices: boolean; // ✅ ADD loading state for dental services
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
  isLoadingEmployees: false, // ✅ ADD default value
  dentalServices: [],
  isLoadingDentalServices: false, // ✅ ADD default value for dental services
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

    set({ isLoadingEmployees: true }); // ✅ SET loading state
    try {
      // ✅ SIMPLIFIED API call - no permission params needed
      const params = new URLSearchParams({
        pageSize: "500",
        employmentStatus: "Đang làm việc,Thử việc",
      });
      const res = await fetch(`/api/employees?${params.toString()}`);

      if (!res.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await res.json();
      set({
        activeEmployees: data.employees || [],
        isLoadingEmployees: false,
      });
    } catch (error) {
      console.error("Failed to fetch active employees:", error);
      // ✅ IMPORT toast at top of file needed
      if (typeof window !== "undefined") {
        const { toast } = await import("react-toastify");
        toast.error("Không thể tải danh sách nhân viên");
      }
      set({
        activeEmployees: [],
        isLoadingEmployees: false,
      });
    }
  },

  fetchDentalServices: async (force = false) => {
    if (!force && get().dentalServices.length > 0) {
      return;
    }

    set({ isLoadingDentalServices: true }); // ✅ SET loading state
    try {
      const res = await fetch("/api/dental-services");
      if (!res.ok) {
        throw new Error("Failed to fetch dental services");
      }
      const services = await res.json();
      set({
        dentalServices: services,
        isLoadingDentalServices: false,
      });
    } catch (error) {
      console.error("Failed to fetch dental services:", error);
      // ✅ SHOW error toast
      if (typeof window !== "undefined") {
        const { toast } = await import("react-toastify");
        toast.error("Không thể tải danh sách dịch vụ nha khoa");
      }
      set({
        dentalServices: [],
        isLoadingDentalServices: false,
      });
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
