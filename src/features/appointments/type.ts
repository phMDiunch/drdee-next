// src/features/appointments/type.ts
import type { Appointment  as PrismaAppointment  } from "@prisma/client";
export type Appointment  = PrismaAppointment ;

export type AppointmentStatus =
  | "Chờ xác nhận"
  | "Đã xác nhận"
  | "Đã đến"
  | "Không đến"
  | "Đã hủy";