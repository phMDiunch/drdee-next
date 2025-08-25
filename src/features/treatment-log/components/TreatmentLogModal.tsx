// src/features/treatment-log/components/TreatmentLogModal.tsx
"use client";
import { Modal, Form, Input, Select, Row, Col, Typography } from "antd";
import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import type { TreatmentLogWithDetails } from "../type";
import {
  TREATMENT_STATUS_OPTIONS,
  DEFAULT_TREATMENT_STATUS,
} from "../constants";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

type Props = {
  open: boolean;
  mode: "add" | "edit";
  appointmentId?: string;
  customerId?: string;
  appointmentDate?: string;
  initialData?: Partial<TreatmentLogWithDetails>;
  consultedServices?: {
    id: string;
    consultedServiceName: string;
    consultedServiceUnit: string;
    serviceStatus: string;
  }[]; // ✅ Nhận consultedServices từ parent
  onCancel: () => void;
  onFinish: (values: Record<string, unknown>) => void;
  loading?: boolean;
};

export default function TreatmentLogModal({
  open,
  mode,
  appointmentId,
  customerId,
  appointmentDate,
  initialData,
  consultedServices = [], // ✅ Nhận từ parent, default là empty array
  onCancel,
  onFinish,
  loading = false,
}: Props) {
  const [form] = Form.useForm();
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const { activeEmployees, employeeProfile } = useAppStore();

  // Fetch clinics list when modal opens
  useEffect(() => {
    const fetchClinics = async () => {
      setLoadingClinics(true);
      try {
        const res = await fetch("/api/clinics");
        if (res.ok) {
          const data = await res.json();
          // Ensure employee's clinic appears even if not in API list
          const empClinicId = employeeProfile?.clinicId;
          const list: { id: string; name: string }[] = Array.isArray(data)
            ? data
            : [];
          const hasEmpClinic = empClinicId
            ? list.some((c) => c.id === empClinicId)
            : true;
          setClinics(
            !hasEmpClinic && empClinicId
              ? [{ id: empClinicId, name: empClinicId }, ...list]
              : list
          );
        }
      } finally {
        setLoadingClinics(false);
      }
    };
    if (open) fetchClinics();
  }, [open, employeeProfile?.clinicId]);

  // Reset form khi modal đóng
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  // Set form values khi mở modal và tất cả dependencies đã sẵn sàng
  useEffect(() => {
    if (open && !loadingClinics) {
      console.log("🔧 TreatmentLogModal - Setting form values:", {
        mode,
        initialData,
        appointmentId,
        employeeProfile: employeeProfile?.id,
        consultedServicesLoaded: consultedServices.length,
        clinicsLoaded: clinics.length,
      });

      // Reset form trước khi set values mới
      form.resetFields();

      if (mode === "add") {
        const addValues = {
          appointmentId,
          dentistId: employeeProfile?.id,
          treatmentStatus: DEFAULT_TREATMENT_STATUS,
          clinicId: employeeProfile?.clinicId,
        };
        console.log("➕ Add mode - setting values:", addValues);
        form.setFieldsValue(addValues);
      } else if (mode === "edit" && initialData) {
        const editValues = {
          consultedServiceId: initialData.consultedServiceId,
          treatmentNotes: initialData.treatmentNotes,
          nextStepNotes: initialData.nextStepNotes,
          treatmentStatus: initialData.treatmentStatus,
          dentistId: initialData.dentistId,
          assistant1Id: initialData.assistant1Id,
          assistant2Id: initialData.assistant2Id,
          clinicId: initialData.clinicId,
        };
        console.log("✏️ Edit mode - setting form values:", editValues);
        form.setFieldsValue(editValues);

        // Verify values were set (using requestAnimationFrame instead of setTimeout)
        requestAnimationFrame(() => {
          const currentValues = form.getFieldsValue();
          console.log("🔍 Current form values after setting:", currentValues);
        });
      }
    }
  }, [
    open,
    mode,
    initialData,
    appointmentId,
    employeeProfile,
    form,
    loadingClinics,
    consultedServices.length,
    clinics.length,
  ]);

  const handleFinish = (values: Record<string, unknown>) => {
    const submitData = {
      ...values,
      customerId,
      appointmentId,
      createdById: employeeProfile?.id,
      updatedById: employeeProfile?.id,
    };
    onFinish(submitData);
  };

  return (
    <Modal
      title={
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {mode === "add" ? "Thêm lịch sử điều trị" : "Sửa lịch sử điều trị"}
          </Title>
          {appointmentDate && (
            <span style={{ fontSize: 14, color: "#666" }}>
              Ngày điều trị: {appointmentDate}
            </span>
          )}
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading || loadingClinics}
      okButtonProps={{
        disabled: loadingClinics,
      }}
      width={800}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        preserve={false}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Dịch vụ nha khoa"
              name="consultedServiceId"
              rules={[{ required: true, message: "Vui lòng chọn dịch vụ" }]}
            >
              <Select
                placeholder="Chọn dịch vụ điều trị"
                loading={false}
                showSearch
                optionFilterProp="children"
              >
                {consultedServices.map((service) => (
                  <Option key={service.id} value={service.id}>
                    {service.consultedServiceName} -{" "}
                    {service.consultedServiceUnit}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Nội dung điều trị"
              name="treatmentNotes"
              rules={[
                { required: true, message: "Vui lòng nhập nội dung điều trị" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Mô tả chi tiết quá trình điều trị..."
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Kế hoạch bước tiếp theo" name="nextStepNotes">
              <TextArea
                rows={3}
                placeholder="Ghi chú cho buổi hẹn tiếp theo (nếu có)..."
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Bác sĩ điều trị"
              name="dentistId"
              rules={[{ required: true, message: "Vui lòng chọn bác sĩ" }]}
            >
              <Select
                showSearch
                allowClear
                placeholder="Chọn bác sĩ"
                options={activeEmployees.map((e) => ({
                  label: e.fullName,
                  value: e.id,
                }))}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Điều dưỡng 1" name="assistant1Id">
              <Select
                placeholder="Chọn điều dưỡng 1"
                showSearch
                allowClear
                options={activeEmployees.map((e) => ({
                  label: e.fullName,
                  value: e.id,
                }))}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Điều dưỡng 2" name="assistant2Id">
              <Select
                placeholder="Chọn điều dưỡng 2"
                allowClear
                showSearch
                options={activeEmployees.map((e) => ({
                  label: e.fullName,
                  value: e.id,
                }))}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Trạng thái điều trị"
              name="treatmentStatus"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            >
              <Select placeholder="Chọn trạng thái">
                {TREATMENT_STATUS_OPTIONS.map((status) => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Chi nhánh"
              name="clinicId"
              rules={[{ required: true, message: "Vui lòng chọn chi nhánh" }]}
            >
              <Select
                placeholder="Chọn chi nhánh"
                loading={loadingClinics}
                showSearch
                optionFilterProp="label"
              >
                {clinics.map((c) => (
                  <Option key={c.id} value={c.id} label={c.name}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
