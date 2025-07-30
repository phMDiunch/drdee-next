// src/features/customers/hooks/useCustomerDetail.ts
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

type CustomerDetails = any; // Define proper type based on your needs

export function useCustomerDetail(customerId: string) {
  const [customer, setCustomer] = useState<CustomerDetails>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/customers/detail/${customerId}`);

      if (!res.ok) {
        throw new Error("Không thể tải thông tin khách hàng");
      }

      const data = await res.json();
      setCustomer(data);
    } catch (error: any) {
      console.error("Fetch customer details error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [customerId]);

  return {
    customer,
    setCustomer,
    loading,
    refetch: fetchDetails,
  };
}
