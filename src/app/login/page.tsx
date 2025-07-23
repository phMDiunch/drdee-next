'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Typography, message } from 'antd';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Nếu đã login thì chuyển sang trang chủ
  if (user) {
    router.replace('/');
    return null;
  }

  const onFinish = async (values: any) => {
    setLoading(true);
    const { error } = await login(values.email, values.password);
    setLoading(false);
    if (error) {
      message.error(error);
    } else {
      message.success('Đăng nhập thành công!');
      router.replace('/');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto' }}>
      <Typography.Title level={2}>Đăng nhập</Typography.Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Nhập email!' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: 'Nhập mật khẩu!' }]}>
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          Đăng nhập
        </Button>
      </Form>
    </div>
  );
}
