// src/app/api/customers/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { nowVN } from "@/utils/date";

dayjs.extend(utc);
dayjs.extend(timezone);

const VN_TZ = "Asia/Ho_Chi_Minh";

type WhereCondition = {
  OR?: Array<{
    [key: string]: any;
  }>;
  clinicId?: string;
  createdAt?: {
    gte: Date;
    lte: Date;
  };
};

type IncludeCondition = {
  primaryContact: {
    select: {
      customerCode: boolean;
      fullName: boolean;
      phone: boolean;
    };
  };
  appointments?: {
    where: {
      appointmentDateTime: {
        gte: Date;
        lte: Date;
      };
    };
    select: {
      id: boolean;
      appointmentDateTime: boolean;
      status: boolean;
      checkInTime: boolean;
      checkOutTime: boolean;
      primaryDentist: {
        select: {
          fullName: boolean;
        };
      };
    };
    take: number;
  };
};

// Lấy danh sách customer
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "20");
  const search = searchParams.get("search")?.trim() || "";
  const clinicId = searchParams.get("clinicId") || "";
  const includeAppointments =
    searchParams.get("includeAppointments") === "true"; // Include appointments for selected date
  const dateFilter = searchParams.get("date"); // ✅ NEW: Specific date filter (YYYY-MM-DD)
  const todayOnly = searchParams.get("todayOnly") === "true"; // Legacy: Filter by today's created customers
  const isGlobalSearch = searchParams.get("globalSearch") === "true"; // Global search flag

  const where: WhereCondition = {};

  // Search conditions
  if (search) {
    where.OR = [
      { searchKeywords: { has: search.toLowerCase() } },
      { fullName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
      { customerCode: { contains: search, mode: "insensitive" } },
    ];
  }

  // Clinic filter (skip for global search)
  if (clinicId && !isGlobalSearch) {
    where.clinicId = clinicId;
  }

  // ✅ UPDATED: Date filter logic - prioritize specific date over todayOnly
  if (dateFilter) {
    // Use specific date
    const targetDate = dayjs(dateFilter);
    const startOfDay = targetDate.tz(VN_TZ).startOf("day").format();
    const endOfDay = targetDate.tz(VN_TZ).endOf("day").format();
    where.createdAt = {
      gte: startOfDay,
      lte: endOfDay,
    };
  } else if (todayOnly) {
    // Fallback to today for backward compatibility
    const startOfDay = dayjs().tz(VN_TZ).startOf("day").format();
    const endOfDay = dayjs().tz(VN_TZ).endOf("day").format();
    where.createdAt = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  // ✅ INCLUDE LOGIC
  const include: IncludeCondition = {
    primaryContact: {
      select: {
        customerCode: true,
        fullName: true,
        phone: true,
      },
    },
  };

  // ✅ UPDATED: Include appointments for selected date (not just today)
  if (includeAppointments) {
    let appointmentDate;

    if (dateFilter) {
      // Use specific date for appointments
      appointmentDate = dayjs(dateFilter);
    } else {
      // Fallback to today
      appointmentDate = dayjs();
    }

    const startOfDay = appointmentDate.tz(VN_TZ).startOf("day").format();
    const endOfDay = appointmentDate.tz(VN_TZ).endOf("day").format();

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

  // Determine take limit and pagination
  const hasDateFilter = dateFilter || todayOnly;
  const takeLimit = isGlobalSearch ? pageSize : hasDateFilter ? 100 : pageSize;
  const skipOffset = isGlobalSearch
    ? 0
    : hasDateFilter
    ? 0
    : (page - 1) * pageSize;

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: skipOffset,
      take: takeLimit,
      include,
    }),
    // Only count for paginated results
    isGlobalSearch || hasDateFilter
      ? Promise.resolve(0)
      : prisma.customer.count({ where }),
  ]);

  // ✅ TRANSFORM DATA FOR APPOINTMENT MODE
  const transformedCustomers = customers.map((customer) => {
    if (includeAppointments && customer.appointments) {
      return {
        ...customer,
        todayAppointment: customer.appointments[0] || null,
        appointments: undefined, // Remove để tránh bloat
      };
    }
    return customer;
  });

  return NextResponse.json({
    customers: transformedCustomers,
    total:
      isGlobalSearch || hasDateFilter ? transformedCustomers.length : total,
  });
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
    const now = new Date(); // Dùng cho logic sinh mã, không cần VN timezone
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
