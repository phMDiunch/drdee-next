// src/app/(private)/page.tsx
"use client";
import { Layout, Menu, Button } from "antd";
import { useAuth } from "@/contexts/AuthContext";

const { Header, Sider, Content } = Layout;

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={200} style={{ background: "#fff" }}>
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: 20,
          }}
        >
          DrDee
        </div>
        <Menu mode="inline" defaultSelectedKeys={["dashboard"]}>
          <Menu.Item key="dashboard">Dashboard</Menu.Item>
          <Menu.Item key="employees">Quản lý nhân viên</Menu.Item>
          <Menu.Item key="customers">Quản lý khách hàng</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: 0,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <div style={{ padding: "0 24px" }}>
            Xin chào, <b>{user?.email}</b>
            <Button type="link" onClick={logout} style={{ marginLeft: 16 }}>
              Đăng xuất
            </Button>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px",
            background: "#fff",
            padding: 24,
            minHeight: 280,
          }}
        >
          <h2>Chào mừng bạn đến với Hệ thống quản lý DrDee!</h2>
        </Content>
      </Layout>
    </Layout>
  );
}
