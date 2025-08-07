// src/app/api/treatment-logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

// GET: Lấy danh sách treatment logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const appointmentId = searchParams.get("appointmentId");

    const where: any = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (appointmentId) {
      where.appointmentId = appointmentId;
    }

    const treatmentLogs = await prisma.treatmentLog.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            customerCode: true,
          },
        },
        consultedService: {
          select: {
            id: true,
            consultedServiceName: true,
            consultedServiceUnit: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentDateTime: true,
            status: true,
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
    });

    return NextResponse.json(treatmentLogs);
  } catch (error) {
    console.error("Error fetching treatment logs:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách lịch sử điều trị" },
      { status: 500 }
    );
  }
}

// POST: Tạo treatment log mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      consultedServiceId,
      appointmentId,
      treatmentNotes,
      nextStepNotes,
      treatmentStatus,
      dentistId,
      assistant1Id,
      assistant2Id,
      createdById,
    } = body;

    // Validate required fields
    if (
      !customerId ||
      !consultedServiceId ||
      !treatmentNotes ||
      !dentistId ||
      !createdById
    ) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    const treatmentLog = await prisma.treatmentLog.create({
      data: {
        customerId,
        consultedServiceId,
        appointmentId: appointmentId || null,
        treatmentNotes,
        nextStepNotes: nextStepNotes || null,
        treatmentStatus: treatmentStatus || "Đang tiến hành",
        dentistId,
        assistant1Id: assistant1Id || null,
        assistant2Id: assistant2Id || null,
        createdById,
        updatedById: createdById,
        imageUrls: [],
        xrayUrls: [],
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            customerCode: true,
          },
        },
        consultedService: {
          select: {
            id: true,
            consultedServiceName: true,
            consultedServiceUnit: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentDateTime: true,
            status: true,
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
    });

    return NextResponse.json(treatmentLog, { status: 201 });
  } catch (error) {
    console.error("Error creating treatment log:", error);
    return NextResponse.json(
      { error: "Lỗi khi tạo lịch sử điều trị" },
      { status: 500 }
    );
  }
}
