// src/app/api/customers/detail/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Thiếu ID khách hàng" }, { status: 400 });
  }

  try {
    const customerDetails = await prisma.customer.findUnique({
      where: { id },
      include: {
        // Lấy các thông tin liên quan
        primaryContact: true, // Lấy thông tin người liên hệ chính
        appointments: {
          orderBy: { appointmentDateTime: "desc" },
          include: {
            customer: true,
            primaryDentist: true,
            secondaryDentist: true,
          },
        },
        consultedServices: {
          orderBy: { consultationDate: "desc" },
          include: {
            dentalService: true,
          },
        },
        treatmentLogs: {
          orderBy: { treatmentDate: "desc" },
          include: {
            dentist: true,
          },
        },
        paymentVouchers: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!customerDetails) {
      return NextResponse.json(
        { error: "Không tìm thấy khách hàng" },
        { status: 404 }
      );
    }

    return NextResponse.json(customerDetails);
  } catch (error: any) {
    console.error("Lỗi lấy chi tiết khách hàng:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
