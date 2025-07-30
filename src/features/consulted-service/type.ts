// src/features/consulted-service/type.ts
import type {
  ConsultedService as PrismaConsultedService,
  DentalService,
  Employee,
} from "@prisma/client";

// Mở rộng type gốc để bao gồm cả thông tin từ dentalService
export type ConsultedServiceWithDetails = PrismaConsultedService & {
  dentalService?: DentalService;
  consultingDoctor?: Employee | null;
  treatingDoctor?: Employee | null;
  consultingSale?: Employee | null;
};
