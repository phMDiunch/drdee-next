// src/features/customers/type.ts
import type {
  Customer as PrismaCustomer,
  Appointment,
  Employee,
} from "@prisma/client";

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
