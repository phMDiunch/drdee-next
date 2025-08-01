// src/app/api/employees/by-uid/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({ error: "Thiếu uid" }, { status: 400 });
  }
  try {
    const employee = await prisma.employee.findUnique({
      where: { uid },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Không tìm thấy nhân viên" },
        { status: 404 }
      );
    }
    return NextResponse.json(employee);
  } catch (error) {
    console.error("Lỗi khi lấy profile:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
