// src/features/customers/hooks/useCustomerDetail.ts
import { useState, useEffect, useCallback } from "react";
import type { CustomerWithDetails } from "../type";

export function useCustomerDetail(customerId: string) {
  const [customer, setCustomer] = useState<CustomerWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerDetail = useCallback(async () => {
    if (!customerId) return;

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
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi không xác định";
      setError(errorMessage);
      console.error("Error fetching customer detail:", err);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomerDetail();
  }, [fetchCustomerDetail]);

  // ✅ THÊM: Function refetch để có thể gọi lại từ component
  const refetch = useCallback(async () => {
    await fetchCustomerDetail();
  }, [fetchCustomerDetail]);

  return {
    customer,
    setCustomer,
    loading,
    error,
    refetch, // ✅ THÊM refetch vào return
  };
}
