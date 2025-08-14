// src/app/api/treatment-logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { Prisma } from "@prisma/client";

// GET: Lấy danh sách treatment logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const appointmentId = searchParams.get("appointmentId");

    const where: Prisma.TreatmentLogWhereInput = {};

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
      clinicId,
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

    // Pre-validate consulted service belongs to the customer
    const consulted = await prisma.consultedService.findUnique({
      where: { id: consultedServiceId || "" },
      select: { id: true, customerId: true, serviceStatus: true },
    });
    if (!consulted) {
      return NextResponse.json(
        { error: "Dịch vụ được chọn không tồn tại" },
        { status: 422 }
      );
    }
    // Derive customer from consulted service to avoid FE mismatch
    const effectiveCustomerId = consulted.customerId;
    if (customerId && consulted.customerId !== customerId) {
      // Không chặn, nhưng sẽ tiếp tục dùng effectiveCustomerId
      console.warn(
        "TreatmentLog POST: body.customerId khác consulted.customerId",
        { bodyCustomerId: customerId, serviceCustomerId: consulted.customerId }
      );
    }

    // If appointment provided, ensure it belongs to the same customer
    if (appointmentId) {
      const appt = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: { id: true, customerId: true, status: true },
      });
      if (!appt) {
        return NextResponse.json(
          { error: "Không tìm thấy lịch hẹn" },
          { status: 422 }
        );
      }
      if (appt.customerId !== effectiveCustomerId) {
        return NextResponse.json(
          { error: "Lịch hẹn và dịch vụ không cùng khách hàng" },
          { status: 422 }
        );
      }
    }

    // Determine clinicId: prefer provided clinicId; else derive from appointment or consulted service; fallback to creator's profile if available
    let effectiveClinicId: string | null = null;
    if (clinicId) {
      effectiveClinicId = clinicId;
    } else if (appointmentId) {
      const apptClinic = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: { clinicId: true },
      });
      effectiveClinicId = apptClinic?.clinicId || null;
    }
    if (!effectiveClinicId) {
      const consultedClinic = await prisma.consultedService.findUnique({
        where: { id: consultedServiceId },
        select: { clinicId: true },
      });
      effectiveClinicId = consultedClinic?.clinicId || null;
    }

    const treatmentLog = await prisma.treatmentLog.create({
      data: {
        customerId: effectiveCustomerId,
        consultedServiceId,
        appointmentId: appointmentId || null,
        treatmentNotes,
        nextStepNotes: nextStepNotes || null,
        treatmentStatus: treatmentStatus || "Đang tiến hành",
        dentistId,
        assistant1Id: assistant1Id || null,
        assistant2Id: assistant2Id || null,
        clinicId: effectiveClinicId,
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
    // Provide more actionable error messages
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        // Foreign key failed
        return NextResponse.json(
          { error: "Tham chiếu không hợp lệ (khách hàng/lịch hẹn/dịch vụ)" },
          { status: 422 }
        );
      }
      return NextResponse.json(
        { error: `Lỗi cơ sở dữ liệu (${error.code})` },
        { status: 500 }
      );
    }
    console.error("Error creating treatment log:", error);
    return NextResponse.json(
      { error: "Lỗi khi tạo lịch sử điều trị" },
      { status: 500 }
    );
  }
}
