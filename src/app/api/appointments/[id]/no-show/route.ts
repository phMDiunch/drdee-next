// src/app/api/appointments/[id]/no-show/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { STATUS_TRANSITIONS } from "@/features/appointments/constants";
import dayjs from "dayjs";

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
      include: { customer: { select: { fullName: true } } },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Không tìm thấy lịch hẹn" },
        { status: 404 }
      );
    }

    // ✅ VALIDATION: Chỉ cho phép đánh dấu "Không đến" sau appointment time
    const appointmentTime = dayjs(existingAppointment.appointmentDateTime);
    const now = dayjs();

    if (appointmentTime.isAfter(now)) {
      return NextResponse.json(
        {
          error: "Chỉ có thể đánh dấu 'Không đến' sau thời gian hẹn",
        },
        { status: 400 }
      );
    }

    // ✅ VALIDATION: Kiểm tra đã check-in chưa
    if (existingAppointment.checkInTime) {
      return NextResponse.json(
        {
          error: "Không thể đánh dấu 'Không đến' khi khách hàng đã check-in",
        },
        { status: 400 }
      );
    }

    // ✅ VALIDATION: Kiểm tra status transition có hợp lệ không
    const currentStatus = existingAppointment.status;
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus];

    if (!allowedTransitions?.includes("Không đến")) {
      return NextResponse.json(
        {
          error: `Không thể đánh dấu 'Không đến' từ trạng thái "${currentStatus}"`,
        },
        { status: 400 }
      );
    }

    // Cập nhật status thành "Không đến"
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: "Không đến",
        updatedById,
        updatedAt: new Date(),
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
      `✅ Marked no-show for customer: ${existingAppointment.customer.fullName}`
    );

    return NextResponse.json({
      ...updatedAppointment,
      message: `Đã đánh dấu không đến cho ${existingAppointment.customer.fullName}`,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("No-show appointment error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
