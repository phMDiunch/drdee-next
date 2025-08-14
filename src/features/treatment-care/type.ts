// src/features/treatment-care/type.ts
import { TreatmentCareStatus } from "@prisma/client";

export type CandidateItem = {
  customerId: string;
  customerCode: string | null;
  customerName: string;
  phone: string | null;
  treatmentDate: string; // YYYY-MM-DD
  treatmentServiceNames: string[];
  treatingDoctorNames: string[];
  careCount: number;
};

export type TreatmentCareRecord = {
  id: string;
  customerId: string;
  clinicId: string;
  careStaffId: string;
  treatmentDate: string; // date
  careAt: string; // timestamp
  careStatus: TreatmentCareStatus;
  careContent: string;
  treatmentServiceNames: string[];
  treatingDoctorNames: string[];
  treatingDoctorIds: string[];
  treatmentClinicIds: string[];
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    customerCode: string | null;
    fullName: string;
    phone: string | null;
  };
  careStaff?: { id: string; fullName: string };
};

export type GroupedByDay = { day: string; items: TreatmentCareRecord[] }[];
