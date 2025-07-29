// src/app/(private)/customers/[id]/page.tsx
"use client";
import CustomerDetailPage from "@/features/customers/pages/CustomerDetailPage";
import { useParams } from "next/navigation";

export default function CustomerDetailPageWrapper() {
  const params = useParams();
  const id = params.id as string;

  return <CustomerDetailPage customerId={id} />;
}
