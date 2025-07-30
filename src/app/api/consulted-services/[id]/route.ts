// src/app/api/consulted-services/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

// --- HÀM CẬP NHẬT (SỬA) ---
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Thêm await
    const data = await request.json();

    // Loại bỏ các trường không cần thiết để tránh lỗi
    delete data.id;
    delete data.customer;
    delete data.dentalService;

    const updatedService = await prisma.consultedService.update({
      where: { id },
      data: data,
    });

    return NextResponse.json(updatedService);
  } catch (error: any) {
    console.error("Lỗi khi cập nhật dịch vụ tư vấn:", error);
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
