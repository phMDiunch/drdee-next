// src/app/api/payment-vouchers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      // Lấy thông tin phiếu thu và details
      const voucher = await tx.paymentVoucher.findUnique({
        where: { id },
        include: { details: true },
      });

      if (!voucher) {
        throw new Error("Không tìm thấy phiếu thu");
      }

      // Hoàn lại tiền đã trả cho các ConsultedService
      await Promise.all(
        voucher.details.map((detail: any) =>
          tx.consultedService.update({
            where: { id: detail.consultedServiceId },
            data: {
              amountPaid: {
                decrement: detail.amount, // ✅ Trừ lại tiền đã trả
              },
            },
          })
        )
      );

      // Xóa details trước
      await tx.paymentVoucherDetail.deleteMany({
        where: { paymentVoucherId: id },
      });

      // Xóa voucher
      await tx.paymentVoucher.delete({
        where: { id },
      });

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { details, ...voucherData } = data;

    const result = await prisma.$transaction(async (tx) => {
      // Lấy voucher cũ
      const oldVoucher = await tx.paymentVoucher.findUnique({
        where: { id },
        include: { details: true },
      });

      if (!oldVoucher) {
        throw new Error("Không tìm thấy phiếu thu");
      }

      // Hoàn lại tiền cũ
      await Promise.all(
        oldVoucher.details.map((detail: any) =>
          tx.consultedService.update({
            where: { id: detail.consultedServiceId },
            data: {
              amountPaid: {
                decrement: detail.amount,
              },
            },
          })
        )
      );

      // Xóa details cũ
      await tx.paymentVoucherDetail.deleteMany({
        where: { paymentVoucherId: id },
      });

      // Cập nhật voucher
      const updatedVoucher = await tx.paymentVoucher.update({
        where: { id },
        data: {
          ...voucherData,
          updatedAt: new Date(),
        },
      });

      // Tạo details mới
      await Promise.all(
        details.map((detail: any) =>
          tx.paymentVoucherDetail.create({
            data: {
              ...detail,
              paymentVoucherId: id,
              createdById: voucherData.updatedById,
            },
          })
        )
      );

      // Cập nhật tiền mới
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

      return updatedVoucher;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
