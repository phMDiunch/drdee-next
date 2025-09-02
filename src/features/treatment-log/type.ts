// src/features/treatment-log/type.ts
export interface TreatmentLog {
  id: string;
  customerId: string;
  consultedServiceId: string;
  appointmentId?: string;
  treatmentDate: Date;
  treatmentNotes: string;
  nextStepNotes?: string;
  treatmentStatus: string;
  imageUrls: string[];
  xrayUrls: string[];
  dentistId: string;
  assistant1Id?: string;
  assistant2Id?: string;
  clinicId?: string;
  createdById: string;
  updatedById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TreatmentLogWithDetails extends TreatmentLog {
  customer: {
    id: string;
    fullName: string;
    customerCode?: string;
  };
  consultedService: {
    id: string;
    customerId: string;
    appointmentId?: string;
    dentalServiceId: string;
    clinicId: string;
    consultedServiceName: string;
    consultedServiceUnit: string;
    toothPositions: string[];
    specificStatus?: string;
    quantity: number;
    price: number;
    preferentialPrice: number;
    finalPrice: number;
    amountPaid: number;
    debt: number;
    consultationDate: Date;
    serviceConfirmDate?: Date;
    serviceStatus: string;
    treatmentStatus: string;
    consultingDoctorId?: string;
    consultingSaleId?: string;
    treatingDoctorId?: string;
    createdById: string;
    updatedById: string;
    createdAt: Date;
    updatedAt: Date;
    treatingDoctor?: {
      id: string;
      fullName: string;
    };
  };
  appointment?: {
    id: string;
    appointmentDateTime: Date;
    status: string;
  };
  dentist: {
    id: string;
    fullName: string;
  };
  assistant1?: {
    id: string;
    fullName: string;
  };
  assistant2?: {
    id: string;
    fullName: string;
  };
  createdBy: {
    id: string;
    fullName: string;
  };
}

export interface AppointmentForTreatment {
  id: string;
  appointmentDateTime: Date;
  status: string;
  notes?: string;
  customer: {
    id: string;
    fullName: string;
    customerCode: string;
    consultedServices: {
      id: string;
      consultedServiceName: string;
      consultedServiceUnit: string;
      serviceStatus: string;
      treatingDoctor?: {
        id: string;
        fullName: string;
      };
      treatmentLogs: TreatmentLogWithDetails[];
    }[];
  };
  primaryDentist: {
    id: string;
    fullName: string;
  };
  treatmentLogs: TreatmentLogWithDetails[];
}
