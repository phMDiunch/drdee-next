// src/app/api/consulted-services/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate dữ liệu đầu vào
    if (!data.customerId || !data.dentalServiceId || !data.clinicId) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc (khách hàng, dịch vụ, chi nhánh)" },
        { status: 400 }
      );
    }

    const newConsultedService = await prisma.consultedService.create({
      data: data,
    });

    return NextResponse.json(newConsultedService, { status: 201 });
  } catch (error: any) {
    console.error("Lỗi khi tạo dịch vụ tư vấn:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
