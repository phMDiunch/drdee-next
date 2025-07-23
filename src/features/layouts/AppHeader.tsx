// src/features/layouts/AppHeader.tsx
"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Layout, Input, Badge, Avatar, Dropdown, Menu, Tooltip } from "antd";
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  SearchOutlined,
  DownOutlined,
} from "@ant-design/icons";

const { Header } = Layout;

export default function AppHeader() {
  const { user, logout } = useAuth();

  // Menu cho dropdown avatar
  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      key: "setting",
      icon: <SettingOutlined />,
      label: "Cài đặt tài khoản",
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
    },
  ];

  const onMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") logout();
    // Xử lý các key khác nếu cần
  };

  return (
    <Header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        width: "100%",
        background: "#fff",
        boxShadow: "0 2px 8px #f0f1f2",
        padding: 0,
        display: "flex",
        alignItems: "center",
        height: 64,
      }}
    >
      {/* Phần 1: Thương hiệu */}
      <div
        style={{
          flex: "0 0 200px",
          paddingLeft: 32,
          fontWeight: "bold",
          fontSize: 22,
          color: "#1677ff",
          letterSpacing: 2,
        }}
      >
        DR DEE
      </div>
      {/* Phần 2: Search */}
      <div style={{ flex: 1, padding: "0 24px" }}>
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          allowClear
          style={{ maxWidth: 400 }}
        />
      </div>
      {/* Phần 3: Notification + Avatar */}
      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          gap: 24,
          paddingRight: 32,
        }}
      >
        {/* Notification */}
        <Tooltip title="Thông báo">
          <Badge count={5} size="small">
            <BellOutlined style={{ fontSize: 20, color: "#555" }} />
          </Badge>
        </Tooltip>

        {/* Avatar + Dropdown */}
        <Dropdown
          menu={{
            items: menuItems,
            onClick: onMenuClick,
          }}
          trigger={["click"]}
        >
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Avatar size={36} icon={<UserOutlined />} />
            <span style={{ fontWeight: 500 }}>{user?.email}</span>
            <DownOutlined style={{ fontSize: 12, color: "#888" }} />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
}
