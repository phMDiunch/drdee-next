// src/app/api/appointments/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { Prisma } from "@prisma/client";

// Lấy danh sách lịch hẹn (theo ngày, bác sĩ, clinic nếu muốn)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Params cho Calendar View
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Params cho Table View
    const page = Number(searchParams.get("page") || "1");
    const pageSize = Number(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search")?.trim() || "";
    const clinicId = searchParams.get("clinicId");

    const where: Prisma.AppointmentWhereInput = {};

    if (clinicId) {
      where.clinicId = clinicId;
    }

    // Logic cho Calendar View (lọc theo ngày)
    if (from && to) {
      where.appointmentDateTime = {
        gte: new Date(from),
        lte: new Date(to),
      };
    }

    // Logic cho Table View (tìm kiếm)
    if (search) {
      where.OR = [
        { customer: { fullName: { contains: search, mode: "insensitive" } } },
        {
          primaryDentist: {
            fullName: { contains: search, mode: "insensitive" },
          },
        },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    // Nếu là chế độ xem bảng (không có from/to), ta thực hiện phân trang
    if (!from && !to) {
      const [appointments, total] = await prisma.$transaction([
        prisma.appointment.findMany({
          where,
          include: {
            customer: true,
            primaryDentist: true,
            secondaryDentist: true,
          },
          orderBy: { appointmentDateTime: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.appointment.count({ where }),
      ]);
      return NextResponse.json({ appointments, total });
    }

    // Mặc định, nếu là chế độ xem lịch, trả về toàn bộ kết quả trong khoảng thời gian đó
    const appointments = await prisma.appointment.findMany({
      where,
      include: { customer: true, primaryDentist: true, secondaryDentist: true },
      orderBy: { appointmentDateTime: "asc" },
    });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Lỗi lấy danh sách lịch hẹn" },
      { status: 500 }
    );
  }
}

// Tạo mới lịch hẹn
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // Validate: check trường bắt buộc
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
      "Trùng dữ liệu: " + fields.map((f) => fieldLabel[f] || f).join(", ");
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ error: error.message }, { status: 500 });
}
