// src/features/dental-service/components/DentalServiceList.tsx
"use client";
import { useEffect, useState } from "react";
import { Space, Button, message, Modal as AntdModal } from "antd";
import type { DentalService } from "../type";
import DentalServiceTable from "./DentalServiceTable";
import DentalServiceModal from "./DentalServiceModal";

type ModalState = { open: boolean; record?: Partial<DentalService> | null };

export default function DentalServiceList() {
  const [data, setData] = useState<DentalService[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>({ open: false, record: null });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dental-services");
      const services: DentalService[] = await res.json();
      setData(services);
    } catch (err) {
      message.error("Không thể tải danh sách dịch vụ!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => setModal({ open: true, record: null });
  const handleEdit = (record: DentalService) =>
    setModal({ open: true, record });
  const handleDelete = async (record: DentalService) => {
    AntdModal.confirm({
      title: "Xoá dịch vụ?",
      content: `Bạn chắc chắn muốn xoá dịch vụ "${record.name}"?`,
      onOk: async () => {
        try {
          await fetch(`/api/dental-services/${record.id}`, {
            method: "DELETE",
          });
          message.success("Đã xoá dịch vụ!");
          fetchData();
        } catch {
          message.error("Lỗi xoá dịch vụ!");
        }
      },
    });
  };

  const handleSave = async (values: Partial<DentalService>) => {
    setSaving(true);
    try {
      if (modal.record) {
        await fetch(`/api/dental-services/${modal.record.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        message.success("Cập nhật thành công!");
      } else {
        await fetch("/api/dental-services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        message.success("Thêm mới thành công!");
      }
      setModal({ open: false, record: null });
      fetchData();
    } catch {
      message.error("Lỗi lưu dịch vụ!");
    }
    setSaving(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>
          Thêm dịch vụ
        </Button>
      </Space>
      <DentalServiceTable
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <DentalServiceModal
        open={modal.open}
        record={modal.record}
        onCancel={() => setModal({ open: false, record: null })}
        onFinish={handleSave}
        loading={saving}
      />
    </div>
  );
}
