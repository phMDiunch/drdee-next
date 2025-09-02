// src/features/layouts/AppHeader.tsx
"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Layout, Badge, Avatar, Dropdown, Tooltip, Button } from "antd";
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import GlobalCustomerSearch from "@/components/GlobalCustomerSearch";

const { Header } = Layout;

interface AppHeaderProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function AppHeader({ collapsed, onToggle }: AppHeaderProps) {
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
    { type: "divider" as const },
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
        position: "fixed", // Change to fixed instead of sticky
        top: 0,
        zIndex: 1000, // Higher z-index
        width: "100%",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        padding: 0,
        display: "flex",
        alignItems: "center",
        height: 64,
        left: 0, // Ensure it covers full width
      }}
    >
      {/* Custom Trigger Button - show on mobile or when sidebar is collapsed */}
      {onToggle && (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggle}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
            className="mobile-trigger-btn"
          />
        </div>
      )}

      {/* Phần 1: Thương hiệu - responsive */}
      <div
        style={{
          flex: "0 0 auto",
          paddingLeft: onToggle ? 8 : 32,
          paddingRight: 16,
          fontWeight: "bold",
          fontSize: 22,
          color: "#1677ff",
          letterSpacing: 2,
        }}
        className="header-brand"
      >
        DR DEE
      </div>

      {/* Phần 2: Global Search - responsive */}
      <div
        style={{
          flex: 1,
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          minWidth: 0, // Allow shrinking
        }}
      >
        <GlobalCustomerSearch
          placeholder="Tìm kiếm khách hàng..."
          style={{
            maxWidth: 400,
            width: "100%",
            minWidth: "150px",
          }}
        />
      </div>

      {/* Phần 3: Notification + Avatar */}
      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          gap: 16,
          paddingRight: 24,
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
              minWidth: 0, // Allow shrinking
            }}
          >
            <Avatar size={36} icon={<UserOutlined />} />
            <span
              style={{
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "120px",
              }}
              className="header-username"
            >
              {user?.email}
            </span>
            <DownOutlined style={{ fontSize: 12, color: "#888" }} />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
}
