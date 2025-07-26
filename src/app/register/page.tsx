// src/app/register/page.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import RegisterForm from "@/features/auth/components/RegisterForm";
import { Typography, Card, Spin } from "antd";
import Link from "next/link";
import { useEffect } from "react";

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  // Nếu đang check login thì show loading (tránh nhấp nháy)
  if (loading)
    return <Spin style={{ display: "block", margin: "120px auto" }} />;

  // Nếu đã login thì chuyển về trang chủ
  if (user) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f6fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card style={{ maxWidth: 400, width: "100%" }}>
        <Typography.Title level={3} style={{ textAlign: "center" }}>
          Đăng ký tài khoản
        </Typography.Title>
        <RegisterForm />
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/login">Đã có tài khoản? Đăng nhập</Link>
        </div>
      </Card>
    </div>
  );
}
