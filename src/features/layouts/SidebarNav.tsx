// src/features/layouts/SidebarNav.tsx
"use client";
import { Menu } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  SettingOutlined,
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
    key: "services",
    icon: <MedicineBoxOutlined />,
    label: <Link href="/services">Dịch vụ</Link>,
  },
  {
    key: "settings",
    icon: <SettingOutlined />,
    label: <Link href="/settings">Cài đặt</Link>,
  },
];

export default function SidebarNav() {
  const pathname = usePathname();

  // Logic xác định tab được chọn
  let selectedKey = "dashboard";
  if (pathname.startsWith("/employees")) selectedKey = "employees";
  else if (pathname.startsWith("/customers")) selectedKey = "customers";
  else if (pathname.startsWith("/services")) selectedKey = "services";
  else if (pathname.startsWith("/settings")) selectedKey = "settings";

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
        {/* Logo hoặc tên phòng khám */}
        <MedicineBoxOutlined
          style={{ fontSize: 28, marginRight: 8, color: "#1677ff" }}
        />
        DrDee
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{ borderRight: 0, flex: 1, fontSize: 16 }}
        items={menuItems}
      />
      {/* Footer sidebar (option) */}
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
