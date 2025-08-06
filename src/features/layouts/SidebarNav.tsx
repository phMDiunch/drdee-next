"use client";
import { useState } from "react";
import { Menu } from "antd";
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
} from "@ant-design/icons";

const menuItems = [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: <Link href="/">Dashboard</Link>,
  },
  {
    key: "employees",
    icon: <TeamOutlined />,
    label: <Link href="/employees">Nhân viên</Link>,
  },
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
];

export default function SidebarNav() {
  const pathname = usePathname();

  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    if (pathname.startsWith("/appointments")) return ["appointments"];
    if (pathname.startsWith("/consulted-services"))
      return ["consulted-services"];
    if (pathname.startsWith("/dental-services")) return ["settings"];
    return [];
  });

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
