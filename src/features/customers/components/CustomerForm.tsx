// src/features/customers/components/CustomerForm.tsx
"use client";
import {
  Form,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  Button,
  Spin,
  Radio,
} from "antd";
import { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import type { Customer } from "../type";
import { BRANCHES, GENDER_OPTIONS } from "@/constants";
import {
  CUSTOMER_SOURCES,
  CustomerSource,
  SERVICES_OF_INTEREST,
} from "../constants";
import { useAppStore } from "@/stores/useAppStore";
import administrativeUnits from "@/data/vietnamAdministrativeUnits.json";

type District = {
  name: string;
};

type Province = {
  name: string;
  districts: District[];
};

type Props = {
  form?: any;
  initialValues?: Partial<Customer & { primaryContact: any }>;
  onFinish: (values: Partial<Customer>) => void;
  loading?: boolean;
  mode?: "add" | "edit";
  customers?: any[];
};

export default function CustomerForm({
  form: formProp,
  initialValues = {},
  onFinish,
  loading = false,
  customers = [],
  mode = "add",
}: Props) {
  const [form] = Form.useForm(formProp);
  const employee = useAppStore((state) => state.employeeProfile);
  const activeEmployees = useAppStore((state) => state.activeEmployees);

  const [searching, setSearching] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // --- State cho Tỉnh/Thành và Quận/Huyện ---
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(
    initialValues.city
  );
  // ------

  const [selectedSource, setSelectedSource] = useState<CustomerSource | null>(
    null
  );

  // Hàm xử lý khi người dùng chọn một nguồn khách hàng
  const handleSourceChange = (sourceValue: string) => {
    const source =
      CUSTOMER_SOURCES.find((s) => s.value === sourceValue) || null;
    setSelectedSource(source);
    // Xóa giá trị cũ của ô ghi chú nguồn để tránh nhầm lẫn
    form.setFieldsValue({ sourceNotes: undefined });
  };

  // --- THAY ĐỔI LỚN: Khởi tạo state từ prop `customers` ---
  const [customerOptions, setCustomerOptions] = useState<any[]>(() => {
    // 1. Chuyển danh sách khách hàng có sẵn thành options
    const initialOptions = customers.map((c) => ({
      label: `${c.fullName} - ${c.phone || "Chưa có SĐT"}`,
      value: c.id,
    }));

    // 2. Nếu là mode Edit, đảm bảo người liên hệ chính luôn có trong danh sách
    if (mode === "edit" && initialValues.primaryContact) {
      const contact = initialValues.primaryContact as any;
      const contactExists = initialOptions.some(
        (opt) => opt.value === initialValues.primaryContactId
      );

      if (!contactExists) {
        initialOptions.push({
          label: `${contact.fullName} - ${contact.phone || "Chưa có SĐT"}`,
          value: initialValues.primaryContactId,
        });
      }
    }
    return initialOptions;
  });

  // --- Load dữ liệu và xử lý logic cho dropdown ---
  useEffect(() => {
    // Load danh sách tỉnh/thành từ file JSON
    setProvinces(administrativeUnits);

    // Nếu là mode "edit" và đã có thông tin tỉnh/thành, load sẵn danh sách quận/huyện
    if (initialValues.city) {
      const provinceData = administrativeUnits.find(
        (p) => p.name === initialValues.city
      );
      if (provinceData) {
        setDistricts(provinceData.districts);
      }
    }
  }, [initialValues.city]);

  const handleProvinceChange = (provinceName: string) => {
    const provinceData = provinces.find((p) => p.name === provinceName);
    if (provinceData) {
      setDistricts(provinceData.districts);
      setSelectedProvince(provinceName);
      // Reset trường quận/huyện mỗi khi thay đổi tỉnh/thành
      form.setFieldsValue({ district: undefined });
    } else {
      setDistricts([]);
      setSelectedProvince(undefined);
      form.setFieldsValue({ district: undefined });
    }
  };

  const fetchCustomers = async (searchValue: string) => {
    if (!searchValue) {
      setCustomerOptions([]);
      return;
    }
    setSearching(true);
    try {
      const params = new URLSearchParams({
        search: searchValue,
        pageSize: "50",
      });
      const res = await fetch(`/api/customers?${params.toString()}`);
      const data = await res.json();
      const options = (data.customers || []).map((c: any) => ({
        label: `${c.fullName} - ${c.phone || "Chưa có SĐT"}`,
        value: c.id,
      }));
      setCustomerOptions(options);
    } catch (error) {
      console.error("Lỗi tìm kiếm khách hàng:", error);
    }
    setSearching(false);
  };

  const debouncedFetchCustomers = useCallback(
    debounce(fetchCustomers, 500),
    []
  );

  const checkPhoneNumber = useCallback(
    debounce(async (phone: string) => {
      if (mode !== "add" || !/^0\d{9}$/.test(phone)) {
        setDuplicateWarning(null);
        return;
      }
      try {
        const res = await fetch(
          `/api/customers/check-phone?phone=${encodeURIComponent(phone)}`
        );
        const data = await res.json();
        if (data.exists) {
          setDuplicateWarning(
            `SĐT đã tồn tại: ${data.customer.customerCode} - ${data.customer.fullName}`
          );
        } else {
          setDuplicateWarning(null);
        }
      } catch (error) {
        setDuplicateWarning(null);
      }
    }, 500),
    [mode]
  );

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        ...initialValues,
        clinicId: initialValues.clinicId || employee?.clinicId,
      }}
      onFinish={onFinish}
      autoComplete="off"
    >
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Họ tên"
            name="fullName"
            rules={[{ required: true, message: "Nhập họ tên" }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Ngày sinh"
            name="dob"
            rules={[{ required: true, message: "Nhập ngày sinh" }]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: "Chọn giới tính" }]}
          >
            <Radio.Group>
              {GENDER_OPTIONS.map((option) => (
                <Radio key={option.value} value={option.value}>
                  {option.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            dependencies={["primaryContactId"]}
            help={duplicateWarning}
            validateStatus={duplicateWarning ? "warning" : ""}
            rules={[
              ({ getFieldValue }) => ({
                required: !getFieldValue("primaryContactId"),
                message: "Phải nhập SĐT hoặc chọn Người liên hệ chính",
              }),
              { pattern: /^0\d{9}$/, message: "Số điện thoại không hợp lệ" },
            ]}
          >
            <Input
              placeholder="Để trống nếu chọn người liên hệ"
              onChange={(e) => checkPhoneNumber(e.target.value)}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label="Người liên hệ chính"
            name="primaryContactId"
            dependencies={["phone"]}
            rules={[
              ({ getFieldValue }) => ({
                required: !getFieldValue("phone"),
                message: "Phải chọn Người liên hệ chính hoặc nhập SĐT",
              }),
            ]}
          >
            <Select
              showSearch
              placeholder="Tìm theo Tên hoặc SĐT..."
              defaultActiveFirstOption={false}
              filterOption={false}
              onSearch={debouncedFetchCustomers}
              notFoundContent={searching ? <Spin size="small" /> : null}
              options={customerOptions}
              allowClear
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.primaryContactId !== currentValues.primaryContactId
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("primaryContactId") ? (
                <Form.Item
                  label="Mối quan hệ"
                  name="relationshipToPrimary"
                  rules={[{ required: true, message: "Nhập mối quan hệ" }]}
                >
                  <Input placeholder="Ví dụ: Con trai, Mẹ..." />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: "Nhập địa chỉ" }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Tỉnh/Thành phố"
            name="city"
            rules={[
              { required: true, message: "Vui lòng chọn Tỉnh/Thành phố" },
            ]}
          >
            <Select
              showSearch
              placeholder="Chọn Tỉnh/Thành phố"
              onChange={handleProvinceChange}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={provinces.map((p) => ({ label: p.name, value: p.name }))}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Quận/Huyện" name="district">
            <Select
              showSearch
              placeholder="Chọn Quận/Huyện"
              disabled={!selectedProvince} // Disable khi chưa chọn tỉnh thành
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={districts.map((d) => ({ label: d.name, value: d.name }))}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="Email" name="email">
            <Input />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="Nghề nghiệp" name="occupation">
            <Input />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="Chi nhánh" name="clinicId">
            <Select
              options={BRANCHES.map((b) => ({
                label: b.label,
                value: b.value,
              }))}
              allowClear
              disabled={true}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Dịch vụ quan tâm"
            name="servicesOfInterest"
            rules={[
              { required: true, message: "Vui lòng chọn dịch vụ quan tâm" },
            ]}
          >
            <Select
              allowClear
              placeholder="Nhập hoặc chọn dịch vụ"
              options={SERVICES_OF_INTEREST}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Nguồn khách hàng"
            name="source"
            rules={[
              { required: true, message: "Vui lòng chọn nguồn khách hàng" },
            ]}
          >
            <Select
              placeholder="Chọn nguồn khách hàng"
              onChange={handleSourceChange}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {CUSTOMER_SOURCES.map((source) => (
                <Select.Option
                  key={source.value}
                  value={source.value}
                  label={source.label}
                >
                  {source.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          {selectedSource && selectedSource.noteType !== "none" && (
            <Form.Item
              label="Ghi chú nguồn"
              name="sourceNotes"
              rules={[
                {
                  required: selectedSource.noteType === "text_input_required",
                  message: "Vui lòng nhập ghi chú",
                },
              ]}
            >
              {selectedSource.noteType === "employee_search" ? (
                <Select
                  showSearch
                  placeholder="Tìm và chọn nhân viên giới thiệu"
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
              ) : selectedSource.noteType === "customer_search" ? (
                <Select
                  showSearch
                  placeholder="Tìm khách hàng giới thiệu..."
                  onSearch={debouncedFetchCustomers}
                  filterOption={false}
                  options={customerOptions}
                  notFoundContent={searching ? <Spin size="small" /> : null}
                />
              ) : (
                <Input placeholder="Nhập ghi chú chi tiết..." />
              )}
            </Form.Item>
          )}
        </Col>
      </Row>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          style={{ marginTop: 12 }}
          block
        >
          Lưu
        </Button>
      </Form.Item>
    </Form>
  );
}
