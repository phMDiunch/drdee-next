// src/app/api/customers/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const clinicId = searchParams.get("clinicId");

    if (!query) {
      return NextResponse.json(
        { error: "Thiếu từ khóa tìm kiếm" },
        { status: 400 }
      );
    }

    const whereCondition: any = {
      OR: [
        { customerCode: { contains: query, mode: "insensitive" } },
        { fullName: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    };

    // Filter theo clinic nếu có
    if (clinicId) {
      whereCondition.clinicId = clinicId;
    }

    const customers = await prisma.customer.findMany({
      where: whereCondition,
      select: {
        id: true,
        customerCode: true,
        fullName: true,
        phone: true,
        email: true,
        // Include today's appointments để check
        appointments: {
          where: {
            appointmentDateTime: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
          select: {
            id: true,
            appointmentDateTime: true,
            status: true,
            checkInTime: true,
            checkOutTime: true,
            primaryDentist: {
              select: { fullName: true },
            },
          },
        },
      },
      take: 20, // Limit results
      orderBy: { fullName: "asc" },
    });

    return NextResponse.json(customers);
  } catch (error: any) {
    console.error("Search customers error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
