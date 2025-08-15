// src/features/treatment-care/pages/TreatmentCareListPage.tsx
"use client";
import { Tabs } from "antd";
import TreatmentCareCustomerTable from "../components/TreatmentCareCustomerTable";
import TreatmentCareTable from "../components/TreatmentCareTable";

export default function TreatmentCareListPage() {
  return (
    <Tabs
      items={[
        {
          key: "customers",
          label: "Khách hàng cần chăm sóc",
          children: <TreatmentCareCustomerTable />,
        },
        {
          key: "records",
          label: "Nhật ký chăm sóc",
          children: <TreatmentCareTable />,
        },
      ]}
    />
  );
}
