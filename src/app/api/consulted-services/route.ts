// src/app/api/consulted-services/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate dữ liệu đầu vào
    if (!data.customerId || !data.dentalServiceId || !data.clinicId) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc (khách hàng, dịch vụ, chi nhánh)" },
        { status: 400 }
      );
    }

    // ✅ BUSINESS LOGIC: Kiểm tra khách hàng đã check-in hôm nay chưa
    const today = dayjs().startOf("day").toDate();
    const endOfDay = dayjs().endOf("day").toDate();

    const checkedInAppointment = await prisma.appointment.findFirst({
      where: {
        customerId: data.customerId,
        appointmentDateTime: {
          gte: today,
          lte: endOfDay,
        },
        checkInTime: { not: null }, // Đã check-in
      },
      include: {
        customer: { select: { fullName: true } },
      },
    });

    if (!checkedInAppointment) {
      return NextResponse.json(
        {
          error:
            "Khách hàng chưa check-in hôm nay. Vui lòng check-in trước khi tạo dịch vụ tư vấn!",
          needsCheckin: true,
        },
        { status: 400 }
      );
    }

    // ✅ Lấy thông tin DentalService để copy dữ liệu
    const dentalService = await prisma.dentalService.findUnique({
      where: { id: data.dentalServiceId },
    });

    if (!dentalService) {
      return NextResponse.json(
        { error: "Không tìm thấy dịch vụ nha khoa" },
        { status: 404 }
      );
    }

    // ✅ Tạo consulted service với appointmentId từ lịch đã check-in
    const consultedServiceData = {
      ...data,
      appointmentId: checkedInAppointment.id, // ✅ GẮN VÀO APPOINTMENT ĐÃ CHECK-IN

      // Copy dữ liệu từ DentalService (denormalized)
      consultedServiceName: dentalService.name,
      consultedServiceUnit: dentalService.unit,
      price: dentalService.price,
      preferentialPrice: data.preferentialPrice || dentalService.price,
      finalPrice:
        (data.preferentialPrice || dentalService.price) * (data.quantity || 1),
      debt:
        (data.preferentialPrice || dentalService.price) * (data.quantity || 1), // Ban đầu chưa trả
    };

    const newConsultedService = await prisma.consultedService.create({
      data: consultedServiceData,
      include: {
        customer: { select: { id: true, fullName: true } },
        dentalService: { select: { id: true, name: true, unit: true } },
        consultingDoctor: { select: { id: true, fullName: true } },
        consultingSale: { select: { id: true, fullName: true } },
        treatingDoctor: { select: { id: true, fullName: true } },
        Appointment: {
          select: {
            id: true,
            appointmentDateTime: true,
            checkInTime: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        ...newConsultedService,
        message: `Đã tạo dịch vụ tư vấn cho khách hàng ${checkedInAppointment.customer.fullName}`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Lỗi khi tạo dịch vụ tư vấn:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
