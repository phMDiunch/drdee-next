// src/features/dashboard/hooks/useDashboardUnconfirmedServices.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/stores/useAppStore";
import { DashboardConsultedService } from "../type";
import { DATE_FORMAT } from "../constants";
import dayjs from "dayjs";

const fetchYesterdayUnconfirmedServices = async (
  doctorId: string
): Promise<DashboardConsultedService[]> => {
  const yesterday = dayjs().subtract(1, "day").format(DATE_FORMAT);
  const response = await fetch(
    `/api/consulted-services?date=${yesterday}&consultingDoctorId=${doctorId}&consultingSaleId=${doctorId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch consulted services");
  }

  const data = await response.json();
  // Filter chỉ lấy services chưa chốt
  const unconfirmedOnly = (data || []).filter(
    (service: DashboardConsultedService) => service.serviceStatus !== "Đã chốt"
  );
  return unconfirmedOnly;
};

export const useDashboardUnconfirmedServices = () => {
  const employeeProfile = useAppStore((state) => state.employeeProfile);

  return useQuery({
    queryKey: ["dashboard-unconfirmed-services", employeeProfile?.id],
    queryFn: () => fetchYesterdayUnconfirmedServices(employeeProfile!.id),
    enabled: !!employeeProfile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes - less frequent updates for yesterday's data
    refetchInterval: false, // No auto refetch for yesterday's data
    refetchOnWindowFocus: true,
  });
};
