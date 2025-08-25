import { useQuery } from "@tanstack/react-query";
import { useAuthHeaders } from "@/lib/authHeaders";

export interface TreatmentRevenueData {
  consultedServiceId: string;
  consultedServiceName: string;
  customerId: string;
  customerName: string;
  customerCode: string;
  treatingDoctorName: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
}

export const useDashboardTreatmentRevenue = () => {
  const authHeaders = useAuthHeaders();

  return useQuery({
    queryKey: ["dashboard-treatment-revenue"],
    queryFn: async (): Promise<TreatmentRevenueData[]> => {
      const response = await fetch(
        "/api/reports/treatment-revenue?month=current",
        {
          headers: authHeaders,
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch treatment revenue");
      }
      const vouchers = await response.json();

      const treatmentRevenue: TreatmentRevenueData[] = [];

      vouchers.forEach(
        (voucher: {
          paymentDate: string;
          details: Array<{
            consultedServiceId: string;
            amount: number;
            paymentMethod: string;
            consultedService: {
              consultedServiceName: string;
              customer: {
                id: string;
                fullName: string;
                customerCode: string;
              };
              treatingDoctor: { fullName: string };
            };
          }>;
        }) => {
          voucher.details.forEach((detail) => {
            treatmentRevenue.push({
              consultedServiceId: detail.consultedServiceId,
              consultedServiceName:
                detail.consultedService.consultedServiceName,
              customerId: detail.consultedService.customer.id,
              customerName: detail.consultedService.customer.fullName,
              customerCode: detail.consultedService.customer.customerCode,
              treatingDoctorName:
                detail.consultedService.treatingDoctor.fullName,
              paymentDate: voucher.paymentDate,
              amount: detail.amount,
              paymentMethod: detail.paymentMethod,
            });
          });
        }
      );
      return treatmentRevenue;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};
