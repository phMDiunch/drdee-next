// src/features/employees/components/form-sections/WorkInfoSection.tsx
import { Form, Select, Row, Col, Typography } from "antd";
import {
  EMPLOYMENT_STATUS_OPTIONS,
  DEPARTMENTS,
  DIVISIONS,
  POSITIONS,
  TITLES,
} from "../../constants";
import { BRANCHES } from "@/constants";
// "import type { Employee }" đã được xóa vì không dùng đến

const { Title } = Typography;
const { Option } = Select;

export default function WorkInfoSection() {
  return (
    <>
      <Title level={5}>Công việc</Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Trạng thái làm việc"
            name="employmentStatus"
            rules={[{ required: true, message: "Chọn trạng thái" }]}
          >
            <Select options={EMPLOYMENT_STATUS_OPTIONS} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Phòng ban" name="department">
            <Select placeholder="Chọn phòng ban">
              {DEPARTMENTS.map((d) => (
                <Option key={d.name} value={d.name}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Bộ phận" name="division">
            <Select placeholder="Chọn bộ phận" allowClear>
              {DIVISIONS.map((d) => (
                <Option key={d.name} value={d.name}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Chức vụ" name="position">
            <Select placeholder="Chọn chức vụ">
              {POSITIONS.map((pos) => (
                <Option key={pos} value={pos}>
                  {pos}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Chức danh"
            name="title"
            rules={[{ required: true, message: "Chọn chức danh!" }]}
          >
            {/* --- BẮT ĐẦU SỬA LỖI --- */}
            {/* Xử lý TITLES là một mảng chuỗi đơn giản */}
            <Select placeholder="Chọn chức danh">
              {TITLES.map((title) => (
                <Option key={title} value={title}>
                  {title}
                </Option>
              ))}
            </Select>
            {/* --- KẾT THÚC SỬA LỖI --- */}
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
    </>
  );
}
