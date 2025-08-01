// src/app/api/customers/[id]/checkin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import dayjs from "dayjs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { primaryDentistId, notes, updatedById } = await request.json();

    // Kiểm tra customer có tồn tại không
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: { id: true, fullName: true, clinicId: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Không tìm thấy khách hàng" },
        { status: 404 }
      );
    }

    // Kiểm tra đã có lịch hẹn hôm nay chưa
    const today = dayjs();
    const startOfDay = today.startOf("day").toDate();
    const endOfDay = today.endOf("day").toDate();

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        customerId: id,
        appointmentDateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        customer: { select: { fullName: true } },
        primaryDentist: { select: { fullName: true } },
      },
    });

    let appointment;

    if (existingAppointment) {
      // ✅ CÓ LỊCH HẸN → UPDATE CHECK-IN

      // Kiểm tra đã check-in chưa
      if (existingAppointment.checkInTime) {
        return NextResponse.json(
          { error: "Khách hàng đã check-in rồi" },
          { status: 400 }
        );
      }

      // Kiểm tra status có cho phép check-in không
      const allowedStatuses = ["Chờ xác nhận", "Đã xác nhận", "Không đến"];
      if (!allowedStatuses.includes(existingAppointment.status)) {
        return NextResponse.json(
          {
            error: `Không thể check-in với trạng thái "${existingAppointment.status}"`,
          },
          { status: 400 }
        );
      }

      appointment = await prisma.appointment.update({
        where: { id: existingAppointment.id },
        data: {
          checkInTime: new Date(),
          status: "Đã đến", // ✅ Chuyển thành "Đã đến"
          updatedById,
          updatedAt: new Date(),
        },
        include: {
          customer: { select: { id: true, fullName: true, phone: true } },
          primaryDentist: { select: { id: true, fullName: true } },
          secondaryDentist: { select: { id: true, fullName: true } },
        },
      });
    } else {
      // ❌ CHƯA CÓ LỊCH → TẠO MỚI + CHECK-IN

      if (!primaryDentistId) {
        return NextResponse.json(
          { error: "Vui lòng chọn bác sĩ chính" },
          { status: 400 }
        );
      }

      const now = new Date();

      appointment = await prisma.appointment.create({
        data: {
          customerId: id,
          appointmentDateTime: now, // ✅ Thời gian hiện tại
          duration: 30, // ✅ Mặc định 30 phút
          notes:
            notes ||
            `Lịch phát sinh - Check-in lúc ${dayjs().format(
              "HH:mm DD/MM/YYYY"
            )}`,
          primaryDentistId,
          clinicId: customer.clinicId || "", // Lấy từ customer
          status: "Đến đột xuất", // ✅ Status cho walk-in
          checkInTime: now, // ✅ Check-in ngay
          createdById: updatedById,
          updatedById: updatedById,
        },
        include: {
          customer: { select: { id: true, fullName: true, phone: true } },
          primaryDentist: { select: { id: true, fullName: true } },
          secondaryDentist: { select: { id: true, fullName: true } },
        },
      });
    }

    console.log(`✅ Check-in successful for: ${customer.fullName}`);
    return NextResponse.json({
      success: true,
      appointment,
      message: existingAppointment
        ? "Check-in thành công!"
        : "Tạo lịch mới và check-in thành công!",
    });
  } catch (error: any) {
    console.error("Customer check-in error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
