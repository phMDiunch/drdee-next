// src/features/treatment-care/components/RecordsList.tsx
"use client";
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Divider,
  Flex,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { GroupedByDay, TreatmentCareRecord } from "../type";
import {
  useDeleteTreatmentCare,
  useTreatmentCares,
} from "../hooks/useTreatmentCares";
import CareDetailDrawer from "./CareDetailDrawer";

const { Title, Text } = Typography;

function Item({ r }: { r: TreatmentCareRecord }) {
  const del = useDeleteTreatmentCare();
  return (
    <Card size="small">
      <Flex justify="space-between" gap={12} wrap>
        <div>
          <div>
            <Text strong>{r.customer?.fullName}</Text>{" "}
            <Text type="secondary">({r.customer?.customerCode || ""})</Text>
          </div>
          <div>
            <Text type="secondary">{dayjs(r.careAt).format("HH:mm")}</Text> •{" "}
            <Text>{r.careStatus}</Text>
          </div>
          <div style={{ marginTop: 4 }}>
            <Space wrap>
              {r.treatmentServiceNames.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
              {r.treatingDoctorNames.map((s) => (
                <Tag color="blue" key={s}>
                  {s}
                </Tag>
              ))}
            </Space>
          </div>
          <div style={{ marginTop: 6 }}>{r.careContent}</div>
        </div>
        <Space>
          <Button
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("aftercare:open-detail", { detail: r })
              )
            }
          >
            Xem
          </Button>
          <Button
            danger
            loading={del.isPending}
            onClick={() => del.mutate(r.id)}
          >
            Xóa
          </Button>
        </Space>
      </Flex>
    </Card>
  );
}

export default function RecordsList() {
  const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
  const [onlyMine, setOnlyMine] = useState(false);
  const [detail, setDetail] = useState<TreatmentCareRecord | undefined>();
  const from = dayjs(to).subtract(34, "day").format("YYYY-MM-DD");

  const { data, isLoading } = useTreatmentCares({
    from,
    to,
    groupBy: "day",
    onlyMine,
  });

  const groups = (data || []) as GroupedByDay;

  // Simple event wiring to open drawer from child items
  if (typeof window !== "undefined") {
    window.addEventListener("aftercare:open-detail", (e: Event) => {
      const custom = e as CustomEvent<TreatmentCareRecord>;
      setDetail(custom.detail);
    });
  }

  return (
    <Flex vertical gap={12}>
      <Flex justify="space-between" align="center" wrap gap={12}>
        <Title level={4} style={{ margin: 0 }}>
          Nhật ký chăm sóc (35 ngày)
        </Title>
        <Space>
          <Checkbox
            checked={onlyMine}
            onChange={(e) => setOnlyMine(e.target.checked)}
          >
            Chỉ của tôi
          </Checkbox>
          <DatePicker
            value={dayjs(to)}
            onChange={(d) => setTo((d || dayjs()).format("YYYY-MM-DD"))}
          />
        </Space>
      </Flex>
      {isLoading ? (
        <Spin />
      ) : (
        <div>
          {groups.map((g) => (
            <div key={g.day}>
              <Divider orientation="left">
                {dayjs(g.day).format("DD/MM/YYYY")}
              </Divider>
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="small"
              >
                {g.items.map((r) => (
                  <Item key={r.id} r={r} />
                ))}
              </Space>
            </div>
          ))}
        </div>
      )}

      <CareDetailDrawer
        open={!!detail}
        onClose={() => setDetail(undefined)}
        record={detail}
      />
    </Flex>
  );
}
