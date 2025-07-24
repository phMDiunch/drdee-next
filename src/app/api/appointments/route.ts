// src/app/api/appointments/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { Prisma } from "@prisma/client";

// Lấy danh sách lịch hẹn (theo ngày, bác sĩ, clinic nếu muốn)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const clinicId = searchParams.get("clinicId");
  const doctorId = searchParams.get("doctorId");

  const where: any = {};
  if (from && to) {
    where.appointmentDateTime = {
      gte: new Date(from),
      lte: new Date(to),
    };
  }
  if (clinicId) where.clinicId = clinicId;
  if (doctorId) where.primaryDentistId = doctorId;

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      customer: true,
      primaryDentist: true,
      secondaryDentist: true,
    },
    orderBy: { appointmentDateTime: "asc" },
  });
  return NextResponse.json(appointments);
}

// Tạo mới lịch hẹn
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // Validate: check trường bắt buộc
    if (!data.customerId || !data.primaryDentistId || !data.appointmentDateTime) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc!" },
        { status: 400 }
      );
    }
    const created = await prisma.appointment.create({
      data,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return handlePrismaError(error);
  }
}

// Hàm dùng chung xử lý lỗi Prisma (bạn có thể copy từ customer)
function handlePrismaError(error: any) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const fields = Array.isArray(error.meta?.target)
      ? error.meta.target
      : [error.meta?.target || ""];
    const fieldLabel: Record<string, string> = {
      customerId: "Khách hàng",
      primaryDentistId: "Bác sĩ chính",
      appointmentDateTime: "Thời gian hẹn",
    };
    const msg =
      "Trùng dữ liệu: " +
      fields.map((f) => fieldLabel[f] || f).join(", ");
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ error: error.message }, { status: 500 });
}
