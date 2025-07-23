// src/app/api/employees/link-uid/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

export async function POST(request: Request) {
  const { email, uid } = await request.json();

  if (!email || !uid) {
    return NextResponse.json({ error: "Thiếu email hoặc uid" }, { status: 400 });
  }

  try {
    const employee = await prisma.employee.update({
      where: { email: email.toLowerCase() },
      data: { uid },
    });
    return NextResponse.json({ success: true, employee });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Không tìm thấy nhân viên" }, { status: 400 });
  }
}
