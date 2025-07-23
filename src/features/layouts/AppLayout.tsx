// src/features/layouts/AppLayout.tsx
"use client";
import { Layout } from "antd";
import SidebarNav from "./SidebarNav";
import AppHeader from "./AppHeader";

const { Sider, Header, Content } = Layout;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={220} style={{ background: "#fff" }}>
        <SidebarNav />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: 0 }}>
          <AppHeader />
        </Header>
        <Content
          style={{
            margin: "24px",
            background: "#fff",
            padding: 24,
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
