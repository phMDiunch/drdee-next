// src/app/api/aftercare/candidates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
const VN_TZ = "Asia/Ho_Chi_Minh";

function getHeader(req: NextRequest, key: string) {
  return req.headers.get(key) || undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // YYYY-MM-DD
    const keyword = (searchParams.get("keyword") || "").trim();
    const clinicIdFilter = searchParams.get("clinicId") || undefined;

    if (!date) {
      return NextResponse.json(
        { error: "Thiếu tham số date" },
        { status: 400 }
      );
    }

    const role = getHeader(request, "x-employee-role");
    const profileClinicId = getHeader(request, "x-clinic-id");

    const clinicId =
      role && role !== "admin"
        ? profileClinicId
        : clinicIdFilter || profileClinicId;

    const dayStart = dayjs.tz(date, VN_TZ).startOf("day").toDate();
    const dayEnd = dayjs.tz(date, VN_TZ).endOf("day").toDate();

    // Lấy treatment logs trong ngày và gộp theo customer
    const logs = await prisma.treatmentLog.findMany({
      where: {
        treatmentDate: {
          gte: dayStart,
          lte: dayEnd,
        },
        ...(clinicId ? { clinicId } : {}),
      },
      include: {
        customer: {
          select: { id: true, customerCode: true, fullName: true, phone: true },
        },
        consultedService: { select: { consultedServiceName: true } },
        dentist: { select: { fullName: true } },
      },
      orderBy: { treatmentDate: "asc" },
    });

    // Keyword filter
    const filtered = keyword
      ? logs.filter((l) => {
          const { customer } = l;
          const hay = [customer.customerCode, customer.fullName, customer.phone]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return hay.includes(keyword.toLowerCase());
        })
      : logs;

    // Gộp theo customer
    const byCustomer: Record<
      string,
      {
        customerId: string;
        customerCode: string | null;
        customerName: string;
        phone: string | null;
        serviceSet: Set<string>;
        doctorSet: Set<string>;
      }
    > = {};

    for (const l of filtered) {
      const key = l.customerId;
      if (!byCustomer[key]) {
        byCustomer[key] = {
          customerId: l.customerId,
          customerCode: l.customer.customerCode ?? null,
          customerName: l.customer.fullName,
          phone: l.customer.phone ?? null,
          serviceSet: new Set<string>(),
          doctorSet: new Set<string>(),
        };
      }
      if (l.consultedService?.consultedServiceName)
        byCustomer[key].serviceSet.add(
          l.consultedService.consultedServiceName.trim()
        );
      if (l.dentist?.fullName)
        byCustomer[key].doctorSet.add(l.dentist.fullName.trim());
    }

    // Đếm số lần đã chăm sóc trong ngày (badge)
    const careCounts = await prisma.treatmentCare.groupBy({
      by: ["customerId"],
      where: {
        treatmentDate: dayjs.tz(date, VN_TZ).toDate(), // @db.Date so compare as date-only
        ...(clinicId ? { clinicId } : {}),
      },
      _count: { customerId: true },
    });
    const countMap = new Map<string, number>(
      careCounts.map(
        (c: { customerId: string; _count: { customerId: number } }) => [
          c.customerId,
          c._count.customerId,
        ]
      )
    );

    const candidates = Object.values(byCustomer).map((c) => ({
      customerId: c.customerId,
      customerCode: c.customerCode,
      customerName: c.customerName,
      phone: c.phone,
      treatmentDate: dayjs.tz(date, VN_TZ).format("YYYY-MM-DD"),
      treatmentServiceNames: Array.from(c.serviceSet),
      treatingDoctorNames: Array.from(c.doctorSet),
      careCount: countMap.get(c.customerId) || 0,
    }));

    // Optional: sort by name
    candidates.sort((a, b) =>
      a.customerName.localeCompare(b.customerName, "vi")
    );

    return NextResponse.json(candidates);
  } catch (error) {
    console.error("aftercare/candidates", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
