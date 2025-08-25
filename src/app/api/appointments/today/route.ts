// src/app/api/appointments/today/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

const VN_TZ = "Asia/Ho_Chi_Minh";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // YYYY-MM-DD format
    const clinicId = searchParams.get("clinicId");
    const doctorId = searchParams.get("doctorId"); // ✅ THÊM: Filter theo doctor

    if (!date) {
      return NextResponse.json(
        { error: "Thiếu tham số date" },
        { status: 400 }
      );
    }

    // Tạo start và end của ngày với timezone VN
    const startOfDay = dayjs(date).tz(VN_TZ).startOf("day").format();
    const endOfDay = dayjs(date).tz(VN_TZ).endOf("day").format();

    const whereCondition: any = {
      appointmentDateTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    // Filter theo clinicId nếu có
    if (clinicId) {
      whereCondition.clinicId = clinicId;
    }

    // ✅ THÊM: Filter theo doctor (primary hoặc secondary)
    if (doctorId) {
      whereCondition.OR = [
        { primaryDentistId: doctorId },
        { secondaryDentistId: doctorId },
      ];
    }

    const appointments = await prisma.appointment.findMany({
      where: whereCondition,
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
      orderBy: {
        appointmentDateTime: "asc",
      },
    });

    console.log(`📅 Found ${appointments.length} appointments for ${date}`);
    return NextResponse.json(appointments);
  } catch (error: any) {
    console.error("GET today appointments error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
