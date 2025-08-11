// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Global styles của bạn
// import AntdRegistry from "@/lib/AntdRegistry"; // Import AntdRegistry
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import CSS của Toastify
import "@ant-design/v5-patch-for-react-19";
import { AuthProvider } from "@/contexts/AuthContext";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import QueryProvider from "@/lib/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DrDee-Next - Quản lý Nha khoa",
  description: "Hệ thống quản lý phòng khám nha khoa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <AntdRegistry>{children}</AntdRegistry>
          </AuthProvider>
        </QueryProvider>
        <ToastContainer position="top-right" autoClose={3000} closeOnClick />
      </body>
    </html>
  );
}
