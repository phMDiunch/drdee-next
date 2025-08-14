"use client";
import { useState } from "react";
import { Menu, type MenuProps } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  SettingOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ScheduleOutlined,
  DollarOutlined, // ✅ THÊM icon cho Payment
  ExperimentOutlined, // ✅ THÊM icon cho Consulted Services
  BarChartOutlined, // ✅ THÊM icon cho Reports
  HeartOutlined,
} from "@ant-design/icons";

import { useAppStore } from "@/stores/useAppStore";

export default function SidebarNav() {
  const pathname = usePathname();

  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    if (pathname.startsWith("/appointments")) return ["appointments"];
    if (pathname.startsWith("/consulted-services"))
      return ["consulted-services"];
    if (pathname.startsWith("/dental-services")) return ["settings"];
    return [];
  });

  const employeeProfile = useAppStore((state) => state.employeeProfile);
  const menuItems: Required<MenuProps>["items"] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link href="/">Dashboard</Link>,
    },
    ...(employeeProfile?.position === "Giám đốc"
      ? ([
          {
            key: "employees",
            icon: <TeamOutlined />,
            label: <Link href="/employees">Nhân viên</Link>,
          },
        ] as Required<MenuProps>["items"])
      : []),
    {
      key: "customers",
      icon: <UserOutlined />,
      label: <Link href="/customers">Khách hàng</Link>,
    },
    {
      key: "appointments",
      icon: <CalendarOutlined />,
      label: "Lịch hẹn",
      children: [
        {
          key: "appointments-list",
          icon: <ScheduleOutlined />,
          label: <Link href="/appointments">Quản lý lịch hẹn</Link>,
        },
        {
          key: "appointments-today",
          icon: <ClockCircleOutlined />,
          label: <Link href="/appointments/today">Lịch hẹn theo ngày</Link>, // ✅ SỬA LABEL
        },
      ],
    },
    // ✅ NEW: Consulted Services menu
    {
      key: "consulted-services",
      icon: <ExperimentOutlined />,
      label: "Dịch vụ tư vấn",
      children: [
        {
          key: "consulted-services-daily",
          icon: <ClockCircleOutlined />,
          label: <Link href="/consulted-services-daily">Theo ngày</Link>,
        },
      ],
    },
    // ✅ Payment menu - single entry point
    {
      key: "payments",
      icon: <DollarOutlined />,
      label: <Link href="/payments">Phiếu thu</Link>,
    },
    // Move Treatment Care below Payments
    {
      key: "treatment-care",
      icon: <HeartOutlined />,
      label: <Link href="/treatment-care">Chăm sóc sau điều trị</Link>,
    },
    // ✅ NEW: Reports menu
    {
      key: "reports",
      icon: <BarChartOutlined />,
      label: <Link href="/reports">Báo cáo</Link>,
    },
    ...(employeeProfile?.position === "Giám đốc"
      ? ([
          {
            key: "settings",
            icon: <SettingOutlined />,
            label: "Cài đặt",
            children: [
              {
                key: "dental-services",
                icon: <MedicineBoxOutlined />,
                label: <Link href="/dental-services">Dịch vụ nha khoa</Link>,
              },
            ],
          },
        ] as Required<MenuProps>["items"])
      : []),
  ];

  // ✅ SỬA: Xác định selectedKey
  let selectedKey = "dashboard";

  if (pathname.startsWith("/employees")) {
    selectedKey = "employees";
  } else if (pathname.startsWith("/customers")) {
    selectedKey = "customers";
  } else if (pathname.startsWith("/appointments/today")) {
    selectedKey = "appointments-today";
  } else if (pathname.startsWith("/appointments")) {
    selectedKey = "appointments-list";
  } else if (pathname.startsWith("/consulted-services-daily")) {
    selectedKey = "consulted-services-daily";
  } else if (pathname.startsWith("/payments")) {
    selectedKey = "payments";
  } else if (pathname.startsWith("/reports")) {
    selectedKey = "reports";
  } else if (pathname.startsWith("/treatment-care")) {
    selectedKey = "treatment-care";
  } else if (pathname.startsWith("/dental-services")) {
    selectedKey = "dental-services";
  }

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
      }}
    >
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: 22,
          letterSpacing: 1,
          color: "#1677ff",
          borderBottom: "1px solid #f0f0f0",
          background: "#fff",
        }}
      >
        <MedicineBoxOutlined
          style={{ fontSize: 28, marginRight: 8, color: "#1677ff" }}
        />
        DrDee
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        style={{ borderRight: 0, flex: 1, fontSize: 16 }}
        items={menuItems}
      />
      <div
        style={{
          textAlign: "center",
          padding: "16px 0",
          fontSize: 12,
          color: "#bbb",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <span>© {new Date().getFullYear()} DrDee</span>
      </div>
    </div>
  );
}
