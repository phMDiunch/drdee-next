// src/app/api/customers/[id]/checkin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { nowVN, formatDateTimeVN } from "@/utils/date";

dayjs.extend(utc);
dayjs.extend(timezone);

const VN_TZ = "Asia/Ho_Chi_Minh";

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
    const startOfDay = today.tz(VN_TZ).startOf("day").format();
    const endOfDay = today.tz(VN_TZ).endOf("day").format();

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

      const now = nowVN();
      appointment = await prisma.appointment.update({
        where: { id: existingAppointment.id },
        data: {
          checkInTime: now,
          status: "Đã đến", // ✅ Chuyển thành "Đã đến"
          // ✅ NEW: Chỉ update notes nếu appointment chưa có notes
          ...(existingAppointment.notes
            ? {} // Giữ nguyên notes cũ
            : {
                notes:
                  notes ||
                  `Check-in lúc ${formatDateTimeVN(
                    new Date(),
                    "HH:mm DD/MM/YYYY"
                  )}`,
              }),
          updatedById,
          updatedAt: now,
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

      const now = nowVN();

      appointment = await prisma.appointment.create({
        data: {
          customerId: id,
          appointmentDateTime: now, // ✅ Thời gian hiện tại
          duration: 30, // ✅ Mặc định 30 phút
          notes:
            notes ||
            `Lịch phát sinh - Check-in lúc ${formatDateTimeVN(
              new Date(),
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
  } catch (error: unknown) {
    console.error("Customer check-in error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
