// src/app/api/employees/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

// Lấy danh sách nhân viên (có filter, search, phân trang)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || "1");
    const pageSize = Number(searchParams.get("pageSize") || "100");

    // Lấy thông tin của người dùng đang thực hiện request
    const requestingUserId = searchParams.get("requestingUserId");
    const requestingUserRole = searchParams.get("requestingUserRole");
    const requestingUserClinicId = searchParams.get("requestingUserClinicId");

    // Lấy các tham số filter từ UI
    const search = searchParams.get("search")?.trim() || "";
    const clinicIdFromFilter = searchParams.get("clinicId"); // Filter do admin chọn
    const title = searchParams.get("title") || "";
    const employmentStatus =
      searchParams.get("employmentStatus") || "Đang làm việc,Thử việc";

    const where: Prisma.EmployeeWhereInput = {};

    // --- LOGIC PHÂN QUYỀN MỚI ---
    if (requestingUserRole === "employee") {
      // 1. Employee chỉ thấy chính mình
      where.id = requestingUserId || undefined;
    } else if (requestingUserRole === "manager") {
      // 2. Manager thấy tất cả nhân viên trong cùng chi nhánh
      where.clinicId = requestingUserClinicId;
    } else if (requestingUserRole === "admin") {
      // 3. Admin có thể lọc theo chi nhánh tùy chọn
      if (clinicIdFromFilter) {
        where.clinicId = clinicIdFromFilter;
      }
    } else {
      // Nếu không có vai trò hợp lệ, không trả về gì để bảo mật
      return NextResponse.json({ employees: [], total: 0 });
    }
    // --- KẾT THÚC LOGIC PHÂN QUYỀN ---

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { employeeCode: { contains: search, mode: "insensitive" } },
      ];
    }
    if (title) where.title = title;
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
