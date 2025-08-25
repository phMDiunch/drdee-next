// src/features/dashboard/pages/DashboardPage.tsx
"use client";

import { useState } from "react";
import { Space } from "antd";
import { DashboardGreeting } from "../components/DashboardGreeting";
import { DashboardStatistics } from "../components/DashboardStatistics";
import { DashboardDailyAppointment } from "../components/DashboardDailyAppointment";
import { DashboardUnconfirmedServices } from "../components/DashboardUnconfirmedServices";
import { DashboardTodayServices } from "../components/DashboardTodayServices";
import { DashboardMonthlyRevenue } from "../components/DashboardMonthlyRevenue";
import { DashboardTreatmentRevenue } from "@/features/reports/components/DashboardTreatmentRevenue";

export const DashboardPage = () => {
  const [activeSection, setActiveSection] = useState<
    | "appointments"
    | "unconfirmed-services"
    | "today-services"
    | "monthly-revenue"
    | "treatment-revenue"
    | null
  >(null);

  const handleStatisticClick = (
    section:
      | "appointments"
      | "unconfirmed-services"
      | "today-services"
      | "monthly-revenue"
      | "treatment-revenue"
      | null
  ) => {
    setActiveSection(section);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <DashboardGreeting />

      <DashboardStatistics
        onCardClick={handleStatisticClick}
        activeCard={activeSection}
      />

      {activeSection === "appointments" && <DashboardDailyAppointment />}

      {activeSection === "unconfirmed-services" && (
        <DashboardUnconfirmedServices />
      )}

      {activeSection === "today-services" && <DashboardTodayServices />}

      {activeSection === "monthly-revenue" && <DashboardMonthlyRevenue />}

      {activeSection === "treatment-revenue" && <DashboardTreatmentRevenue />}
    </Space>
  );
};
