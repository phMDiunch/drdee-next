import {
  Form,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  Typography,
  Divider,
  Button,
} from "antd";
import { ROLE_OPTIONS, EMPLOYMENT_STATUS_OPTIONS } from "../constants";
import { GENDER_OPTIONS, BRANCHES } from "@/constants";

const { Title } = Typography;

export default function EmployeeForm({
  form,
  initialValues = {},
  onFinish,
  loading = false,
}: any) {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onFinish}
      autoComplete="off"
    >
      {/* Thông tin tài khoản */}
      <Title level={5} style={{ marginTop: 0 }}>
        Thông tin tài khoản
      </Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, type: "email", message: "Email là bắt buộc" },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: "Chọn vai trò" }]}
            // initialValue="employee"
          >
            <Select options={ROLE_OPTIONS} />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      {/* Thông tin cơ bản */}
      <Title level={5}>Thông tin cơ bản</Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Mã nhân viên" name="employeeCode">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Họ tên"
            name="fullName"
            rules={[{ required: true, message: "Họ tên là bắt buộc" }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Ngày sinh" name="dob">
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Giới tính" name="gender">
            <Select options={GENDER_OPTIONS} allowClear />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Ảnh đại diện (URL)" name="avatarUrl">
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      {/* Thông tin liên hệ */}
      <Title level={5}>Thông tin liên hệ</Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Số điện thoại là bắt buộc" },
              { pattern: /^0\d{9,10}$/, message: "Số điện thoại không hợp lệ" },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Địa chỉ hiện tại" name="currentAddress">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Quê quán" name="hometown">
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      {/* Thông tin pháp lý & BH */}
      <Title level={5}>Pháp lý & Bảo hiểm</Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="CCCD" name="nationalId">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Ngày cấp CCCD" name="nationalIdIssueDate">
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Nơi cấp CCCD" name="nationalIdIssuePlace">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Mã số thuế" name="taxId">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Số BHXH" name="insuranceNumber">
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      {/* Thông tin ngân hàng */}
      <Title level={5}>Ngân hàng</Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Số tài khoản" name="bankAccountNumber">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Tên ngân hàng" name="bankName">
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      {/* Thông tin công việc */}
      <Title level={5}>Công việc</Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Trạng thái làm việc"
            name="employmentStatus"
            rules={[{ required: true, message: "Chọn trạng thái" }]}
            // initialValue="Thử việc"
          >
            <Select options={EMPLOYMENT_STATUS_OPTIONS} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Phòng ban" name="department">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Chức vụ" name="position">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Chi nhánh" name="clinicId">
            <Select
              options={BRANCHES.map((b) => ({
                label: b.label,
                value: b.value,
              }))}
              allowClear
            />
          </Form.Item>
        </Col>
      </Row>

      <Button
        type="primary"
        htmlType="submit"
        loading={loading}
        style={{ marginTop: 12 }}
        block
      >
        Lưu
      </Button>
    </Form>
  );
}
