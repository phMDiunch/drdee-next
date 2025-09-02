// src/features/suppliers/type.ts

import type { Supplier, Employee } from "@prisma/client";
import type { SupplierCategoryType as CategoryType } from "./constants";

// Export SupplierCategoryType từ constants
export type { SupplierCategoryType } from "./constants";

// Extended Supplier type với relations
export interface SupplierWithRelations extends Supplier {
  createdBy: Pick<Employee, "id" | "fullName">;
  updatedBy: Pick<Employee, "id" | "fullName">;
}

// For API responses with pagination
export interface SuppliersResponse {
  data: SupplierWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// For creating new supplier
export interface CreateSupplierData {
  name: string;
  categoryType: CategoryType;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  taxId?: string;
  businessLicense?: string;
  bankName?: string;
  bankAccount?: string;
  rating?: number;
  ratingNote?: string;
  description?: string;
  isActive?: boolean;
}

// For updating supplier
export interface UpdateSupplierData extends Partial<CreateSupplierData> {
  id: string;
}

// Search and filter parameters
export interface SupplierFilters {
  search?: string; // search by name, code, phone
  categoryType?: CategoryType;
  isActive?: boolean;
  rating?: number;
  page?: number;
  limit?: number;
  sortBy?: "name" | "createdAt" | "updatedAt" | "rating";
  sortOrder?: "asc" | "desc";
}

// For dropdown/select options
export interface SupplierOption {
  value: string;
  label: string;
  categoryType: CategoryType;
  phone?: string;
}

// Statistics
export interface SupplierStats {
  total: number;
  active: number;
  inactive: number;
  byCategory: Array<{
    categoryType: CategoryType;
    count: number;
    percentage: number;
  }>;
  averageRating: number;
}
