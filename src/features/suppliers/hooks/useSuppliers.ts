// src/features/suppliers/hooks/useSuppliers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthHeaders } from "@/lib/authHeaders";
import type {
  SuppliersResponse,
  SupplierWithRelations,
  CreateSupplierData,
  UpdateSupplierData,
  SupplierFilters,
} from "../type";

const SUPPLIERS_QUERY_KEY = "suppliers";

// Fetch suppliers list with filters
export function useSuppliers(filters?: SupplierFilters) {
  const headers = useAuthHeaders();

  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.append("search", filters.search);
  if (filters?.categoryType)
    queryParams.append("categoryType", filters.categoryType);
  if (filters?.isActive !== undefined)
    queryParams.append("isActive", filters.isActive.toString());
  if (filters?.page) queryParams.append("page", filters.page.toString());
  if (filters?.limit) queryParams.append("limit", filters.limit.toString());

  return useQuery({
    queryKey: [SUPPLIERS_QUERY_KEY, filters],
    queryFn: async (): Promise<SuppliersResponse> => {
      const response = await fetch(`/api/suppliers?${queryParams.toString()}`, {
        headers,
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch single supplier by ID
export function useSupplier(id: string) {
  const headers = useAuthHeaders();

  return useQuery({
    queryKey: [SUPPLIERS_QUERY_KEY, id],
    queryFn: async (): Promise<SupplierWithRelations> => {
      const response = await fetch(`/api/suppliers/${id}`, {
        headers,
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Create new supplier
export function useCreateSupplier() {
  const queryClient = useQueryClient();
  const headers = useAuthHeaders();

  return useMutation({
    mutationFn: async (
      data: CreateSupplierData
    ): Promise<SupplierWithRelations> => {
      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate suppliers list to refresh data
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_QUERY_KEY] });
    },
  });
}

// Update supplier
export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  const headers = useAuthHeaders();

  return useMutation({
    mutationFn: async (
      data: UpdateSupplierData
    ): Promise<SupplierWithRelations> => {
      const { id, ...updateData } = data;
      const response = await fetch(`/api/suppliers/${id}`, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: (updatedSupplier) => {
      // Update specific supplier in cache
      queryClient.setQueryData(
        [SUPPLIERS_QUERY_KEY, updatedSupplier.id],
        updatedSupplier
      );
      // Invalidate suppliers list
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_QUERY_KEY] });
    },
  });
}

// Delete/deactivate supplier
export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  const headers = useAuthHeaders();

  return useMutation({
    mutationFn: async (id: string): Promise<SupplierWithRelations> => {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate suppliers list to refresh data
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_QUERY_KEY] });
    },
  });
}

// Get all active suppliers for dropdown/select
export function useSupplierOptions() {
  const { data: suppliersResponse } = useSuppliers({
    isActive: true,
    limit: 1000, // Get all active suppliers
  });

  const options =
    suppliersResponse?.data?.map((supplier) => ({
      value: supplier.id,
      label: supplier.name,
      categoryType: supplier.categoryType,
      phone: supplier.phone || undefined,
    })) || [];

  return { options, loading: !suppliersResponse };
}
