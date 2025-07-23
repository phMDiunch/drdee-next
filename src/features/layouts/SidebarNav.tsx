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
    key: "settings",
    icon: <SettingOutlined />,
    label: "Cài đặt",
    children: [
      {
        key: "dental-services",
        icon: <MedicineBoxOutlined />,
        label: <Link href="/dental-services">Dịch vụ nha khoa</Link>,
      },
      // Thêm menu con khác nếu muốn
    ],
  },
];

export default function SidebarNav() {
  const pathname = usePathname();

  // Xác định key menu đang chọn
  let selectedKey = "dashboard";
  if (pathname.startsWith("/employees")) selectedKey = "employees";
  else if (pathname.startsWith("/customers")) selectedKey = "customers";
  else if (pathname.startsWith("/services")) selectedKey = "services";
  else if (pathname.startsWith("/settings")) selectedKey = "settings";
  else if (pathname.startsWith("/dental-services"))
    selectedKey = "dental-services";

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
