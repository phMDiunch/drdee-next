import { Form, Input, DatePicker, Select, Row, Col, Button } from "antd";
import type { Customer } from "../type";
import { BRANCHES, GENDER_OPTIONS } from "@/constants";
import { useEmployeeProfile } from "@/features/auth/hooks/useAuth";

const { Option } = Select;

type Props = {
  form?: any;
  initialValues?: Partial<Customer>;
  onFinish: (values: Partial<Customer>) => void;
  loading?: boolean;
  mode?: "add" | "edit";
};

export default function CustomerForm({
  form,
  initialValues = {},
  onFinish,
  loading = false,
  mode = "add",
}: Props) {
  const { employee } = useEmployeeProfile();

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
        {/* Họ tên */}
        <Col span={12}>
          <Form.Item
            label="Họ tên"
            name="fullName"
            rules={[{ required: true, message: "Nhập họ tên" }]}
          >
            <Input />
          </Form.Item>
        </Col>
        {/* Số điện thoại */}
        <Col span={12}>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Nhập số điện thoại" },
              { pattern: /^0\d{9}$/, message: "Số điện thoại không hợp lệ" },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        {/* Email */}
        <Col span={12}>
          <Form.Item label="Email" name="email">
            <Input />
          </Form.Item>
        </Col>
        {/* Ngày sinh */}
        <Col span={12}>
          <Form.Item label="Ngày sinh" name="dob">
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              allowClear
            />
          </Form.Item>
        </Col>
        {/* Giới tính */}
        <Col span={12}>
          <Form.Item label="Giới tính" name="gender">
            <Select options={GENDER_OPTIONS} allowClear />
          </Form.Item>
        </Col>
        {/* Chi nhánh */}
        <Col span={12}>
          <Form.Item label="Chi nhánh" name="clinicId">
            <Select
              options={BRANCHES.map((b) => ({
                label: b.label,
                value: b.value,
              }))}
              allowClear
              disabled={true} // Chỉ lấy theo current employee
            />
          </Form.Item>
        </Col>
        {/* Địa chỉ */}
        <Col span={12}>
          <Form.Item label="Địa chỉ" name="address">
            <Input />
          </Form.Item>
        </Col>
        {/* Tỉnh/TP */}
        <Col span={12}>
          <Form.Item label="Tỉnh/Thành phố" name="city">
            <Input />
          </Form.Item>
        </Col>
        {/* Quận/Huyện */}
        <Col span={12}>
          <Form.Item label="Quận/Huyện" name="district">
            <Input />
          </Form.Item>
        </Col>
        {/* Người giám hộ */}
        <Col span={12}>
          <Form.Item label="Người giám hộ" name="guardianName">
            <Input />
          </Form.Item>
        </Col>
        {/* Nghề nghiệp */}
        <Col span={12}>
          <Form.Item label="Nghề nghiệp" name="occupation">
            <Input />
          </Form.Item>
        </Col>
        {/* Nguồn khách */}
        <Col span={12}>
          <Form.Item label="Nguồn khách" name="source">
            <Input />
          </Form.Item>
        </Col>
        {/* Ghi chú nguồn */}
        <Col span={12}>
          <Form.Item label="Ghi chú nguồn" name="sourceNotes">
            <Input />
          </Form.Item>
        </Col>
        {/* Dịch vụ quan tâm */}
        <Col span={24}>
          <Form.Item label="Dịch vụ quan tâm" name="servicesOfInterest">
            <Select
              mode="tags"
              allowClear
              placeholder="Nhập hoặc chọn dịch vụ"
            />
          </Form.Item>
        </Col>
      </Row>
      {/* Mã KH, Keywords: readonly (chỉ show khi edit) */}
      {mode === "edit" && (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Mã KH" name="customerCode">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Từ khóa tìm kiếm" name="searchKeywords">
                <Select mode="tags" disabled />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}
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
