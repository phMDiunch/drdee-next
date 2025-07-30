// src/app/api/consulted-services/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

// --- HÀM CẬP NHẬT (SỬA) ---
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.consultedService.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Lỗi khi xóa dịch vụ tư vấn:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
