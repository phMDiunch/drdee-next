// src/app/api/appointments/check-conflict/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import dayjs from "dayjs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const date = searchParams.get("date"); // YYYY-MM-DD format
    const excludeId = searchParams.get("excludeId"); // For edit mode

    if (!customerId || !date) {
      return NextResponse.json(
        { error: "Missing customerId or date" },
        { status: 400 }
      );
    }

    const selectedDate = dayjs(date);
    const startOfDay = selectedDate.startOf("day").toDate();
    const endOfDay = selectedDate.endOf("day").toDate();

    const whereClause: any = {
      customerId,
      appointmentDateTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    // Exclude current appointment if editing
    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const existingAppointment = await prisma.appointment.findFirst({
      where: whereClause,
      include: {
        customer: { select: { fullName: true } },
      },
    });

    return NextResponse.json({
      hasConflict: !!existingAppointment,
      existingAppointment: existingAppointment || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
