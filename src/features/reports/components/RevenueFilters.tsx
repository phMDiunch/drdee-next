// src/features/reports/components/RevenueFilters.tsx
"use client";
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Space,
  Typography,
  Button,
} from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useAppStore } from "@/stores/useAppStore";
import { useReportsPrefetch } from "../hooks/useReportsPrefetch";
import { REPORT_TIME_RANGES } from "../constants";
import type { ReportsFilters } from "../type";

const { Title } = Typography;
const { RangePicker, MonthPicker } = DatePicker;

interface Clinic {
  id: string;
  name: string;
}

interface Props {
  filters: ReportsFilters;
  onFiltersChange: (filters: ReportsFilters) => void;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function RevenueFilters({
  filters,
  onFiltersChange,
  loading = false,
  onRefresh,
}: Props) {
  const [localFilters, setLocalFilters] = useState<ReportsFilters>(filters);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const { employeeProfile } = useAppStore();
  const { smartPrefetch, prefetchNextMonth, prefetchPreviousMonth } =
    useReportsPrefetch();

  // Check if current user is admin
  const isAdmin = employeeProfile?.role === "admin";

  // Fetch clinics on component mount
  useEffect(() => {
    const fetchClinics = async () => {
      setLoadingClinics(true);
      try {
        const response = await fetch("/api/clinics");
        if (response.ok) {
          const clinicData = await response.json();
          setClinics(clinicData);
        }
      } catch (error) {
        console.error("Error fetching clinics:", error);
      } finally {
        setLoadingClinics(false);
      }
    };

    if (isAdmin) {
      fetchClinics();
    }
  }, [isAdmin]);

  // Force non-admin users to use month view only
  useEffect(() => {
    if (!isAdmin && localFilters.timeRange === "range") {
      const newFilters: ReportsFilters = {
        ...localFilters,
        timeRange: "month",
        selectedMonth: dayjs().format("YYYY-MM"),
        startDate: undefined,
        endDate: undefined,
      };
      setLocalFilters(newFilters);
      onFiltersChange(newFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, localFilters.timeRange]);

  // Ensure non-admin users are always on month view
  const handleTimeRangeChange = (timeRange: "month" | "range") => {
    const newFilters: ReportsFilters = {
      ...localFilters,
      timeRange,
      selectedMonth:
        timeRange === "month" ? dayjs().format("YYYY-MM") : undefined,
      startDate: undefined,
      endDate: undefined,
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleMonthChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      const newFilters: ReportsFilters = {
        ...localFilters,
        selectedMonth: date.format("YYYY-MM"),
      };
      setLocalFilters(newFilters);
      onFiltersChange(newFilters);

      // Prefetch adjacent months for smooth navigation
      setTimeout(() => {
        smartPrefetch(newFilters);
      }, 100); // Small delay to not block UI
    }
  };

  const handleDateRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => {
    if (dates && dates[0] && dates[1]) {
      const newFilters: ReportsFilters = {
        ...localFilters,
        startDate: dates[0].format("YYYY-MM-DD"),
        endDate: dates[1].format("YYYY-MM-DD"),
      };
      setLocalFilters(newFilters);
      onFiltersChange(newFilters);
    }
  };

  const handleClinicChange = (clinicId: string) => {
    const newFilters: ReportsFilters = {
      ...localFilters,
      clinicId: clinicId === "all" ? undefined : clinicId,
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]} align="middle">
        <Col>
          <Title
            level={5}
            style={{ margin: 0, display: "flex", alignItems: "center" }}
          >
            <FilterOutlined style={{ marginRight: 8 }} />
            Bộ lọc báo cáo
          </Title>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Time Range Type Selection - Only show range option for admin */}
        <Col xs={24} sm={12} lg={6}>
          <Space direction="vertical" style={{ width: "100%" }} size="small">
            <Typography.Text strong>Loại thời gian:</Typography.Text>
            <Select
              value={localFilters.timeRange}
              onChange={handleTimeRangeChange}
              style={{ width: "100%" }}
              options={REPORT_TIME_RANGES.filter(
                (range) => isAdmin || range.value === "month"
              ).map((range) => ({
                label: range.label,
                value: range.value,
              }))}
            />
          </Space>
        </Col>

        {/* Month Picker */}
        {localFilters.timeRange === "month" && (
          <Col xs={24} sm={12} lg={6}>
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              <Typography.Text strong>Chọn tháng:</Typography.Text>
              <MonthPicker
                style={{ width: "100%" }}
                value={
                  localFilters.selectedMonth
                    ? dayjs(localFilters.selectedMonth, "YYYY-MM")
                    : dayjs()
                }
                onChange={handleMonthChange}
                format="MM/YYYY"
                placeholder="Chọn tháng"
                onOpenChange={(open) => {
                  if (open) {
                    // Prefetch adjacent months when picker opens
                    setTimeout(() => {
                      prefetchNextMonth(localFilters);
                      prefetchPreviousMonth(localFilters);
                    }, 200);
                  }
                }}
              />
            </Space>
          </Col>
        )}

        {/* Date Range Picker */}
        {localFilters.timeRange === "range" && (
          <Col xs={24} sm={12} lg={8}>
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              <Typography.Text strong>Chọn khoảng thời gian:</Typography.Text>
              <RangePicker
                style={{ width: "100%" }}
                value={
                  localFilters.startDate && localFilters.endDate
                    ? [
                        dayjs(localFilters.startDate),
                        dayjs(localFilters.endDate),
                      ]
                    : null
                }
                onChange={handleDateRangeChange}
                format="DD/MM/YYYY"
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </Space>
          </Col>
        )}

        {/* Clinic Filter - Only for admin */}
        {isAdmin && (
          <Col xs={24} sm={12} lg={6}>
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              <Typography.Text strong>Cơ sở:</Typography.Text>
              <Select
                value={localFilters.clinicId || "all"}
                onChange={handleClinicChange}
                style={{ width: "100%" }}
                loading={loadingClinics}
                options={[
                  { label: "Tất cả cơ sở", value: "all" },
                  ...clinics.map((clinic) => ({
                    label: clinic.name,
                    value: clinic.id,
                  })),
                ]}
              />
            </Space>
          </Col>
        )}

        {/* Refresh Button */}
        <Col>
          <Space direction="vertical" style={{ width: "100%" }} size="small">
            <Typography.Text strong style={{ visibility: "hidden" }}>
              .
            </Typography.Text>
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={loading}
              type="default"
              style={{ width: "100%" }}
            >
              Làm mới
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
}
