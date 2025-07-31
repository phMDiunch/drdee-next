// src/app/api/payment-vouchers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    const vouchers = await prisma.paymentVoucher.findMany({
      where: customerId ? { customerId } : {},
      include: {
        customer: { select: { id: true, fullName: true, customerCode: true } },
        cashier: { select: { id: true, fullName: true } },
        details: {
          include: {
            consultedService: {
              include: {
                dentalService: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(vouchers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { details, ...voucherData } = data;

    const result = await prisma.$transaction(async (tx) => {
      // ✅ LOGIC TẠO SỐ PHIẾU THU GIỐNG MÃ KHÁCH HÀNG
      const now = new Date();
      const year = now.getFullYear() % 100; // 2 số cuối năm (25)
      const month = String(now.getMonth() + 1).padStart(2, "0"); // Tháng (07)

      // Map clinicId to prefix
      const prefixMap: Record<string, string> = {
        "450MK": "MK",
        "143TDT": "TDT",
        "153DN": "DN",
      };

      const prefix = prefixMap[voucherData.clinicId] || "XX";

      // Đếm số phiếu thu trong tháng của chi nhánh
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const count = await tx.paymentVoucher.count({
        where: {
          // ✅ Lọc theo chi nhánh thông qua customer
          customer: {
            clinicId: voucherData.clinicId,
          },
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      // Format: MK-2507-0001
      const paymentNumber = `${prefix}-${year}${month}-${String(
        count + 1
      ).padStart(4, "0")}`;

      // Tạo phiếu thu chính
      const voucher = await tx.paymentVoucher.create({
        data: {
          ...voucherData,
          paymentNumber, // ✅ Sử dụng số phiếu thu đã tạo
          paymentDate: new Date(),
        },
      });

      // Tạo chi tiết phiếu thu
      const voucherDetails = await Promise.all(
        details.map((detail: any) =>
          tx.paymentVoucherDetail.create({
            data: {
              consultedServiceId: detail.consultedServiceId,
              amount: detail.amount,
              paymentMethod: detail.paymentMethod,
              paymentVoucherId: voucher.id,
              createdById: voucherData.createdById,
            },
          })
        )
      );

      // Cập nhật amountPaid cho từng ConsultedService
      await Promise.all(
        details.map((detail: any) =>
          tx.consultedService.update({
            where: { id: detail.consultedServiceId },
            data: {
              amountPaid: {
                increment: detail.amount,
              },
            },
          })
        )
      );

      // Return với includes để có data đầy đủ
      return await tx.paymentVoucher.findUnique({
        where: { id: voucher.id },
        include: {
          customer: {
            select: { id: true, fullName: true, customerCode: true },
          },
          cashier: { select: { id: true, fullName: true } },
          details: {
            include: {
              consultedService: {
                include: {
                  dentalService: { select: { name: true } },
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Payment voucher creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
