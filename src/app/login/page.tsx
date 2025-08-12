// src/app/login/page.tsx
"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Input, Button, Typography, Card, Spin } from "antd";
import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";
import { toast } from "react-toastify";

function LoginForm() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  // Clean URL helper function
  const cleanUrlParams = (paramName: string) => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete(paramName);
    window.history.replaceState({}, "", newUrl.toString());
  };

  // Show messages from auth callback or other sources
  useEffect(() => {
    const error = searchParams.get("error");
    const success = searchParams.get("success");
    const info = searchParams.get("info");

    if (error) {
      toast.error(error);
      cleanUrlParams("error");
    }

    if (success) {
      toast.success(success);
      cleanUrlParams("success");
    }

    if (info) {
      toast.info(info);
      cleanUrlParams("info");
    }
  }, [searchParams]);

  if (loading) return null;
  if (user) return null;

  const onFinish = async (values: { email: string; password: string }) => {
    setFormLoading(true);

    try {
      const { error } = await login(values.email, values.password);

      if (error) {
        // Handle specific login errors
        if (error.includes("Invalid login credentials")) {
          toast.error("Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.");
        } else if (error.includes("Email not confirmed")) {
          toast.error(
            "Vui lòng xác nhận email trước khi đăng nhập. Kiểm tra hộp thư của bạn."
          );
        } else if (error.includes("rate limit")) {
          toast.error(
            "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau."
          );
        } else {
          toast.error(error);
        }
      } else {
        toast.success("Đăng nhập thành công!");
        router.replace("/");
      }
    } catch (networkError) {
      console.error("Login network error:", networkError);
      toast.error("Có lỗi kết nối xảy ra. Vui lòng thử lại.");
    } finally {
      setFormLoading(false);
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={<Spin style={{ display: "block", margin: "120px auto" }} />}
    >
      <LoginForm />
    </Suspense>
  );
}
