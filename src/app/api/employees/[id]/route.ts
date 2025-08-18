import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();

    // ✅ Require clinicId on update (must remain assigned)
    if (
      !data.clinicId ||
      typeof data.clinicId !== "string" ||
      !data.clinicId.trim()
    ) {
      return NextResponse.json(
        { error: "Thiếu clinicId - không thể bỏ trống chi nhánh" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.update({
      where: { id },
      data,
    });
    return NextResponse.json(employee);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Cập nhật thất bại";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
