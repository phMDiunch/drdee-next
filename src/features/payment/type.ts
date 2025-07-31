// src/features/payment/type.ts
import type {
  PaymentVoucher as PrismaPaymentVoucher,
  PaymentVoucherDetail as PrismaPaymentVoucherDetail,
  Customer,
  Employee,
  ConsultedService,
} from "@prisma/client";

export type PaymentVoucherWithDetails = PrismaPaymentVoucher & {
  customer?: Customer;
  cashier?: Employee;
  createdBy?: Employee;
  updatedBy?: Employee;
  details?: PaymentVoucherDetailWithService[];
};

export type PaymentVoucherDetailWithService = PrismaPaymentVoucherDetail & {
  consultedService?: ConsultedService & {
    dentalService?: { name: string };
  };
  createdBy?: Employee;
};
