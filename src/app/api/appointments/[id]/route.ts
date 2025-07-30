// src/app/api/appointments/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { customer: true, primaryDentist: true, secondaryDentist: true },
  });
  if (!appointment)
    return NextResponse.json(
      { error: "Không tìm thấy lịch hẹn" },
      { status: 404 }
    );
  return NextResponse.json(appointment);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();

    // Không cho sửa id
    delete data.id;

    // Validate tương tự như khi tạo
    if (
      !data.customerId ||
      !data.primaryDentistId ||
      !data.appointmentDateTime
    ) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc!" },
        { status: 400 }
      );
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return handlePrismaError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Kiểm tra appointment có tồn tại không
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Không tìm thấy lịch hẹn" },
        { status: 404 }
      );
    }

    // Xóa appointment
    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Lỗi khi xóa lịch hẹn:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Hàm dùng chung (copy như trên)
function handlePrismaError(error: any) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    // ...
    return NextResponse.json(
      { error: "Lịch hẹn bị trùng dữ liệu" },
      { status: 400 }
    );
  }
  return NextResponse.json({ error: error.message }, { status: 500 });
}
