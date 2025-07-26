// src/app/api/employees/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { Prisma } from "@prisma/client";

// Lấy danh sách nhân viên (có filter, search, phân trang)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || "1");
    const pageSize = Number(searchParams.get("pageSize") || "100"); // Mặc định 100 cho phù hợp

    // Lấy các tham số filter
    const search = searchParams.get("search")?.trim() || "";
    const clinicId = searchParams.get("clinicId") || "";
    const title = searchParams.get("title") || "";

    // Mặc định chỉ lấy "Đang làm việc" và "Thử việc" nếu không có filter trạng thái
    const employmentStatus =
      searchParams.get("employmentStatus") || "Đang làm việc,Thử việc";

    const where: Prisma.EmployeeWhereInput = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { employeeCode: { contains: search, mode: "insensitive" } },
      ];
    }

    if (clinicId) where.clinicId = clinicId;
    if (title) where.title = title;

    // Xử lý filter theo nhiều trạng thái
    if (employmentStatus) {
      const statuses = employmentStatus.split(",");
      where.employmentStatus = { in: statuses };
    }

    const [employees, total] = await prisma.$transaction([
      prisma.employee.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({ employees, total });
  } catch (error) {
    return NextResponse.json(
      { error: "Lỗi lấy danh sách nhân viên" },
      { status: 500 }
    );
  }
}

// Thêm mới nhân viên (giữ nguyên)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const employee = await prisma.employee.create({
      data,
    });
    return NextResponse.json(employee, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Lỗi tạo nhân viên" },
      { status: 500 }
    );
  }
}
