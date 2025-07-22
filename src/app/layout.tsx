// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Global styles của bạn
import AntdRegistry from '@/lib/AntdRegistry'; // Import AntdRegistry
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import CSS của Toastify

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DrDee-Next - Quản lý Nha khoa',
  description: 'Hệ thống quản lý phòng khám nha khoa',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AntdRegistry> {/* Wrap children bằng AntdRegistry */}
          {children}
        </AntdRegistry>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover /> {/* Thêm ToastContainer */}
      </body>
    </html>
  );
}