// src/app/api/payment-vouchers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search")?.trim() || "";
    const clinicId = searchParams.get("clinicId");

    const skip = (page - 1) * pageSize;

    // Build where condition
    const where: any = {};

    if (clinicId) {
      where.customer = { clinicId };
    }

    if (search) {
      where.OR = [
        { paymentNumber: { contains: search, mode: "insensitive" } },
        { customer: { fullName: { contains: search, mode: "insensitive" } } },
        {
          customer: { customerCode: { contains: search, mode: "insensitive" } },
        },
      ];
    }

    // Get total count
    const total = await prisma.paymentVoucher.count({ where });

    // Get paginated data
    const vouchers = await prisma.paymentVoucher.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: { id: true, fullName: true, customerCode: true },
        },
        cashier: { select: { id: true, fullName: true } },
        details: {
          include: {
            consultedService: {
              select: {
                id: true,
                consultedServiceName: true,
                finalPrice: true,
                dentalService: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      vouchers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: any) {
    console.error("Get payment vouchers error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { details, ...voucherData } = data;

    const result = await prisma.$transaction(async (tx) => {
      // ✅ SỬA: Logic tạo số phiếu thu an toàn
      const now = new Date();
      const year = now.getFullYear() % 100; // 25
      const month = String(now.getMonth() + 1).padStart(2, "0"); // 07

      // Map clinicId to prefix
      const prefixMap: Record<string, string> = {
        "450MK": "MK",
        "143TDT": "TDT",
        "153DN": "DN",
      };

      // ✅ SỬA: Lấy clinicId từ customer nếu không có trong voucherData
      let clinicId = voucherData.clinicId;
      if (!clinicId) {
        const customer = await tx.customer.findUnique({
          where: { id: voucherData.customerId },
          select: { clinicId: true },
        });
        clinicId = customer?.clinicId;
      }

      const prefix = prefixMap[clinicId] || "XX";

      // ✅ SỬA: Tạo số phiếu thu duy nhất với retry logic
      let paymentNumber = "";
      let retryCount = 0;
      const maxRetries = 10;

      while (retryCount < maxRetries) {
        // Đếm số phiếu thu trong tháng với prefix này
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59
        );

        const count = await tx.paymentVoucher.count({
          where: {
            paymentNumber: {
              startsWith: `${prefix}-${year}${month}-`, // ✅ SỬA: Đếm theo prefix cụ thể
            },
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        });

        // Tạo số phiếu thu
        const sequenceNumber = String(count + 1 + retryCount).padStart(4, "0");
        paymentNumber = `${prefix}-${year}${month}-${sequenceNumber}`;

        // ✅ KIỂM TRA: Số phiếu thu đã tồn tại chưa
        const existing = await tx.paymentVoucher.findUnique({
          where: { paymentNumber },
        });

        if (!existing) {
          break; // Số phiếu thu hợp lệ
        }

        retryCount++;
      }

      if (retryCount >= maxRetries) {
        throw new Error(
          "Không thể tạo số phiếu thu duy nhất sau nhiều lần thử"
        );
      }

      // Tạo phiếu thu chính
      const voucher = await tx.paymentVoucher.create({
        data: {
          ...voucherData,
          paymentNumber,
          paymentDate: new Date(),
        },
      });

      // Tạo chi tiết phiếu thu
      const voucherDetails = await Promise.all(
        details.map((detail: any) =>
          tx.paymentVoucherDetail.create({
            data: {
              consultedServiceId: detail.consultedServiceId,
              amount: detail.amount,
              paymentMethod: detail.paymentMethod,
              paymentVoucherId: voucher.id,
              createdById: voucherData.createdById,
            },
          })
        )
      );

      // Cập nhật amountPaid cho từng ConsultedService
      await Promise.all(
        details.map((detail: any) =>
          tx.consultedService.update({
            where: { id: detail.consultedServiceId },
            data: {
              amountPaid: {
                increment: detail.amount,
              },
            },
          })
        )
      );

      // Return với includes để có data đầy đủ
      return await tx.paymentVoucher.findUnique({
        where: { id: voucher.id },
        include: {
          customer: {
            select: { id: true, fullName: true, customerCode: true },
          },
          cashier: { select: { id: true, fullName: true } },
          details: {
            include: {
              consultedService: {
                include: {
                  dentalService: { select: { name: true } },
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Payment voucher creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
