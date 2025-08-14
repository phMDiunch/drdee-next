// src/lib/authHeaders.ts
import { useAppStore } from "@/stores/useAppStore";

export function useAuthHeaders() {
  const profile = useAppStore((s) => s.employeeProfile);
  const headers: Record<string, string> = {};
  if (profile?.id) headers["x-employee-id"] = profile.id;
  if (profile?.role) headers["x-employee-role"] = profile.role;
  if (profile?.clinicId) headers["x-clinic-id"] = profile.clinicId;
  return headers;
}
