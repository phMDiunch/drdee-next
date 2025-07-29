// src/app/api/customers/check-phone/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "Thiếu số điện thoại" }, { status: 400 });
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { phone },
      select: {
        id: true, // <-- THÊM DÒNG NÀY
        customerCode: true,
        fullName: true,
      },
    });

    if (customer) {
      // Nếu tìm thấy, trả về thông tin khách hàng
      return NextResponse.json({
        exists: true,
        customer,
      });
    }

    // Nếu không tìm thấy
    return NextResponse.json({ exists: false });
  } catch (error) {
    return NextResponse.json(
      { error: "Lỗi server khi kiểm tra SĐT" },
      { status: 500 }
    );
  }
}
