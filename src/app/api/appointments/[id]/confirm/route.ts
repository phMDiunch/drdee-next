// src/app/api/appointments/[id]/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { nowVN } from "@/utils/date";
import { STATUS_TRANSITIONS } from "@/features/appointments/constants";

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

    // ✅ VALIDATION: Kiểm tra status transition có hợp lệ không
    const currentStatus = existingAppointment.status;
    const allowedTransitions =
      STATUS_TRANSITIONS[currentStatus as keyof typeof STATUS_TRANSITIONS];

    if (!allowedTransitions?.includes("Đã xác nhận")) {
      return NextResponse.json(
        {
          error: `Không thể xác nhận lịch hẹn có trạng thái "${currentStatus}"`,
        },
        { status: 400 }
      );
    }

    // Cập nhật status thành "Đã xác nhận"
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: "Đã xác nhận",
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
      `✅ Confirmed appointment for customer: ${existingAppointment.customer.fullName}`
    );

    return NextResponse.json({
      ...updatedAppointment,
      message: `Đã xác nhận lịch hẹn cho ${existingAppointment.customer.fullName}`,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Confirm appointment error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
