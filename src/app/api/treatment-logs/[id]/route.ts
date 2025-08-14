// src/app/api/treatment-logs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

// GET: Lấy chi tiết treatment log
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const treatmentLog = await prisma.treatmentLog.findUnique({
      where: { id },
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

    if (!treatmentLog) {
      return NextResponse.json(
        { error: "Không tìm thấy lịch sử điều trị" },
        { status: 404 }
      );
    }

    return NextResponse.json(treatmentLog);
  } catch (error) {
    console.error("Error fetching treatment log:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy thông tin lịch sử điều trị" },
      { status: 500 }
    );
  }
}

// PUT: Cập nhật treatment log
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      treatmentNotes,
      nextStepNotes,
      treatmentStatus,
      dentistId,
      assistant1Id,
      assistant2Id,
      clinicId,
      updatedById,
    } = body;

    // Validate required fields
    if (!treatmentNotes || !dentistId || !updatedById) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    const treatmentLog = await prisma.treatmentLog.update({
      where: { id },
      data: {
        treatmentNotes,
        nextStepNotes: nextStepNotes || null,
        treatmentStatus: treatmentStatus || "Đang tiến hành",
        dentistId,
        assistant1Id: assistant1Id || null,
        assistant2Id: assistant2Id || null,
        clinicId: clinicId || undefined,
        updatedById,
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

    return NextResponse.json(treatmentLog);
  } catch (error) {
    console.error("Error updating treatment log:", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật lịch sử điều trị" },
      { status: 500 }
    );
  }
}

// DELETE: Xóa treatment log
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.treatmentLog.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Đã xóa lịch sử điều trị" });
  } catch (error) {
    console.error("Error deleting treatment log:", error);
    return NextResponse.json(
      { error: "Lỗi khi xóa lịch sử điều trị" },
      { status: 500 }
    );
  }
}
