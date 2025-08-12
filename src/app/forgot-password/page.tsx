"use client";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Form, Input, Button, Typography, Card, message, Spin } from "antd";
import { supabase } from "@/services/supabaseClient";
import Link from "next/link";

// Helper function to get redirect URL
const getRedirectUrl = (): string => {
  const isProduction = window.location.hostname !== "localhost";
  const baseUrl = isProduction
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

  return `${baseUrl}/auth/callback?next=/login`;
};

export default function ForgotPasswordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formLoading, setFormLoading] = useState(false);

  if (loading)
    return <Spin style={{ display: "block", margin: "120px auto" }} />;
  if (user) {
    router.replace("/");
    return null;
  }

  const onFinish = async (values: { email: string }) => {
    setFormLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        values.email,
        {
          redirectTo: getRedirectUrl(),
        }
      );

      if (error) {
        console.error("Reset password error:", error);

        // Handle specific error cases
        if (
          error.message.includes("not found") ||
          error.message.includes("invalid")
        ) {
          message.error("Email này không tồn tại trong hệ thống.");
        } else if (error.message.includes("rate limit")) {
          message.error("Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.");
        } else {
          message.error(`Có lỗi xảy ra: ${error.message}`);
        }
      } else {
        message.success(
          "Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam) " +
            "và làm theo hướng dẫn để đặt lại mật khẩu."
        );
      }
    } catch (networkError) {
      console.error("Network error during password reset:", networkError);
      message.error(
        "Có lỗi kết nối xảy ra. Vui lòng kiểm tra internet và thử lại."
      );
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
          Quên mật khẩu
        </Typography.Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, type: "email", message: "Nhập email hợp lệ!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={formLoading}>
            Gửi yêu cầu đặt lại mật khẩu
          </Button>
        </Form>
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/login">Đã nhớ mật khẩu? Đăng nhập</Link>
        </div>
      </Card>
    </div>
  );
}
