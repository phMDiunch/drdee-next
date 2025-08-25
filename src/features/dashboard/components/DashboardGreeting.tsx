// src/features/dashboard/components/DashboardGreeting.tsx
"use client";

import { Typography } from "antd";
import { useAppStore } from "@/stores/useAppStore";

const { Title } = Typography;

export const DashboardGreeting = () => {
  const employeeProfile = useAppStore((state) => state.employeeProfile);

  return (
    <Title level={2} style={{ marginBottom: 24 }}>
      Xin chào: {employeeProfile?.fullName || "Người dùng"}
    </Title>
  );
};
