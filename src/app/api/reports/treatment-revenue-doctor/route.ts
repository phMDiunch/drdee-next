// src/app/api/reports/treatment-revenue-doctor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import dayjs from "dayjs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "month";
    const selectedMonth = searchParams.get("selectedMonth");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const clinicId = searchParams.get("clinicId");

    console.log("Treatment Revenue Doctor API called with:", {
      timeRange,
      selectedMonth,
      startDate,
      endDate,
      clinicId,
    });

    // Calculate date range
    let dateStart: Date;
    let dateEnd: Date;

    if (timeRange === "month" && selectedMonth) {
      dateStart = dayjs(selectedMonth).startOf("month").toDate();
      dateEnd = dayjs(selectedMonth).endOf("month").toDate();
    } else if (timeRange === "range" && startDate && endDate) {
      dateStart = dayjs(startDate).startOf("day").toDate();
      dateEnd = dayjs(endDate).endOf("day").toDate();
    } else {
      // Default to current month
      dateStart = dayjs().startOf("month").toDate();
      dateEnd = dayjs().endOf("month").toDate();
    }

    console.log("Date range calculated:", { dateStart, dateEnd });

    // Build where conditions
    const whereConditions = {
      paymentVoucher: {
        paymentDate: {
          gte: dateStart,
          lte: dateEnd,
        },
        ...(clinicId && { clinicId }),
      },
      consultedService: {
        treatingDoctorId: {
          not: null, // Chỉ lấy các dịch vụ có bác sĩ điều trị
        },
      },
    };

    // Query PaymentVoucherDetail with joins
    const paymentDetails = await prisma.paymentVoucherDetail.findMany({
      where: whereConditions,
      include: {
        paymentVoucher: {
          include: {
            customer: true,
          },
        },
        consultedService: {
          include: {
            treatingDoctor: true,
          },
        },
      },
      orderBy: {
        paymentVoucher: {
          paymentDate: "desc",
        },
      },
    });

    // Format response data
    const details = paymentDetails.map((detail) => ({
      id: detail.id,
      customerId: detail.paymentVoucher.customerId,
      customerCode: detail.paymentVoucher.customer?.customerCode || null,
      customerName: detail.paymentVoucher.customer?.fullName || "",
      serviceName: detail.consultedService?.consultedServiceName || "",
      treatingDoctorId: detail.consultedService?.treatingDoctorId || null,
      treatingDoctorName:
        detail.consultedService?.treatingDoctor?.fullName || null,
      amountReceived: Number(detail.amount || 0),
      paymentDate: detail.paymentVoucher.paymentDate.toISOString(),
      paymentMethod: detail.paymentMethod || "",
      clinicId: detail.paymentVoucher.clinicId,
    }));

    // Calculate totals
    const totalRevenue = details.reduce(
      (sum, item) => sum + item.amountReceived,
      0
    );
    const totalPayments = details.length;

    const response = {
      totalRevenue,
      totalPayments,
      details,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Treatment revenue doctor API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
