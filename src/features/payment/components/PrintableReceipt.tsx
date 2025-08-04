// src/features/payment/components/PrintableReceipt.tsx
"use client";
import { forwardRef } from "react";
import { Table, Typography, Divider } from "antd";
import { formatCurrency, formatDateTimeVN } from "@/utils/date";
import type { PaymentVoucherWithDetails } from "../type";
import { getPaymentMethodConfig } from "../constants";

const { Title, Text } = Typography;

type PrintFormat = "A4" | "A5" | "thermal";

interface Props {
  voucher: PaymentVoucherWithDetails;
  format?: PrintFormat;
  clinicInfo?: {
    name: string;
    address: string;
    phone: string;
    logo?: string;
  };
}

const PrintableReceipt = forwardRef<HTMLDivElement, Props>(
  ({ voucher, format = "A4", clinicInfo }, ref) => {
    const getFormatStyles = () => {
      switch (format) {
        case "A4":
          return {
            width: "210mm",
            minHeight: "297mm",
            padding: "20mm",
            fontSize: "14px",
          };
        case "A5":
          return {
            width: "148mm",
            minHeight: "210mm",
            padding: "15mm",
            fontSize: "12px",
          };
        case "thermal":
          return {
            width: "80mm",
            padding: "5mm",
            fontSize: "11px",
            fontFamily: "monospace",
          };
        default:
          return {};
      }
    };

    const formatStyles = getFormatStyles();
    const isThermal = format === "thermal";

    return (
      <div
        ref={ref}
        style={{
          ...formatStyles,
          backgroundColor: "white",
          margin: "0 auto",
          border: isThermal ? "none" : "1px solid #ccc",
        }}
        className="printable-receipt"
      >
        {/* Header - Clinic Info */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          {clinicInfo?.logo && !isThermal && (
            <img
              src={clinicInfo.logo}
              alt="Logo"
              style={{ height: "60px", marginBottom: "10px" }}
            />
          )}
          <Title
            level={isThermal ? 5 : 3}
            style={{ margin: 0, color: "#1890ff" }}
          >
            {clinicInfo?.name || "PHÒNG KHÁM NHA KHOA"}
          </Title>
          {clinicInfo?.address && (
            <Text type="secondary">
              {clinicInfo.address}
              <br />
              {clinicInfo.phone && `ĐT: ${clinicInfo.phone}`}
            </Text>
          )}
        </div>

        <Divider style={{ margin: "15px 0" }} />

        {/* Receipt Title */}
        <Title
          level={isThermal ? 4 : 2}
          style={{ textAlign: "center", margin: "15px 0", color: "#e74c3c" }}
        >
          PHIẾU THU TIỀN
        </Title>

        {/* Receipt Info */}
        <div style={{ marginBottom: "20px" }}>
          <Text strong>Số phiếu: </Text>
          <Text
            style={{ color: "#1890ff", fontSize: "16px", fontWeight: "bold" }}
          >
            {voucher.paymentNumber}
          </Text>
          <br />
          <Text strong>Ngày thu: </Text>
          <Text>{formatDateTimeVN(voucher.paymentDate)}</Text>
        </div>

        {/* Customer Info */}
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px",
          }}
        >
          <Text strong style={{ fontSize: "16px" }}>
            Thông tin khách hàng:
          </Text>
          <br />
          <Text strong>Họ tên: </Text>
          <Text>{voucher.customer?.fullName}</Text>
          <br />
          {voucher.customer?.customerCode && (
            <>
              <Text strong>Mã KH: </Text>
              <Text>{voucher.customer.customerCode}</Text>
              <br />
            </>
          )}
          {voucher.customer?.phone && (
            <>
              <Text strong>SĐT: </Text>
              <Text>{voucher.customer.phone}</Text>
            </>
          )}
        </div>

        {/* Services Table */}
        <div style={{ marginBottom: "20px" }}>
          <Title level={5} style={{ marginBottom: "10px" }}>
            DỊCH VỤ ĐÃ THANH TOÁN:
          </Title>

          {!isThermal ? (
            <Table
              dataSource={voucher.details || []}
              pagination={false}
              size="small"
              bordered
              rowKey="id"
              columns={[
                {
                  title: "Dịch vụ",
                  dataIndex: ["consultedService"],
                  render: (service: {
                    consultedServiceName?: string;
                    dentalService?: { name: string };
                  }) =>
                    service?.consultedServiceName ||
                    service?.dentalService?.name ||
                    "Không xác định",
                },
                {
                  title: "Số tiền",
                  dataIndex: "amount",
                  render: (amount: number) => formatCurrency(amount),
                  align: "right" as const,
                },
                {
                  title: "Phương thức",
                  dataIndex: "paymentMethod",
                  render: (method: string) => {
                    const config = getPaymentMethodConfig(method);
                    return `${config.icon} ${config.label}`;
                  },
                },
              ]}
            />
          ) : (
            // Thermal format - Simple list
            <div>
              {voucher.details?.map((detail, index) => (
                <div
                  key={detail.id}
                  style={{
                    marginBottom: "8px",
                    borderBottom: "1px dashed #ccc",
                    paddingBottom: "8px",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text strong>
                      {index + 1}.{" "}
                      {detail.consultedService?.consultedServiceName}
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "10px",
                    }}
                  >
                    <Text type="secondary">
                      {getPaymentMethodConfig(detail.paymentMethod).label}
                    </Text>
                    <Text strong>{formatCurrency(detail.amount)}</Text>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total */}
        <div
          style={{
            padding: "15px",
            backgroundColor: "#e8f5e8",
            borderRadius: "4px",
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          <Title level={3} style={{ margin: 0, color: "#27ae60" }}>
            TỔNG CỘNG: {formatCurrency(voucher.totalAmount)}
          </Title>
        </div>

        {/* Notes */}
        {voucher.notes && (
          <div style={{ marginBottom: "20px" }}>
            <Text strong>Ghi chú: </Text>
            <Text italic>{voucher.notes}</Text>
          </div>
        )}

        {/* Signatures */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "40px",
            pageBreakInside: "avoid",
          }}
        >
          <div style={{ textAlign: "center", width: "45%" }}>
            <Text strong>NGƯỜI BÁN</Text>
            <div style={{ height: "60px" }}></div>
            <div style={{ borderTop: "1px solid #000", paddingTop: "5px" }}>
              <Text>{voucher.cashier?.fullName}</Text>
            </div>
          </div>

          <div style={{ textAlign: "center", width: "45%" }}>
            <Text strong>NGƯỜI MUA</Text>
            <div style={{ height: "60px" }}></div>
            <div style={{ borderTop: "1px solid #000", paddingTop: "5px" }}>
              <Text>{voucher.customer?.fullName}</Text>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{ textAlign: "center", marginTop: "30px", fontSize: "12px" }}
        >
          <Text type="secondary">
            Cảm ơn quý khách đã sử dụng dịch vụ!
            <br />
            Hẹn gặp lại quý khách lần sau.
          </Text>
        </div>
      </div>
    );
  }
);

PrintableReceipt.displayName = "PrintableReceipt";

export default PrintableReceipt;
