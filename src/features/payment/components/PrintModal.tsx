// src/features/payment/components/PrintModal.tsx
"use client";
import { useState, useRef } from "react";
import { Modal, Radio, Button, Space, Typography, message } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import PrintableReceipt from "./PrintableReceipt";
import type { PaymentVoucherWithDetails } from "../type";

const { Title } = Typography;

type PrintFormat = "A4" | "A5" | "thermal";

interface Props {
  open: boolean;
  voucher: PaymentVoucherWithDetails | null;
  onCancel: () => void;
}

const CLINIC_INFO = {
  name: "PHÒNG KHÁM NHA KHOA ABC",
  address: "123 Đường ABC, Quận 1, TP.HCM",
  phone: "028.1234.5678",
  // logo: "/images/clinic-logo.png" // Optional
};

const PRINT_FORMATS = [
  {
    value: "A4" as const,
    label: "A4 - Tiêu chuẩn",
    description: "Phù hợp cho văn phòng, lưu trữ",
  },
  {
    value: "A5" as const,
    label: "A5 - Compact",
    description: "Tiết kiệm giấy, dễ cầm nắm",
  },
  {
    value: "thermal" as const,
    label: "Nhiệt - 80mm",
    description: "Máy in nhiệt, nhanh chóng",
  },
];

export default function PrintModal({ open, voucher, onCancel }: Props) {
  const [selectedFormat, setSelectedFormat] = useState<PrintFormat>("A4");
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      message.error("Không thể mở cửa sổ in. Vui lòng kiểm tra popup blocker.");
      return;
    }

    const printContent = printRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Phiếu Thu - ${voucher?.paymentNumber}</title>
          <meta charset="utf-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Times New Roman', serif;
              line-height: 1.4;
              color: #000;
            }
            
            .printable-receipt {
              margin: 0 auto;
            }
            
            /* Print styles */
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              @page {
                margin: ${selectedFormat === "thermal" ? "0" : "10mm"};
                size: ${
                  selectedFormat === "A4"
                    ? "A4"
                    : selectedFormat === "A5"
                    ? "A5"
                    : "80mm auto"
                };
              }
              
              .no-print {
                display: none !important;
              }
            }
            
            /* Ant Design override */
            .ant-table {
              font-size: inherit;
            }
            
            .ant-table-thead > tr > th {
              background: #f5f5f5 !important;
              font-weight: bold;
              padding: 8px !important;
            }
            
            .ant-table-tbody > tr > td {
              padding: 8px !important;
              border-bottom: 1px solid #e8e8e8;
            }
            
            .ant-divider {
              border-top: 1px solid #d9d9d9;
              margin: 15px 0;
            }
            
            .ant-typography {
              margin-bottom: 0;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  const handlePreviewPrint = () => {
    // Show preview in new tab instead of printing
    if (!printRef.current) return;

    const previewWindow = window.open("", "_blank");
    if (!previewWindow) return;

    const printContent = printRef.current.innerHTML;
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Preview - ${voucher?.paymentNumber}</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: 'Times New Roman', serif; 
              padding: 20px;
              background: #f5f5f5;
            }
            .printable-receipt {
              background: white;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    previewWindow.document.close();
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          <PrinterOutlined /> In phiếu thu - {voucher?.paymentNumber}
        </Title>
      }
      open={open}
      onCancel={onCancel}
      width={800}
      footer={
        <Space>
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="default" onClick={handlePreviewPrint}>
            Xem trước
          </Button>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
          >
            In ngay
          </Button>
        </Space>
      }
    >
      {voucher && (
        <div>
          {/* Format Selection */}
          <div style={{ marginBottom: 20 }}>
            <Title level={5}>Chọn khổ giấy:</Title>
            <Radio.Group
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              style={{ width: "100%" }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {PRINT_FORMATS.map((format) => (
                  <Radio key={format.value} value={format.value}>
                    <div>
                      <div style={{ fontWeight: "bold" }}>{format.label}</div>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        {format.description}
                      </div>
                    </div>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </div>

          {/* Print Preview */}
          <div
            style={{
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              padding: "16px",
              backgroundColor: "#fafafa",
              maxHeight: "500px",
              overflow: "auto",
            }}
          >
            <Title level={5} style={{ marginBottom: 16 }}>
              Xem trước:
            </Title>

            <div
              style={{
                transform: "scale(0.6)",
                transformOrigin: "top left",
                border: "1px solid #ccc",
                backgroundColor: "white",
              }}
            >
              <PrintableReceipt
                ref={printRef}
                voucher={voucher}
                format={selectedFormat}
                clinicInfo={CLINIC_INFO}
              />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
