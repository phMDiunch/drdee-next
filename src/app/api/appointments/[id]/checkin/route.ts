// src/app/api/appointments/[id]/checkin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { CHECKIN_ALLOWED_STATUSES } from "@/features/appointments/constants";

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
      include: { customer: true },
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

    // Kiểm tra status có cho phép check-in không
    if (!CHECKIN_ALLOWED_STATUSES.includes(existingAppointment.status)) {
      return NextResponse.json(
        {
          error: `Không thể check-in với trạng thái "${existingAppointment.status}"`,
        },
        { status: 400 }
      );
    }

    // Cập nhật check-in
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        checkInTime: new Date(),
        status: "Đã đến", // ✅ Tự động đổi status
        updatedById,
        updatedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
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
  } catch (error: any) {
    console.error("Check-in error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
