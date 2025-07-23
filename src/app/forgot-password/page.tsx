"use client";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Form, Input, Button, Typography, Card, message, Spin } from "antd";
import { supabase } from "@/services/supabaseClient";
import Link from "next/link";

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

  const onFinish = async (values: any) => {
    setFormLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(values.email);
    setFormLoading(false);
    if (error) {
      message.error(error.message);
    } else {
      message.success("Vui lòng kiểm tra email để đặt lại mật khẩu!");
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
