// src/app/api/customers/[id]/outstanding-services/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;

    // Get all consulted services for the customer
    const consultedServices = await prisma.consultedService.findMany({
      where: {
        customerId,
        serviceStatus: "Đã chốt", // Only confirmed services
      },
      include: {
        dentalService: {
          select: {
            name: true,
            unit: true,
          },
        },
        paymentDetails: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate outstanding for each service
    const outstandingServices = consultedServices
      .map((service) => {
        const totalPaid = service.paymentDetails.reduce(
          (sum: number, item: { amount: number }) => sum + item.amount,
          0
        );
        const outstanding = service.finalPrice - totalPaid;

        return {
          id: service.id,
          consultedServiceName: service.consultedServiceName,
          dentalServiceName: service.dentalService?.name,
          finalPrice: service.finalPrice,
          totalPaid,
          outstanding,
          quantity: service.quantity,
          unit: service.dentalService?.unit || "",
          createdAt: service.createdAt,
        };
      })
      .filter((service) => service.outstanding > 0); // Only services with outstanding amount

    return NextResponse.json({
      success: true,
      data: outstandingServices,
      total: outstandingServices.length,
      totalOutstanding: outstandingServices.reduce(
        (sum, service) => sum + service.outstanding,
        0
      ),
    });
  } catch (error) {
    console.error("Error fetching outstanding services:", error);
    return NextResponse.json(
      { error: "Không thể tải dịch vụ còn nợ" },
      { status: 500 }
    );
  }
}
