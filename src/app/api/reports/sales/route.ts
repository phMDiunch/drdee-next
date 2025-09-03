// src/app/api/reports/sales/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import dayjs from "dayjs";
import { SalesData, SalesComparisonData } from "@/features/reports/type";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "month";
    const selectedMonth = searchParams.get("selectedMonth");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const clinicId = searchParams.get("clinicId");

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

    // Build where clause
    const whereClause = {
      serviceStatus: "Đã chốt",
      serviceConfirmDate: {
        gte: dateStart,
        lte: dateEnd,
      },
      ...(clinicId && { clinicId }),
    };

    // Get current period data
    const currentSales = await getSalesData(whereClause);

    // Calculate comparison periods
    const comparisonData = await getComparisonData(
      dateStart,
      dateEnd,
      clinicId,
      currentSales
    );

    const response: SalesComparisonData = {
      current: currentSales,
      ...comparisonData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Sales reports API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales reports" },
      { status: 500 }
    );
  }
}

async function getSalesData(whereClause: {
  serviceStatus: string;
  serviceConfirmDate: { gte: Date; lte: Date };
  clinicId?: string;
}): Promise<SalesData> {
  // Get detailed sales data
  const consultedServices = await prisma.consultedService.findMany({
    where: whereClause,
    include: {
      customer: {
        select: {
          fullName: true,
          source: true,
          sourceNotes: true,
          customerCode: true,
        },
      },
      consultingDoctor: {
        select: {
          id: true,
          fullName: true,
        },
      },
      consultingSale: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: {
      serviceConfirmDate: "desc",
    },
  });

  // Calculate totals
  const totalSales = consultedServices.reduce(
    (sum, service) => sum + service.finalPrice,
    0
  );
  const totalServices = consultedServices.length;

  // Format details
  const details = consultedServices.map((service) => ({
    id: service.id,
    customerId: service.customerId, // Add customer ID for navigation
    customerSource: service.customer.source,
    sourceNotes: service.customer.sourceNotes,
    customerCode: service.customer.customerCode,
    customerName: service.customer.fullName,
    serviceName: service.consultedServiceName,
    finalPrice: service.finalPrice,
    serviceConfirmDate: dayjs(service.serviceConfirmDate).format("YYYY-MM-DD"),
    clinicId: service.clinicId, // Add clinic ID for client-side filtering

    // Consulting staff information
    consultingDoctorId: service.consultingDoctor?.id || null,
    consultingDoctorName: service.consultingDoctor?.fullName || null,
    consultingSaleId: service.consultingSale?.id || null,
    consultingSaleName: service.consultingSale?.fullName || null,
  }));

  return {
    totalSales,
    totalServices,
    details,
  };
}

async function getComparisonData(
  currentStart: Date,
  currentEnd: Date,
  clinicId: string | null,
  currentData: SalesData
) {
  // Previous month
  const previousMonthStart = dayjs(currentStart)
    .subtract(1, "month")
    .startOf("month")
    .toDate();
  const previousMonthEnd = dayjs(currentStart)
    .subtract(1, "month")
    .endOf("month")
    .toDate();

  const previousMonthData = await getSalesData({
    serviceStatus: "Đã chốt",
    serviceConfirmDate: {
      gte: previousMonthStart,
      lte: previousMonthEnd,
    },
    ...(clinicId && { clinicId }),
  });

  // Previous year (same month)
  const previousYearStart = dayjs(currentStart)
    .subtract(1, "year")
    .startOf("month")
    .toDate();
  const previousYearEnd = dayjs(currentStart)
    .subtract(1, "year")
    .endOf("month")
    .toDate();

  const previousYearData = await getSalesData({
    serviceStatus: "Đã chốt",
    serviceConfirmDate: {
      gte: previousYearStart,
      lte: previousYearEnd,
    },
    ...(clinicId && { clinicId }),
  });

  // Calculate growth percentages
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    previousMonth: {
      data: previousMonthData,
      periodLabel: dayjs(previousMonthStart).format("MM/YYYY"),
      growth: {
        sales: calculateGrowth(
          currentData.totalSales,
          previousMonthData.totalSales
        ),
        services: calculateGrowth(
          currentData.totalServices,
          previousMonthData.totalServices
        ),
      },
    },
    previousYear: {
      data: previousYearData,
      periodLabel: dayjs(previousYearStart).format("MM/YYYY"),
      growth: {
        sales: calculateGrowth(
          currentData.totalSales,
          previousYearData.totalSales
        ),
        services: calculateGrowth(
          currentData.totalServices,
          previousYearData.totalServices
        ),
      },
    },
  };
}
