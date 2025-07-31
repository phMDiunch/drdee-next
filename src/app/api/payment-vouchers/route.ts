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
      // Tạo phiếu thu chính
      const voucher = await tx.paymentVoucher.create({
        data: {
          ...voucherData,
          paymentNumber: `PT${Date.now()}`, // Auto generate
          paymentDate: new Date(), // ✅ THÊM paymentDate
        },
      });

      // ✅ SỬA: Tạo chi tiết phiếu thu với createdById
      const voucherDetails = await Promise.all(
        details.map((detail: any) =>
          tx.paymentVoucherDetail.create({
            data: {
              consultedServiceId: detail.consultedServiceId,
              amount: detail.amount,
              paymentMethod: detail.paymentMethod,
              paymentVoucherId: voucher.id, // ✅ Chỉ cần ID
              createdById: voucherData.createdById, // ✅ THÊM createdById
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

      // ✅ RETURN với includes để có data đầy đủ
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
    console.error("Payment voucher creation error:", error); // ✅ DEBUG
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
