// src/features/layouts/AppLayout.tsx
"use client";
import { useState } from "react";
import { Layout, theme } from "antd";
import SidebarNav from "./SidebarNav";
import AppHeader from "./AppHeader";

const { Sider, Header, Content } = Layout;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Handle responsive breakpoint changes
  const onBreakpoint = (broken: boolean) => {
    if (broken) {
      setCollapsed(true); // Auto collapse on mobile
    } else {
      setCollapsed(false); // Auto expand on desktop
    }
  };

  const onCollapse = (collapsed: boolean, type: string) => {
    if (type !== "responsive") {
      // Only update state if it's not a responsive change
      setCollapsed(collapsed);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Mobile Overlay */}
      {!collapsed && (
        <div
          style={{
            position: "fixed",
            top: 64, // Start below header
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            zIndex: 998,
            display: "none", // Hide by default, show on mobile via CSS
          }}
          className="mobile-sidebar-overlay"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Responsive Sider */}
      <Sider
        trigger={null} // Custom trigger
        collapsible
        collapsed={collapsed}
        breakpoint="lg" // Responsive breakpoint at 992px
        collapsedWidth={0} // Completely hide on mobile
        onBreakpoint={onBreakpoint}
        onCollapse={onCollapse}
        width={220}
        style={{
          background: "#fff",
          position: "fixed", // Fixed position for better mobile support
          left: 0,
          top: 64, // Start below the header (header height is 64px)
          bottom: 0,
          zIndex: 999, // Below header but above content
          overflow: "auto",
          transition: "all 0.2s ease",
        }}
        className="app-sidebar"
      >
        <SidebarNav collapsed={collapsed} />
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 0 : 220, // Adjust main layout based on sidebar
          transition: "margin-left 0.2s ease",
        }}
      >
        <Header
          style={{
            background: "#fff",
            padding: 0,
            position: "fixed", // Fixed header
            top: 0,
            right: 0,
            left: collapsed ? 0 : 220, // Adjust header position
            zIndex: 1000,
            height: 64,
            transition: "left 0.2s ease",
          }}
        >
          <AppHeader
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
          />
        </Header>

        <Content
          style={{
            margin: "88px 24px 24px 24px", // Top margin for fixed header
            background: colorBgContainer,
            padding: 24,
            minHeight: "calc(100vh - 112px)", // Account for header height
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
