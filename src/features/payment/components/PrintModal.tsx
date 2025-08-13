// src/features/payment/components/PrintModal.tsx
"use client";
import { useRef } from "react";
import { Modal, Button, Space, Typography, message } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import PrintableReceipt from "./PrintableReceipt";
import type { PaymentVoucherWithDetails } from "../type";
import { BRANCHES, getBranchByCode } from "@/constants";

const { Title } = Typography;

interface Props {
  open: boolean;
  voucher: PaymentVoucherWithDetails | null;
  onCancel: () => void;
}

export default function PrintModal({ open, voucher, onCancel }: Props) {
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
        margin: 10mm;
        size: A4;
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
              {(() => {
                const branch =
                  getBranchByCode(
                    voucher.clinicId ||
                      voucher.cashier?.clinicId ||
                      BRANCHES[0]?.value
                  ) || BRANCHES[0];
                const clinicInfo = {
                  name: branch.name,
                  address: branch.address,
                  phone: branch.phone,
                };
                return (
                  <PrintableReceipt
                    ref={printRef}
                    voucher={voucher}
                    clinicInfo={clinicInfo}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
