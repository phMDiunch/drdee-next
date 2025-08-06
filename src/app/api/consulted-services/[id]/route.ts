// src/app/api/consulted-services/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

// ✅ GET single consulted service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const consultedService = await prisma.consultedService.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            customerCode: true,
            fullName: true,
            phone: true,
          },
        },
        dentalService: {
          select: {
            id: true,
            name: true,
            unit: true,
          },
        },
        consultingDoctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        treatingDoctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        consultingSale: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!consultedService) {
      return NextResponse.json(
        { error: "Không tìm thấy dịch vụ tư vấn" },
        { status: 404 }
      );
    }

    return NextResponse.json(consultedService);
  } catch (error: unknown) {
    console.error("Error fetching consulted service:", error);
    return NextResponse.json(
      { error: "Lỗi server khi tải dịch vụ tư vấn" },
      { status: 500 }
    );
  }
}

// --- HÀM CẬP NHẬT (SỬA) ---
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // ✅ Kiểm tra dịch vụ đã chốt chưa
    const existingService = await prisma.consultedService.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Không tìm thấy dịch vụ" },
        { status: 404 }
      );
    }

    if (existingService.serviceStatus === "Đã chốt") {
      return NextResponse.json(
        { error: "Không thể sửa dịch vụ đã chốt!" },
        { status: 400 }
      );
    }

    // Tiếp tục logic update...
    const updated = await prisma.consultedService.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        customer: { select: { id: true, fullName: true } },
        dentalService: { select: { id: true, name: true, unit: true } },
        consultingDoctor: { select: { id: true, fullName: true } },
        consultingSale: { select: { id: true, fullName: true } },
        treatingDoctor: { select: { id: true, fullName: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- HÀM XÓA ---
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Thêm await
    await prisma.consultedService.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Lỗi khi xóa dịch vụ tư vấn:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- HÀM CHỐT DỊCH VỤ ---
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Kiểm tra service có tồn tại không
    const existingService = await prisma.consultedService.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Không tìm thấy dịch vụ" },
        { status: 404 }
      );
    }

    // Kiểm tra service đã chốt chưa
    if (existingService.serviceStatus === "Đã chốt") {
      return NextResponse.json(
        { error: "Dịch vụ đã được chốt trước đó" },
        { status: 400 }
      );
    }

    // Cập nhật service
    const updatedService = await prisma.consultedService.update({
      where: { id },
      data: {
        serviceStatus: "Đã chốt",
        serviceConfirmDate: new Date(),
        updatedById: body.updatedById,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedService);
  } catch (error: any) {
    console.error("Lỗi khi chốt dịch vụ:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
