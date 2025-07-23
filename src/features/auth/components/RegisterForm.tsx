// src/features/auth/components/RegisterForm.tsx
"use client";

import { useState } from "react";
import { Form, Input, Button } from "antd";
import { supabase } from "@/services/supabaseClient"; // import supabase instance bạn đã config
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleFinish = async (values: any) => {
    setLoading(true);
    const { email, password } = values;

    // 1. Check email có hợp lệ không
    const checkRes = await fetch(
      `/api/employees/check-email?email=${encodeURIComponent(email)}`
    );
    const { exists } = await checkRes.json();
    if (!exists) {
      toast.error("Email này chưa được khai báo, liên hệ quản trị viên!");
      setLoading(false);
      return;
    }

    // 2. Đăng ký Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      // Nếu email đã tồn tại, hiển thị thông báo rõ ràng
      if (
        error.message.includes("User already registered") ||
        error.status === 400
      ) {
        toast.error(
          "Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập."
        );
      } else {
        toast.error(error.message);
      }
      setLoading(false);
      return;
    }
    // 3. Liên kết uid vào bảng employee
    const uid = data?.user?.id;
    if (uid) {
      await fetch("/api/employees/link-uid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, uid }),
      });
    }
    toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.");
    setLoading(false);
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <Form layout="vertical" onFinish={handleFinish}>
      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, type: "email", message: "Nhập email hợp lệ" },
        ]}
      >
        <Input autoComplete="email" />
      </Form.Item>
      <Form.Item
        label="Mật khẩu"
        name="password"
        rules={[
          { required: true, min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
        ]}
      >
        <Input.Password autoComplete="new-password" />
      </Form.Item>
      <Button type="primary" htmlType="submit" block loading={loading}>
        Đăng ký
      </Button>
    </Form>
  );
}
