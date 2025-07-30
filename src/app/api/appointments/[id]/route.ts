// src/app/api/appointments/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Đổi thành Promise
) {
  try {
    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: true,
        primaryDentist: true,
        secondaryDentist: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Không tìm thấy lịch hẹn" },
        { status: 404 }
      );
    }

    console.log("📋 Fresh appointment data:", appointment);
    return NextResponse.json(appointment);
  } catch (error: any) {
    console.error("GET appointment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Đổi thành Promise
) {
  try {
    const { id } = await params; // Thêm await
    const data = await request.json();

    console.log("📝 PUT request data:", data);
    console.log("🆔 Appointment ID:", id);

    // Không cho sửa id
    if (data.id) {
      delete data.id;
    }

    // Validation cơ bản
    if (!id) {
      return NextResponse.json({ error: "Thiếu ID lịch hẹn" }, { status: 400 });
    }

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

    // Cập nhật appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        customer: true,
        primaryDentist: true,
        secondaryDentist: true,
      },
    });

    console.log("✅ Updated appointment:", updatedAppointment);

    return NextResponse.json(updatedAppointment);
  } catch (error: any) {
    console.error("❌ PUT appointment error:", error);
    return handlePrismaError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Đổi thành Promise
) {
  try {
    const { id } = await params; // Thêm await

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
    console.error("❌ DELETE appointment error:", error);
    return handlePrismaError(error);
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
