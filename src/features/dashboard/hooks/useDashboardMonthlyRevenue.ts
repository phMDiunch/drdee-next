// src/features/dashboard/hooks/useDashboardMonthlyRevenue.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/stores/useAppStore";
import { DashboardConsultedService } from "../type";
import dayjs from "dayjs";

const fetchMonthlyRevenue = async (doctorId: string) => {
  // Fetch tất cả dịch vụ tư vấn của user (API hiện tại không hỗ trợ filter theo tháng)
  const response = await fetch(
    `/api/consulted-services?consultingDoctorId=${doctorId}&consultingSaleId=${doctorId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch monthly consulted services");
  }

  const data: DashboardConsultedService[] = await response.json();

  // Filter theo tháng hiện tại và chỉ lấy dịch vụ đã chốt
  const currentMonthServices = (data || []).filter((service) => {
    const serviceDate = dayjs(service.consultationDate);
    const isCurrentMonth = serviceDate.isSame(dayjs(), "month");
    const isCompleted = service.serviceStatus === "Đã chốt";
    return isCurrentMonth && isCompleted;
  });

  // Tính tổng doanh số
  const totalRevenue = currentMonthServices.reduce((sum, service) => {
    return sum + (service.finalPrice || 0);
  }, 0);

  return {
    services: currentMonthServices,
    totalRevenue,
    count: currentMonthServices.length,
  };
};

export const useDashboardMonthlyRevenue = () => {
  const employeeProfile = useAppStore((state) => state.employeeProfile);

  return useQuery({
    queryKey: [
      "dashboard-monthly-revenue",
      employeeProfile?.id,
      dayjs().format("YYYY-MM"),
    ],
    queryFn: () => fetchMonthlyRevenue(employeeProfile!.id),
    enabled: !!employeeProfile?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes - longer cache for monthly data
    refetchInterval: false, // No auto refetch for monthly summary
    refetchOnWindowFocus: true,
  });
};
