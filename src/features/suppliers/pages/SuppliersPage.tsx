// src/features/suppliers/pages/SuppliersPage.tsx
"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Space,
  Typography,
  Modal,
  message,
  Drawer,
  Descriptions,
  Tag,
  Rate,
} from "antd";
import { PlusOutlined, FileExcelOutlined } from "@ant-design/icons";
import SupplierTable from "../components/SupplierTable";
import SupplierFilters from "../components/SupplierFilters";
import SupplierForm from "../components/SupplierForm";
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from "../hooks/useSuppliers";
import {
  getSupplierCategoryLabel,
  getSupplierCategoryColor,
} from "../constants";
import type {
  SupplierFilters as SupplierFiltersType,
  SupplierWithRelations,
  CreateSupplierData,
} from "../type";
import dayjs from "dayjs";

const { Title } = Typography;

export default function SuppliersPage() {
  // States
  const [filters, setFilters] = useState<SupplierFiltersType>({
    page: 1,
    limit: 10,
  });
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierWithRelations | null>(null);

  // Hooks
  const { data: suppliersResponse, isLoading } = useSuppliers(filters);
  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();
  const deleteSupplierMutation = useDeleteSupplier();

  // Handlers
  const handleFiltersChange = (newFilters: SupplierFiltersType) => {
    setFilters(newFilters);
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setFilters((prev) => ({ ...prev, page, limit: pageSize }));
  };

  const handleCreateSupplier = async (data: CreateSupplierData) => {
    try {
      await createSupplierMutation.mutateAsync(data);
      message.success("Tạo nhà cung cấp thành công!");
      setIsCreateModalVisible(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể tạo nhà cung cấp. Vui lòng thử lại!";
      message.error(errorMessage);
    }
  };

  const handleUpdateSupplier = async (data: CreateSupplierData) => {
    if (!selectedSupplier) return;

    try {
      await updateSupplierMutation.mutateAsync({
        ...data,
        id: selectedSupplier.id,
      });
      message.success("Cập nhật nhà cung cấp thành công!");
      setIsEditModalVisible(false);
      setSelectedSupplier(null);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể cập nhật nhà cung cấp. Vui lòng thử lại!";
      message.error(errorMessage);
    }
  };

  const handleDeleteSupplier = async (supplier: SupplierWithRelations) => {
    try {
      await deleteSupplierMutation.mutateAsync(supplier.id);
      message.success("Vô hiệu hóa nhà cung cấp thành công!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể xóa nhà cung cấp. Vui lòng thử lại!";
      message.error(errorMessage);
    }
  };

  const handleViewSupplier = (supplier: SupplierWithRelations) => {
    setSelectedSupplier(supplier);
    setIsDetailDrawerVisible(true);
  };

  const handleEditSupplier = (supplier: SupplierWithRelations) => {
    setSelectedSupplier(supplier);
    setIsEditModalVisible(true);
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    message.info("Tính năng xuất Excel đang được phát triển...");
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            Quản lý nhà cung cấp
          </Title>

          <Space>
            <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>
              Xuất Excel
            </Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
            >
              Thêm nhà cung cấp
            </Button>
          </Space>
        </div>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <SupplierFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          loading={isLoading}
        />
      </Card>

      {/* Table */}
      <Card>
        <SupplierTable
          data={suppliersResponse?.data || []}
          loading={isLoading}
          pagination={{
            current: filters.page || 1,
            pageSize: filters.limit || 10,
            total: suppliersResponse?.total || 0,
            onChange: handlePaginationChange,
          }}
          onView={handleViewSupplier}
          onEdit={handleEditSupplier}
          onDelete={handleDeleteSupplier}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Thêm nhà cung cấp mới"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        width={800}
        footer={null}
        destroyOnClose
      >
        <SupplierForm
          mode="create"
          onSubmit={handleCreateSupplier}
          onCancel={() => setIsCreateModalVisible(false)}
          loading={createSupplierMutation.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa nhà cung cấp"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setSelectedSupplier(null);
        }}
        width={800}
        footer={null}
        destroyOnClose
      >
        {selectedSupplier && (
          <SupplierForm
            mode="edit"
            initialData={selectedSupplier}
            onSubmit={handleUpdateSupplier}
            onCancel={() => {
              setIsEditModalVisible(false);
              setSelectedSupplier(null);
            }}
            loading={updateSupplierMutation.isPending}
          />
        )}
      </Modal>

      {/* Detail Drawer */}
      <Drawer
        title="Chi tiết nhà cung cấp"
        open={isDetailDrawerVisible}
        onClose={() => {
          setIsDetailDrawerVisible(false);
          setSelectedSupplier(null);
        }}
        width={600}
      >
        {selectedSupplier && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Mã nhà cung cấp">
              {selectedSupplier.supplierCode || "Chưa có"}
            </Descriptions.Item>

            <Descriptions.Item label="Tên nhà cung cấp">
              {selectedSupplier.name}
            </Descriptions.Item>

            <Descriptions.Item label="Loại">
              <Tag
                color={getSupplierCategoryColor(selectedSupplier.categoryType)}
              >
                {getSupplierCategoryLabel(selectedSupplier.categoryType)}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Số điện thoại">
              {selectedSupplier.phone || "Chưa có"}
            </Descriptions.Item>

            <Descriptions.Item label="Email">
              {selectedSupplier.email || "Chưa có"}
            </Descriptions.Item>

            <Descriptions.Item label="Website">
              {selectedSupplier.website ? (
                <a
                  href={selectedSupplier.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {selectedSupplier.website}
                </a>
              ) : (
                "Chưa có"
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Địa chỉ">
              {selectedSupplier.address || "Chưa có"}
            </Descriptions.Item>

            <Descriptions.Item label="Người liên hệ">
              {selectedSupplier.contactPerson || "Chưa có"}
            </Descriptions.Item>

            <Descriptions.Item label="SĐT người liên hệ">
              {selectedSupplier.contactPhone || "Chưa có"}
            </Descriptions.Item>

            <Descriptions.Item label="Mã số thuế">
              {selectedSupplier.taxId || "Chưa có"}
            </Descriptions.Item>

            <Descriptions.Item label="Số GPKD">
              {selectedSupplier.businessLicense || "Chưa có"}
            </Descriptions.Item>

            <Descriptions.Item label="Ngân hàng">
              {selectedSupplier.bankName || "Chưa có"}
            </Descriptions.Item>

            <Descriptions.Item label="Số tài khoản">
              {selectedSupplier.bankAccount || "Chưa có"}
            </Descriptions.Item>

            <Descriptions.Item label="Đánh giá">
              <Rate disabled value={selectedSupplier.rating || 0} />
              {selectedSupplier.ratingNote && (
                <div style={{ marginTop: 8, color: "#666" }}>
                  {selectedSupplier.ratingNote}
                </div>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              <Tag color={selectedSupplier.isActive ? "green" : "red"}>
                {selectedSupplier.isActive ? "Hoạt động" : "Tạm dừng"}
              </Tag>
            </Descriptions.Item>

            {selectedSupplier.description && (
              <Descriptions.Item label="Mô tả">
                {selectedSupplier.description}
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Ngày tạo">
              {dayjs(selectedSupplier.createdAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>

            <Descriptions.Item label="Người tạo">
              {selectedSupplier.createdBy.fullName}
            </Descriptions.Item>

            <Descriptions.Item label="Cập nhật cuối">
              {dayjs(selectedSupplier.updatedAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>

            <Descriptions.Item label="Người cập nhật">
              {selectedSupplier.updatedBy.fullName}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
