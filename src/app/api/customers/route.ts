// src/app/api/customers/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";

// Lấy danh sách customer
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "20");
  const search = searchParams.get("search")?.trim() || "";
  const clinicId = searchParams.get("clinicId") || "";
  const includeToday = searchParams.get("includeToday") === "true"; // ✅ FLAG MỚI

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

  // ✅ INCLUDE LOGIC
  const include: any = {
    primaryContact: {
      select: {
        customerCode: true,
        fullName: true,
        phone: true,
      },
    },
  };

  // ✅ NẾU CHECK-IN MODE → INCLUDE TODAY APPOINTMENTS
  if (includeToday) {
    const startOfDay = dayjs().startOf("day").toDate();
    const endOfDay = dayjs().endOf("day").toDate();

    include.appointments = {
      where: {
        appointmentDateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        appointmentDateTime: true,
        status: true,
        checkInTime: true,
        checkOutTime: true,
        primaryDentist: {
          select: {
            fullName: true,
          },
        },
      },
      take: 1, // Chỉ lấy 1 appointment (mỗi khách 1 lịch/ngày)
    };
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include,
    }),
    prisma.customer.count({ where }),
  ]);

  // ✅ TRANSFORM DATA CHO CHECK-IN MODE
  const transformedCustomers = customers.map((customer) => {
    if (includeToday && customer.appointments) {
      return {
        ...customer,
        todayAppointment: customer.appointments[0] || null,
        appointments: undefined, // Remove để tránh bloat
      };
    }
    return customer;
  });

  return NextResponse.json({ customers: transformedCustomers, total });
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
      "Trùng dữ liệu: " + fieldsArr.map((f) => fieldNames[f] || f).join(", ");
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ error: error.message }, { status: 500 });
}

// Tạo mới customer
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // === BẮT ĐẦU: Logic cập nhật ===

    // 1. fullName_lowercase
    data.fullName_lowercase = data.fullName?.toLowerCase().trim() || "";

    // 2. Sinh customerCode (logic này vẫn giữ nguyên)
    const now = new Date();
    const year = now.getFullYear() % 100;
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const prefixMap: Record<string, string> = {
      "450MK": "MK",
      "143TDT": "TDT", // Giả sử mã chi nhánh là 143TDT
      "153DN": "DN", // Giả sử mã chi nhánh là 153DN
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
    data.customerCode = `${prefix}-${year}${month}-${String(count + 1).padStart(
      3,
      "0"
    )}`;

    // 3. Cập nhật searchKeywords
    // Nếu có SĐT thì thêm vào, nếu không thì thôi.
    data.searchKeywords = [
      data.customerCode,
      data.fullName_lowercase,
      data.phone, // Sẽ là undefined nếu không có và được filter loại bỏ
    ].filter(Boolean);

    // === KẾT THÚC: Logic cập nhật ===

    const newCustomer = await prisma.customer.create({ data });
    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error: any) {
    return handlePrismaError(error);
  }
}
