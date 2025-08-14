// src/app/(private)/treatment-care/page.tsx
import CandidatesTable from "@/features/treatment-care/components/CandidatesTable";
import RecordsList from "@/features/treatment-care/components/RecordsList";
import { Tabs } from "antd";

export default function TreatmentCarePage() {
  return (
    <Tabs
      items={[
        {
          key: "candidates",
          label: "Khách hàng cần chăm sóc",
          children: <CandidatesTable />,
        },
        {
          key: "records",
          label: "Nhật ký chăm sóc",
          children: <RecordsList />,
        },
      ]}
    />
  );
}
