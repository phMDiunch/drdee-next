// src/features/dashboard/hooks/useDashboardAppointments.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/stores/useAppStore";
import { DashboardAppointment } from "../type";
import { DATE_FORMAT } from "../constants";
import dayjs from "dayjs";

const fetchTodayAppointments = async (
  doctorId: string
): Promise<DashboardAppointment[]> => {
  const today = dayjs().format(DATE_FORMAT);
  const response = await fetch(
    `/api/appointments/today?date=${today}&doctorId=${doctorId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch appointments");
  }

  const data = await response.json();
  return data || [];
};

export const useDashboardAppointments = () => {
  const employeeProfile = useAppStore((state) => state.employeeProfile);

  return useQuery({
    queryKey: ["dashboard-appointments", employeeProfile?.id],
    queryFn: () => fetchTodayAppointments(employeeProfile!.id),
    enabled: !!employeeProfile?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes - fresh data for appointments
    refetchInterval: 30 * 1000, // Auto refetch every 30 seconds
    refetchIntervalInBackground: false,
  });
};
