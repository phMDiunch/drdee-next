// src/features/treatment-care/components/TreatmentCareModal.tsx
"use client";
import { Modal, Form, DatePicker, Input, Radio } from "antd";
import dayjs from "dayjs";
import { useCreateTreatmentCareRecord } from "../hooks/useTreatmentCareRecords";
import { TREATMENT_CARE_STATUS_OPTIONS } from "../constants";

const { TextArea } = Input;

// Use shared options from constants

export default function CreateCareModal({
  open,
  onClose,
  customerId,
  treatmentDate,
}: {
  open: boolean;
  onClose: () => void;
  customerId: string;
  treatmentDate: string; // YYYY-MM-DD
}) {
  const [form] = Form.useForm();
  const createMut = useCreateTreatmentCareRecord();

  const handleOk = async () => {
    const v = await form.validateFields();
    await createMut.mutateAsync({
      customerId,
      treatmentDate,
      careAt: v.careAt.toISOString(),
      careStatus: v.careStatus,
      careContent: v.careContent,
    });
    onClose();
    form.resetFields();
  };

  return (
    <Modal
      title="Chăm sóc"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={createMut.isPending}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ careAt: dayjs(), careStatus: "STABLE" }}
      >
        {/* Thời điểm chăm sóc: hiển thị nhưng không cho chọn */}
        <Form.Item
          label="Thời điểm chăm sóc"
          name="careAt"
          rules={[{ required: true }]}
        >
          <DatePicker showTime style={{ width: "100%" }} disabled />
        </Form.Item>
        {/* Nội dung trước, trạng thái radio bên dưới cho thao tác nhanh */}
        <Form.Item
          label="Nội dung chăm sóc"
          name="careContent"
          rules={[{ required: true, min: 5 }]}
        >
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item
          label="Trạng thái"
          name="careStatus"
          rules={[{ required: true }]}
        >
          <Radio.Group
            options={TREATMENT_CARE_STATUS_OPTIONS}
            optionType="button"
            buttonStyle="solid"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
