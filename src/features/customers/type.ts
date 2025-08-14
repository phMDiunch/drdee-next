// src/features/customers/type.ts
import type { Customer as PrismaCustomer, Appointment } from "@prisma/client";
import type { PaymentVoucherWithDetails } from "@/features/payment/type";

// Base customer type
export type Customer = PrismaCustomer & {
  // ✅ THÊM - Cho check-in functionality
  todayAppointment?: {
    id: string;
    appointmentDateTime: string;
    status: string;
    duration?: number;
    checkInTime: string | null;
    checkOutTime: string | null;
    notes?: string;
    primaryDentist: {
      fullName: string;
    };
  } | null;

  // ✅ THÊM - Cho primary contact display
  primaryContact?: {
    customerCode: string;
    fullName: string;
    phone: string;
  } | null;
};

// ✅ THÊM - Cho API responses khi cần full relations
export type CustomerWithRelations = PrismaCustomer & {
  appointments?: Appointment[];
  primaryContact?: PrismaCustomer | null;
  // Có thể thêm các relations khác khi cần
};

export type CustomerWithDetails = Customer & {
  // Optional heavy relations when includeDetails=true
  appointments?: unknown[];
  consultedServices?: unknown[];
  treatmentLogs?: unknown[];
  paymentVouchers?: PaymentVoucherWithDetails[];
};
