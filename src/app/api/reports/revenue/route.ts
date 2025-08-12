// src/app/api/reports/revenue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import dayjs from "dayjs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const clinicId = searchParams.get("clinicId");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    // Base filters
    const paymentDateFilter = {
      paymentDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    const consultationDateFilter = {
      serviceConfirmDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    // Clinic filter
    const clinicFilter = clinicId ? { clinicId } : {};

    // 1. Get payment vouchers with details for revenue calculation
    // Note: PaymentVoucher.clinicId might be NULL, so we filter by ConsultedService.clinicId instead
    const paymentVouchers = clinicId
      ? await prisma.paymentVoucher.findMany({
          where: {
            ...paymentDateFilter,
            details: {
              some: {
                consultedService: {
                  clinicId: clinicId,
                },
              },
            },
          },
          include: {
            details: {
              where: {
                consultedService: {
                  clinicId: clinicId,
                },
              },
              include: {
                consultedService: {
                  select: {
                    id: true,
                    consultingSaleId: true,
                    consultingDoctorId: true,
                    treatingDoctorId: true,
                    clinicId: true,
                    consultingSale: {
                      select: {
                        id: true,
                        fullName: true,
                      },
                    },
                    consultingDoctor: {
                      select: {
                        id: true,
                        fullName: true,
                      },
                    },
                    treatingDoctor: {
                      select: {
                        id: true,
                        fullName: true,
                      },
                    },
                  },
                },
              },
            },
            customer: {
              select: {
                id: true,
                fullName: true,
              },
            },
            cashier: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        })
      : await prisma.paymentVoucher.findMany({
          where: {
            ...paymentDateFilter,
          },
          include: {
            details: {
              include: {
                consultedService: {
                  select: {
                    id: true,
                    consultingSaleId: true,
                    consultingDoctorId: true,
                    treatingDoctorId: true,
                    clinicId: true,
                    consultingSale: {
                      select: {
                        id: true,
                        fullName: true,
                      },
                    },
                    consultingDoctor: {
                      select: {
                        id: true,
                        fullName: true,
                      },
                    },
                    treatingDoctor: {
                      select: {
                        id: true,
                        fullName: true,
                      },
                    },
                  },
                },
              },
            },
            customer: {
              select: {
                id: true,
                fullName: true,
              },
            },
            cashier: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        });

    // 2. Get consulted services for sales calculation
    const consultedServices = await prisma.consultedService.findMany({
      where: {
        ...consultationDateFilter,
        ...clinicFilter,
        serviceStatus: "Đã chốt", // Only confirmed services count as sales
      },
      include: {
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
        treatingDoctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        customer: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    // 3. Get all payment details (no employee filtering needed)
    const filteredPaymentDetails = paymentVouchers.flatMap((voucher) =>
      voucher.details.filter((detail) => {
        return detail.consultedService !== null;
      })
    );

    // 4. Calculate revenue metrics
    const totalRevenue = filteredPaymentDetails.reduce(
      (sum, detail) => sum + detail.amount,
      0
    );
    const totalSales = consultedServices.reduce(
      (sum, service) => sum + service.finalPrice,
      0
    );
    const totalTransactions = paymentVouchers.length;
    const averageTransaction =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // 5. Revenue by payment method
    const byPaymentMethod = filteredPaymentDetails.reduce(
      (acc, detail) => {
        const method = detail.paymentMethod || "";
        // Normalize method names to handle Vietnamese diacritics and variations
        const normalizedMethod = method.toLowerCase().trim();

        if (
          normalizedMethod.includes("tiền") &&
          normalizedMethod.includes("mặt")
        ) {
          acc.cash += detail.amount;
        } else if (
          normalizedMethod.includes("pos") ||
          (normalizedMethod.includes("thẻ") &&
            normalizedMethod.includes("thường"))
        ) {
          acc.cardNormal += detail.amount;
        } else if (normalizedMethod.includes("visa")) {
          acc.cardVisa += detail.amount;
        } else if (
          normalizedMethod.includes("chuyển") &&
          normalizedMethod.includes("khoản")
        ) {
          acc.transfer += detail.amount;
        } else {
          // Default to cash for unknown payment methods
          acc.cash += detail.amount;
        }
        return acc;
      },
      { cash: 0, cardNormal: 0, cardVisa: 0, transfer: 0 }
    );

    // 6. Daily breakdown for charts (only days with actual data)
    const dailyData = new Map();

    // Add payment data to daily breakdown
    paymentVouchers.forEach((voucher) => {
      const dateKey = dayjs(voucher.paymentDate).format("YYYY-MM-DD");

      // Initialize day if not exists
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, {
          date: dateKey,
          revenue: 0,
          sales: 0,
          transactions: 0,
          cash: 0,
          cardNormal: 0,
          cardVisa: 0,
          transfer: 0,
        });
      }

      const day = dailyData.get(dateKey);

      // Process each payment detail
      voucher.details
        .filter((detail) => {
          return detail.consultedService !== null;
        })
        .forEach((detail) => {
          day.revenue += detail.amount;

          // Add to appropriate payment method using normalized matching
          const method = detail.paymentMethod || "";
          const normalizedMethod = method.toLowerCase().trim();

          if (
            normalizedMethod.includes("tiền") &&
            normalizedMethod.includes("mặt")
          ) {
            day.cash += detail.amount;
          } else if (
            normalizedMethod.includes("pos") ||
            (normalizedMethod.includes("thẻ") &&
              normalizedMethod.includes("thường"))
          ) {
            day.cardNormal += detail.amount;
          } else if (normalizedMethod.includes("visa")) {
            day.cardVisa += detail.amount;
          } else if (
            normalizedMethod.includes("chuyển") &&
            normalizedMethod.includes("khoản")
          ) {
            day.transfer += detail.amount;
          } else {
            day.cash += detail.amount; // Default to cash for unknown methods
          }
        });

      // Count transactions (vouchers with revenue > 0)
      const voucherRevenue = voucher.details
        .filter((detail) => detail.consultedService !== null)
        .reduce((sum, detail) => sum + detail.amount, 0);

      if (voucherRevenue > 0) {
        day.transactions += 1;
      }
    });

    // Add sales data to daily breakdown
    consultedServices.forEach((service) => {
      const dateKey = dayjs(service.serviceConfirmDate).format("YYYY-MM-DD");

      // Initialize day if not exists (for sales without payments)
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, {
          date: dateKey,
          revenue: 0,
          sales: 0,
          transactions: 0,
          cash: 0,
          cardNormal: 0,
          cardVisa: 0,
          transfer: 0,
        });
      }

      const day = dailyData.get(dateKey);
      day.sales += service.finalPrice;
    });

    const byTime = Array.from(dailyData.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // 7. Employee performance
    const employeeStats = new Map();

    // Revenue by employee from payment details
    filteredPaymentDetails.forEach((detail) => {
      const service = detail.consultedService;
      if (!service) return;

      const employees = [
        {
          id: service.consultingSaleId,
          name: service.consultingSale?.fullName,
          role: "consultingSale",
        },
        {
          id: service.consultingDoctorId,
          name: service.consultingDoctor?.fullName,
          role: "consultingDoctor",
        },
        {
          id: service.treatingDoctorId,
          name: service.treatingDoctor?.fullName,
          role: "treatingDoctor",
        },
      ].filter((emp) => emp.id && emp.name);

      employees.forEach((emp) => {
        if (!employeeStats.has(emp.id)) {
          employeeStats.set(emp.id, {
            employeeId: emp.id,
            employeeName: emp.name,
            role: emp.role,
            revenue: 0,
            sales: 0,
            transactions: 0,
          });
        }
        const stats = employeeStats.get(emp.id);
        stats.revenue += detail.amount;
        stats.transactions += 1;
      });
    });

    // Sales by employee from consulted services
    consultedServices.forEach((service) => {
      const employees = [
        {
          id: service.consultingSaleId,
          name: service.consultingSale?.fullName,
          role: "consultingSale",
        },
        {
          id: service.consultingDoctorId,
          name: service.consultingDoctor?.fullName,
          role: "consultingDoctor",
        },
        {
          id: service.treatingDoctorId,
          name: service.treatingDoctor?.fullName,
          role: "treatingDoctor",
        },
      ].filter((emp) => emp.id && emp.name);

      employees.forEach((emp) => {
        if (!employeeStats.has(emp.id)) {
          employeeStats.set(emp.id, {
            employeeId: emp.id,
            employeeName: emp.name,
            role: emp.role,
            revenue: 0,
            sales: 0,
            transactions: 0,
          });
        }
        const stats = employeeStats.get(emp.id);
        stats.sales += service.finalPrice;
      });
    });

    const byEmployee = Array.from(employeeStats.values()).sort(
      (a, b) => b.revenue - a.revenue
    );

    // 8. Clinic breakdown
    const clinicStats = new Map();

    // Revenue by clinic (from payment voucher details)
    paymentVouchers.forEach((voucher) => {
      voucher.details.forEach((detail) => {
        if (detail.consultedService && detail.consultedService.clinicId) {
          const clinicId = detail.consultedService.clinicId;

          if (!clinicStats.has(clinicId)) {
            clinicStats.set(clinicId, {
              clinicId: clinicId,
              clinicName: clinicId, // Use raw clinic ID as name
              revenue: 0,
              sales: 0,
              transactions: 0,
            });
          }

          const clinic = clinicStats.get(clinicId);
          clinic.revenue += detail.amount;
        }
      });

      // Count transactions per clinic
      const clinicsInVoucher = new Set();
      voucher.details.forEach((detail) => {
        if (detail.consultedService && detail.consultedService.clinicId) {
          clinicsInVoucher.add(detail.consultedService.clinicId);
        }
      });

      // Add one transaction per clinic for this voucher
      clinicsInVoucher.forEach((clinicId) => {
        if (clinicStats.has(clinicId)) {
          const clinic = clinicStats.get(clinicId);
          clinic.transactions += 1;
        }
      });
    });

    // Sales by clinic (from consulted services)
    consultedServices.forEach((service) => {
      if (service.clinicId) {
        if (!clinicStats.has(service.clinicId)) {
          clinicStats.set(service.clinicId, {
            clinicId: service.clinicId,
            clinicName: service.clinicId, // Use raw clinic ID as name
            revenue: 0,
            sales: 0,
            transactions: 0,
          });
        }
        const clinic = clinicStats.get(service.clinicId);
        clinic.sales += service.finalPrice;
      }
    });

    const byClinic = Array.from(clinicStats.values()).sort(
      (a, b) => b.revenue - a.revenue
    );

    const response = {
      totalRevenue,
      totalSales,
      totalTransactions,
      averageTransaction: Math.round(averageTransaction),
      byPaymentMethod,
      byTime,
      byEmployee,
      byClinic,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching revenue reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
