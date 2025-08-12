// src/features/auth/components/RegisterForm.tsx
"use client";

import { useState } from "react";
import { Form, Input, Button } from "antd";
import { supabase } from "@/services/supabaseClient";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Helper function to get redirect URL
const getRedirectUrl = (): string => {
  const isProduction = window.location.hostname !== "localhost";
  const baseUrl = isProduction
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

  return `${baseUrl}/auth/callback?next=/login`;
};

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [lastEmail, setLastEmail] = useState<string>("");
  const router = useRouter();

  // Function to resend confirmation email
  const resendConfirmation = async () => {
    if (!lastEmail) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: lastEmail,
        options: {
          emailRedirectTo: getRedirectUrl(),
        },
      });

      if (error) {
        toast.error("Không thể gửi lại email: " + error.message);
      } else {
        toast.success("Email xác nhận đã được gửi lại!");
      }
    } catch (error) {
      console.error("Resend confirmation error:", error);
      toast.error("Có lỗi xảy ra khi gửi lại email");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    const { email, password } = values;
    setLastEmail(email);

    try {
      // 1. Validate email exists in employee database
      const checkRes = await fetch(
        `/api/employees/check-email?email=${encodeURIComponent(email)}`
      );

      if (!checkRes.ok) {
        throw new Error("Không thể kiểm tra email. Vui lòng thử lại.");
      }

      const { exists } = await checkRes.json();
      if (!exists) {
        toast.error(
          "Email này chưa được khai báo trong hệ thống. Vui lòng liên hệ quản trị viên!"
        );
        setLoading(false);
        return;
      }

      // 2. Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getRedirectUrl(),
        },
      });

      if (error) {
        console.error("Supabase signup error:", error);

        // Handle specific error cases
        if (error.message.includes("already registered")) {
          toast.error(
            "Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác."
          );
        } else if (error.message.includes("invalid email")) {
          toast.error("Định dạng email không hợp lệ.");
        } else if (error.message.includes("password")) {
          toast.error("Mật khẩu không đáp ứng yêu cầu bảo mật.");
        } else {
          toast.error(`Đăng ký thất bại: ${error.message}`);
        }
        setLoading(false);
        return;
      }

      // 3. Link UID to employee record
      const uid = data?.user?.id;
      if (uid) {
        try {
          const linkRes = await fetch("/api/employees/link-uid", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, uid }),
          });

          if (!linkRes.ok) {
            console.error("Failed to link UID to employee");
          }
        } catch (linkError) {
          console.error("Error linking UID:", linkError);
        }
      }

      // 4. Show success message
      if (data?.user && !data.user.email_confirmed_at) {
        if (data.user.aud === "authenticated") {
          toast.warning(
            "Tài khoản đã tồn tại nhưng chưa xác nhận email. Email xác nhận đã được gửi lại."
          );
        } else {
          toast.success(
            "Đăng ký thành công! Email xác nhận đã được gửi đến " +
              email +
              ". Vui lòng kiểm tra hộp thư (bao gồm thư mục spam)."
          );
        }
      } else if (data?.user?.email_confirmed_at) {
        toast.success("Tài khoản đã được tạo và xác nhận thành công!");
      }

      setLoading(false);

      // Redirect after delay
      setTimeout(() => {
        router.push(
          "/login?info=" +
            encodeURIComponent("Vui lòng xác nhận email trước khi đăng nhập")
        );
      }, 3000);
    } catch (networkError) {
      console.error("Network or unexpected error:", networkError);
      toast.error(
        "Có lỗi kết nối xảy ra. Vui lòng kiểm tra internet và thử lại."
      );
      setLoading(false);
    }
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

      {lastEmail && (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Button
            type="link"
            onClick={resendConfirmation}
            loading={loading}
            style={{ padding: 0 }}
          >
            Không nhận được email? Gửi lại email xác nhận
          </Button>
        </div>
      )}
    </Form>
  );
}
