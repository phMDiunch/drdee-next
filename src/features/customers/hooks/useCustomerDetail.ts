// src/features/customers/hooks/useCustomerDetail.ts
import { useState, useEffect } from "react";
import type { CustomerWithDetails } from "../type";

export function useCustomerDetail(customerId: string) {
  const [customer, setCustomer] = useState<CustomerWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) return;

    const fetchCustomerDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ SỬA: Dùng endpoint chuẩn với includeDetails=true
        const res = await fetch(
          `/api/customers/${customerId}?includeDetails=true`
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Lỗi không xác định");
        }

        const data = await res.json();
        setCustomer(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching customer detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetail();
  }, [customerId]);

  return {
    customer,
    setCustomer,
    loading,
    error,
  };
}
