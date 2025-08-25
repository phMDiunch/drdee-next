// src/features/dashboard/hooks/useDashboardTodayServices.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/stores/useAppStore";
import { DashboardConsultedService } from "../type";
import { DATE_FORMAT } from "../constants";
import dayjs from "dayjs";

const fetchTodayServices = async (
  doctorId: string
): Promise<DashboardConsultedService[]> => {
  const today = dayjs().format(DATE_FORMAT);
  const response = await fetch(
    `/api/consulted-services?date=${today}&consultingDoctorId=${doctorId}&consultingSaleId=${doctorId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch consulted services");
  }

  const data = await response.json();
  // Lấy tất cả services hôm nay (cả đã chốt và chưa chốt)
  return data || [];
};

export const useDashboardTodayServices = () => {
  const employeeProfile = useAppStore((state) => state.employeeProfile);

  return useQuery({
    queryKey: ["dashboard-today-services", employeeProfile?.id],
    queryFn: () => fetchTodayServices(employeeProfile!.id),
    enabled: !!employeeProfile?.id,
    staleTime: 3 * 60 * 1000, // 3 minutes - moderate refresh for today's data
    refetchInterval: 60 * 1000, // Auto refetch every 1 minute
    refetchIntervalInBackground: false,
  });
};
