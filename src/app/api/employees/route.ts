// src/app/api/employees/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { Prisma } from "@prisma/client";

// Lấy danh sách nhân viên (có filter, search, phân trang)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || "1");
    const pageSize = Number(searchParams.get("pageSize") || "100");

    // Lấy thông tin của người dùng đang thực hiện request (LEGACY - keep for backward compatibility)
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

    // --- SIMPLIFIED LOGIC: All users can view active employees ---
    // Legacy permission logic removed for auto-loading employees on login
    // Only admin/manager restrictions will be applied in UI for edit/delete operations

    // Apply clinic filter if specified (for admin filtering)
    if (requestingUserRole === "admin" && clinicIdFromFilter) {
      where.clinicId = clinicIdFromFilter;
    } else if (requestingUserRole === "manager" && requestingUserClinicId) {
      // Manager still filtered by their clinic for admin panel usage
      where.clinicId = requestingUserClinicId;
    } else if (requestingUserRole === "employee" && requestingUserId) {
      // Employee still filtered to themselves for admin panel usage
      where.id = requestingUserId;
    }
    // If no role specified (auto-load case), no additional filtering
    // --- END SIMPLIFIED LOGIC ---

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
