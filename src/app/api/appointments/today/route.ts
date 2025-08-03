// src/app/api/appointments/today/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // YYYY-MM-DD format
    const clinicId = searchParams.get("clinicId");

    if (!date) {
      return NextResponse.json(
        { error: "Thiếu tham số date" },
        { status: 400 }
      );
    }

    // Tạo start và end của ngày
    const startOfDay = dayjs(date).startOf("day").toISOString();
    const endOfDay = dayjs(date).endOf("day").toISOString();

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
