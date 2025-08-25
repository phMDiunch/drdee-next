// src/app/api/consulted-services/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

const VN_TZ = "Asia/Ho_Chi_Minh";

// ✅ GET method for ConsultedServiceDailyPage
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // YYYY-MM-DD format
    const clinicId = searchParams.get("clinicId");
    const customerId = searchParams.get("customerId"); // ✅ THÊM support cho customerId
    const consultingDoctorId = searchParams.get("consultingDoctorId"); // ✅ THÊM: Filter theo consulting doctor
    const consultingSaleId = searchParams.get("consultingSaleId"); // ✅ THÊM: Filter theo consulting sale

    // ✅ SỬA: Nếu có customerId hoặc consultingDoctorId/consultingSaleId thì không cần date
    if (!date && !customerId && !consultingDoctorId && !consultingSaleId) {
      return NextResponse.json(
        {
          error:
            "Thiếu tham số date, customerId hoặc consultingDoctorId/consultingSaleId",
        },
        { status: 400 }
      );
    }

    const whereCondition: Record<string, unknown> = {};

    // ✅ THÊM: Filter theo customerId
    if (customerId) {
      whereCondition.customerId = customerId;
    }

    // ✅ THÊM: Filter theo consulting doctor hoặc sale
    if (consultingDoctorId || consultingSaleId) {
      const orConditions: Record<string, unknown>[] = [];

      if (consultingDoctorId) {
        orConditions.push({ consultingDoctorId: consultingDoctorId });
      }

      if (consultingSaleId) {
        orConditions.push({ consultingSaleId: consultingSaleId });
      }

      whereCondition.OR = orConditions;
    }

    // ✅ THÊM: Filter theo customerId
    if (customerId) {
      whereCondition.customerId = customerId;
    }

    // Filter theo date nếu có
    if (date) {
      // Tạo start và end của ngày với timezone VN
      const startOfDay = dayjs(date).tz(VN_TZ).startOf("day").format();
      const endOfDay = dayjs(date).tz(VN_TZ).endOf("day").format();

      whereCondition.consultationDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // Filter theo clinicId nếu có
    if (clinicId) {
      whereCondition.clinicId = clinicId;
    }

    const consultedServices = await prisma.consultedService.findMany({
      where: whereCondition,
      include: {
        customer: {
          select: {
            id: true,
            customerCode: true,
            fullName: true,
            phone: true,
          },
        },
        dentalService: {
          select: {
            id: true,
            name: true,
            unit: true,
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
        consultingSale: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        consultationDate: "asc",
      },
    });

    console.log(
      `🦷 Found ${consultedServices.length} consulted services for ${
        customerId ? `customer ${customerId}` : `date ${date}`
      }`
    );

    // ✅ FIX: Nếu có customerId thì wrap trong object data, còn không thì return array trực tiếp
    if (customerId) {
      return NextResponse.json({ data: consultedServices });
    } else {
      return NextResponse.json(consultedServices); // ✅ Tương thích ngược với consulted-services-daily page
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("GET consulted services error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

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
    const startOfDay = dayjs().tz(VN_TZ).startOf("day").format();
    const endOfDay = dayjs().tz(VN_TZ).endOf("day").format();

    const checkedInAppointment = await prisma.appointment.findFirst({
      where: {
        customerId: data.customerId,
        appointmentDateTime: {
          gte: startOfDay,
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
    const preferentialPriceValue =
      data.preferentialPrice !== undefined
        ? data.preferentialPrice
        : dentalService.price;

    const finalPriceValue = preferentialPriceValue * (data.quantity || 1);

    console.log("💰 Price calculation in POST:", {
      serviceId: data.dentalServiceId,
      serviceName: dentalService.name,
      originalPrice: dentalService.price,
      requestedPreferentialPrice: data.preferentialPrice,
      finalPreferentialPrice: preferentialPriceValue,
      quantity: data.quantity || 1,
      calculatedFinalPrice: finalPriceValue,
      isPreferentialPriceZero: data.preferentialPrice === 0,
    });

    const consultedServiceData = {
      ...data,
      appointmentId: checkedInAppointment.id, // ✅ GẮN VÀO APPOINTMENT ĐÃ CHECK-IN

      // Copy dữ liệu từ DentalService (denormalized)
      consultedServiceName: dentalService.name,
      consultedServiceUnit: dentalService.unit,
      price: dentalService.price,

      // ✅ FIXED: Handle preferentialPrice = 0 correctly
      preferentialPrice: preferentialPriceValue,

      // ✅ FIXED: Calculate finalPrice with correct preferentialPrice
      finalPrice: finalPriceValue,

      // ✅ FIXED: Calculate debt with correct preferentialPrice
      debt: finalPriceValue, // Ban đầu chưa trả
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
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Lỗi khi tạo dịch vụ tư vấn:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
