import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    const employee = await prisma.employee.update({
      where: { id },
      data,
    });
    return NextResponse.json(employee);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Cập nhật thất bại" },
      { status: 500 }
    );
  }
}
