// src/app/api/customers/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { Prisma } from "@prisma/client";

// Lấy danh sách customer
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "20");
  const search = searchParams.get("search")?.trim() || "";
  const clinicId = searchParams.get("clinicId") || "";

  const where: any = {};
  if (search) {
    where.OR = [
      { searchKeywords: { has: search.toLowerCase() } },
      { fullName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
      { customerCode: { contains: search, mode: "insensitive" } },
    ];
  }
  if (clinicId) where.clinicId = clinicId;

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customer.count({ where }),
  ]);
  return NextResponse.json({ customers, total });
}

// Hàm dùng chung để trả lỗi Prisma dạng đẹp tiếng Việt
function handlePrismaError(error: any) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    // error.meta?.target là mảng tên các field bị trùng
    const fieldsArr = Array.isArray(error.meta?.target)
      ? error.meta.target
      : [error.meta?.target || ""];
    const fieldNames: Record<string, string> = {
      phone: "Số điện thoại",
      email: "Email",
      customerCode: "Mã khách hàng",
    };
    const msg =
      "Trùng dữ liệu: " +
      fieldsArr.map((f) => fieldNames[f] || f).join(", ");
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ error: error.message }, { status: 500 });
}

// Tạo mới customer
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // === BẮT ĐẦU: Sinh tự động các trường đặc biệt ===

    // 1. fullName_lowercase
    data.fullName_lowercase = data.fullName?.toLowerCase().trim() || "";

    // 2. Sinh customerCode
    const now = new Date();
    const year = now.getFullYear() % 100;
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const prefixMap = {
      "450MK": "MK",
      "TDT": "TDT",
      "DN": "DN",
    };
    const prefix = prefixMap[data.clinicId] || "XX";
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const count = await prisma.customer.count({
      where: {
        clinicId: data.clinicId,
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    });
    data.customerCode = `${prefix}-${year}${month}-${String(count + 1).padStart(3, "0")}`;

    // 3. Sinh searchKeywords
    data.searchKeywords = [
      data.customerCode,
      data.fullName_lowercase,
      data.phone,
    ].filter(Boolean);

    // === KẾT THÚC: Sinh trường tự động ===

    const newCustomer = await prisma.customer.create({ data });
    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error: any) {
    return handlePrismaError(error);
  }
}