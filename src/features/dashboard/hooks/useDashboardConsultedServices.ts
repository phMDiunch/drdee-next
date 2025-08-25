// src/features/dashboard/hooks/useDashboardConsultedServices.ts
"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { DashboardConsultedService } from "../type";
import { DATE_FORMAT } from "../constants";
import dayjs from "dayjs";

export const useDashboardConsultedServices = () => {
  const [consultedServices, setConsultedServices] = useState<
    DashboardConsultedService[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const employeeProfile = useAppStore((state) => state.employeeProfile);

  const fetchYesterdayConsultedServices = async () => {
    if (!employeeProfile?.id) {
      setConsultedServices([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const yesterday = dayjs().subtract(1, "day").format(DATE_FORMAT);
      const response = await fetch(
        `/api/consulted-services?date=${yesterday}&consultingDoctorId=${employeeProfile.id}&consultingSaleId=${employeeProfile.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch consulted services");
      }

      const data = await response.json();
      setConsultedServices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setConsultedServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeProfile?.id) {
      fetchYesterdayConsultedServices();
    } else {
      setConsultedServices([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeProfile?.id]);

  return {
    consultedServices,
    loading,
    error,
    refetch: fetchYesterdayConsultedServices,
  };
};
