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
  ShopOutlined, // ✅ THÊM icon cho Suppliers
} from "@ant-design/icons";

import { useAppStore } from "@/stores/useAppStore";

interface SidebarNavProps {
  collapsed?: boolean;
}

interface LevelKeysProps {
  key?: string;
  children?: LevelKeysProps[];
}

const getLevelKeys = (items: LevelKeysProps[]) => {
  const key: Record<string, number> = {};
  const func = (items2: LevelKeysProps[], level = 1) => {
    items2.forEach((item) => {
      if (item.key) {
        key[item.key] = level;
      }
      if (item.children) {
        func(item.children, level + 1);
      }
    });
  };
  func(items);
  return key;
};

export default function SidebarNav({ collapsed }: SidebarNavProps) {
  const pathname = usePathname();

  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    if (pathname.startsWith("/appointments")) return ["appointments"];
    if (pathname.startsWith("/consulted-services"))
      return ["consulted-services"];
    if (pathname.startsWith("/dental-services")) return ["settings"];
    if (pathname.startsWith("/suppliers")) return ["settings"];
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
              {
                key: "suppliers",
                icon: <ShopOutlined />,
                label: <Link href="/suppliers">Nhà cung cấp</Link>,
              },
            ],
          },
        ] as Required<MenuProps>["items"])
      : []),
  ];

  // Get level keys for the menu items
  const levelKeys = getLevelKeys(menuItems as LevelKeysProps[]);

  // Handle open/close submenus - only allow one submenu open at a time
  const handleOpenChange: MenuProps["onOpenChange"] = (keys) => {
    if (collapsed) {
      setOpenKeys([]); // Close all submenus when collapsed
      return;
    }

    const currentOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);

    // If opening a new submenu
    if (currentOpenKey !== undefined) {
      const repeatIndex = keys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);

      setOpenKeys(
        keys
          // Remove repeat key at same level
          .filter((_, index) => index !== repeatIndex)
          // Remove all child keys of current level
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey])
      );
    } else {
      // If closing a submenu
      setOpenKeys(keys);
    }
  };

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
  } else if (pathname.startsWith("/suppliers")) {
    selectedKey = "suppliers";
  }

  return (
    <div
      style={{
        height: "calc(100vh - 64px)", // Adjust for header height
        display: "flex",
        flexDirection: "column",
        background: "#fff",
      }}
    >
      {/* <div
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
      </div> */}
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        style={{ borderRight: 0, flex: 1, fontSize: 16 }}
        items={menuItems}
        inlineCollapsed={collapsed}
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
