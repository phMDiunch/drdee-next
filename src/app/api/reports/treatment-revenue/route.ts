// src/app/api/reports/treatment-revenue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

const VN_TZ = "Asia/Ho_Chi_Minh";

function getHeader(req: NextRequest, key: string) {
  return req.headers.get(key) || undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || "current";
    const clinicId = searchParams.get("clinicId");

    // Get current user's employee ID
    const employeeId = getHeader(request, "x-employee-id");

    if (!employeeId) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 401 }
      );
    }

    // Determine date range
    let startDate: Date;
    let endDate: Date;

    if (month === "current") {
      const now = dayjs().tz(VN_TZ);
      startDate = now.startOf("month").toDate();
      endDate = now.endOf("month").toDate();
    } else {
      // Expect format YYYY-MM
      const [year, monthNum] = month.split("-");
      const targetMonth = dayjs(`${year}-${monthNum}-01`).tz(VN_TZ);
      startDate = targetMonth.startOf("month").toDate();
      endDate = targetMonth.endOf("month").toDate();
    }

    // Build where condition
    const where: {
      paymentDate: {
        gte: Date;
        lte: Date;
      };
      customer?: {
        clinicId: string;
      };
    } = {
      paymentDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (clinicId) {
      where.customer = { clinicId };
    }

    // Get payment vouchers with treatment-related details
    const vouchers = await prisma.paymentVoucher.findMany({
      where,
      include: {
        customer: {
          select: { id: true, fullName: true, customerCode: true },
        },
        details: {
          where: {
            consultedService: {
              treatingDoctorId: employeeId, // Only include services for current user as treating doctor
            },
          },
          include: {
            consultedService: {
              include: {
                customer: {
                  select: { id: true, fullName: true, customerCode: true },
                },
                treatingDoctor: {
                  select: { id: true, fullName: true },
                },
              },
            },
          },
        },
      },
      orderBy: { paymentDate: "desc" },
    });

    // Filter out vouchers with no treatment details
    const filteredVouchers = vouchers.filter(
      (voucher) => voucher.details.length > 0
    );

    return NextResponse.json(filteredVouchers);
  } catch (error: unknown) {
    console.error("Get treatment revenue error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
