// src/app/api/appointments/checked-in/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

// GET: Lấy danh sách appointments đã check-in của customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "Thiếu customerId" }, { status: 400 });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        customerId,
        status: "Đã đến", // Trạng thái đã check-in
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            customerCode: true,
          },
        },
        primaryDentist: {
          select: {
            id: true,
            fullName: true,
          },
        },
        treatmentLogs: {
          include: {
            consultedService: {
              include: {
                treatingDoctor: {
                  select: {
                    id: true,
                    fullName: true,
                  },
                },
              },
            },
            dentist: {
              select: {
                id: true,
                fullName: true,
              },
            },
            assistant1: {
              select: {
                id: true,
                fullName: true,
              },
            },
            assistant2: {
              select: {
                id: true,
                fullName: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc", // Cũ nhất trước
          },
        },
      },
      orderBy: {
        appointmentDateTime: "desc", // Mới nhất trước
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching checked-in appointments:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách lịch hẹn đã check-in" },
      { status: 500 }
    );
  }
}
