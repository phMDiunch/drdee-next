export type Employee = {
  id: string;
  uid?: string;
  email: string;
  role: string;
  employeeCode?: string;
  fullName: string;
  dob?: string; // ISO string
  gender?: string;
  avatarUrl?: string;
  phone: string;
  currentAddress?: string;
  hometown?: string;
  nationalId?: string;
  nationalIdIssueDate?: string;
  nationalIdIssuePlace?: string;
  taxId?: string;
  insuranceNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  employmentStatus: string;
  clinicId?: string;
  department?: string;
  position?: string;
  createdById?: string;
  updatedById?: string;
  createdAt?: string;
  updatedAt?: string;
};
