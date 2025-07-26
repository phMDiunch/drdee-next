// src/app/login/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Typography, Card, message } from "antd";
import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";
import { toast } from "react-toastify";

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading) return null;
  if (user) return null;

  const onFinish = async (values: any) => {
    setFormLoading(true);
    const { error } = await login(values.email, values.password);
    setFormLoading(false);
    if (error) {
      // bạn nên dùng message.error từ antd ở đây (đã ok)
      toast.error(error);
    } else {
      toast.success("Đăng nhập thành công!");
      router.replace("/");
    }
  };

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
          Đăng nhập
        </Typography.Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Nhập email!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Nhập mật khẩu!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={formLoading}
            style={{ marginTop: 8 }}
          >
            Đăng nhập
          </Button>
        </Form>
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/register">Chưa có tài khoản? Đăng ký</Link>
          <br />
          <Link href="/forgot-password">Quên mật khẩu?</Link>
        </div>
      </Card>
    </div>
  );
}
