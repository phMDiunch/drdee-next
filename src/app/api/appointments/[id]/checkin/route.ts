// src/app/api/appointments/[id]/checkin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { CHECKIN_ALLOWED_STATUSES } from "@/features/appointments/constants";
import { nowVN } from "@/utils/date";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { updatedById } = await request.json();

    // Kiểm tra appointment có tồn tại không
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            customerCode: true,
            fullName: true,
            phone: true,
            email: true,
            address: true,
          },
        },
      },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Không tìm thấy lịch hẹn" },
        { status: 404 }
      );
    }

    // Kiểm tra đã check-in chưa
    if (existingAppointment.checkInTime) {
      return NextResponse.json(
        { error: "Khách hàng đã check-in rồi" },
        { status: 400 }
      );
    }

    // ✅ VALIDATION: Kiểm tra status có cho phép check-in không (CHỈ ĐÃ XÁC NHẬN)
    if (!CHECKIN_ALLOWED_STATUSES.includes(existingAppointment.status)) {
      return NextResponse.json(
        {
          error: `Không thể check-in với trạng thái "${existingAppointment.status}". Vui lòng xác nhận lịch hẹn trước khi check-in.`,
        },
        { status: 400 }
      );
    }

    // Cập nhật check-in
    const now = nowVN();
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        checkInTime: now,
        status: "Đã đến", // ✅ Tự động đổi status
        updatedById,
        updatedAt: nowVN(),
      },
      include: {
        customer: {
          select: {
            id: true,
            customerCode: true,
            fullName: true,
            phone: true,
            email: true,
            address: true,
          },
        },
        primaryDentist: {
          select: {
            id: true,
            fullName: true,
          },
        },
        secondaryDentist: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    console.log(
      `✅ Check-in successful for customer: ${existingAppointment.customer.fullName}`
    );
    return NextResponse.json(updatedAppointment);
  } catch (error: unknown) {
    console.error("Check-in error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
