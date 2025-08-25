// src/features/dashboard/type.ts
export interface DashboardAppointment {
  id: string;
  appointmentDateTime: string;
  duration: number;
  notes?: string;
  status: string;
  checkInTime?: string;
  checkOutTime?: string;
  customer: {
    id: string;
    customerCode?: string;
    fullName: string;
    phone?: string;
  };
  primaryDentist: {
    id: string;
    fullName: string;
  };
  secondaryDentist?: {
    id: string;
    fullName: string;
  };
}

export interface DashboardConsultedService {
  id: string;
  consultedServiceName: string;
  consultedServiceUnit: string;
  quantity: number;
  price: number;
  preferentialPrice: number;
  finalPrice: number;
  amountPaid: number;
  debt: number;
  consultationDate: string;
  serviceConfirmDate?: string;
  serviceStatus: string;
  treatmentStatus: string;
  customer: {
    id: string;
    customerCode?: string;
    fullName: string;
    phone?: string;
  };
  consultingDoctor?: {
    id: string;
    fullName: string;
  };
  consultingSale?: {
    id: string;
    fullName: string;
  };
  treatingDoctor?: {
    id: string;
    fullName: string;
  };
}

export interface DashboardData {
  todayAppointments: DashboardAppointment[];
  yesterdayConsultedServices: DashboardConsultedService[];
}
