// src/features/employees/components/EmployeeForm.tsx
"use client";
import { Form, Divider, Button } from "antd";
import type { Employee } from "../type";
import AccountInfoSection from "./form-sections/AccountInfoSection";
import BasicInfoSection from "./form-sections/BasicInfoSection";
import ContactInfoSection from "./form-sections/ContactInfoSection";
import LegalInfoSection from "./form-sections/LegalInfoSection";
import BankInfoSection from "./form-sections/BankInfoSection";
import WorkInfoSection from "./form-sections/WorkInfoSection";
import dayjs from "dayjs";

// Form data type for modal (with dayjs objects for DatePicker)
type EmployeeFormData = Omit<Employee, "dob" | "nationalIdIssueDate"> & {
  dob?: dayjs.Dayjs;
  nationalIdIssueDate?: dayjs.Dayjs;
};

type EmployeeFormProps = {
  form: any;
  initialValues?: Partial<EmployeeFormData>;
  onFinish: (values: Partial<Employee>) => void;
  loading?: boolean;
};

export default function EmployeeForm({
  form,
  initialValues = {},
  onFinish,
  loading = false,
}: EmployeeFormProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onFinish}
      autoComplete="off"
    >
      <AccountInfoSection />
      <Divider />
      <BasicInfoSection />
      <Divider />
      <ContactInfoSection />
      <Divider />
      <LegalInfoSection />
      <Divider />
      <BankInfoSection />
      <Divider />
      <WorkInfoSection />

      <Button
        type="primary"
        htmlType="submit"
        loading={loading}
        style={{ marginTop: 24 }} // Tăng margin top
        block
      >
        Lưu
      </Button>
    </Form>
  );
}
