// src/app/(private)/dental-services/page.tsx
"use client";

/**
 * Trang danh sách dịch vụ nha khoa (Dental Services)
 * Route: /dental-services
 */

import DentalServiceList from "@/features/dental-service/components/DentalServiceList";

export default function DentalServicesPage() {
  return <DentalServiceList />;
}
