// src/app/api/appointments/[id]/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

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
    if (!existingAppointment.checkInTime) {
      return NextResponse.json(
        { error: "Khách hàng chưa check-in" },
        { status: 400 }
      );
    }

    // Kiểm tra đã check-out chưa
    if (existingAppointment.checkOutTime) {
      return NextResponse.json(
        { error: "Khách hàng đã check-out rồi" },
        { status: 400 }
      );
    }

    // Cập nhật check-out
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        checkOutTime: new Date(),
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
      `✅ Check-out successful for customer: ${existingAppointment.customer.fullName}`
    );
    return NextResponse.json(updatedAppointment);
  } catch (error: any) {
    console.error("Check-out error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
