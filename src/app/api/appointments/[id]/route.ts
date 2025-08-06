// src/app/api/appointments/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import dayjs from "dayjs";
import { nowVN } from "@/utils/date";

// GET single appointment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, fullName: true, phone: true } },
        primaryDentist: { select: { id: true, fullName: true } },
        secondaryDentist: { select: { id: true, fullName: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Không tìm thấy lịch hẹn" },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE appointment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Lấy thông tin lịch hẹn hiện tại
    const currentAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: { select: { fullName: true } },
      },
    });

    if (!currentAppointment) {
      return NextResponse.json(
        { error: "Không tìm thấy lịch hẹn" },
        { status: 404 }
      );
    }

    // ✅ VALIDATION: Kiểm tra edit restrictions cho today's appointments
    const isToday = dayjs(currentAppointment.appointmentDateTime).isSame(
      dayjs(),
      "day"
    );

    if (isToday) {
      // ✅ So sánh values thay vì chỉ check field existence
      const restrictedChanges = [];

      // Kiểm tra thay đổi customerId
      if (
        data.customerId &&
        data.customerId !== currentAppointment.customerId
      ) {
        restrictedChanges.push("customerId");
      }

      // Kiểm tra thay đổi appointmentDateTime
      if (
        data.appointmentDateTime &&
        !dayjs(data.appointmentDateTime).isSame(
          dayjs(currentAppointment.appointmentDateTime),
          "minute"
        )
      ) {
        restrictedChanges.push("appointmentDateTime");
      }

      // Kiểm tra thay đổi duration
      if (
        data.duration !== undefined &&
        data.duration !== currentAppointment.duration
      ) {
        restrictedChanges.push("duration");
      }

      // Kiểm tra thay đổi clinicId
      if (data.clinicId && data.clinicId !== currentAppointment.clinicId) {
        restrictedChanges.push("clinicId");
      }

      // Kiểm tra thay đổi status (trừ khi được phép)
      if (data.status && data.status !== currentAppointment.status) {
        restrictedChanges.push("status");
      }

      if (restrictedChanges.length > 0) {
        return NextResponse.json(
          {
            error: `Lịch hẹn hôm nay chỉ được sửa bác sĩ và ghi chú. Không được sửa: ${restrictedChanges.join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }
    }

    // ✅ VALIDATION 1: Không được sửa lịch trong quá khứ
    const currentAppointmentTime = dayjs(
      currentAppointment.appointmentDateTime
    );
    if (currentAppointmentTime.isBefore(dayjs(), "day")) {
      return NextResponse.json(
        { error: "Không thể sửa lịch hẹn trong quá khứ!" },
        { status: 400 }
      );
    }

    // ✅ VALIDATION 2: Nếu thay đổi thời gian, kiểm tra validation
    if (data.appointmentDateTime) {
      const newAppointmentDate = dayjs(data.appointmentDateTime);

      // Không được đặt lịch trong quá khứ
      if (newAppointmentDate.isBefore(dayjs(), "minute")) {
        return NextResponse.json(
          { error: "Không thể đặt lịch hẹn trong quá khứ!" },
          { status: 400 }
        );
      }

      // Kiểm tra xem khách hàng đã có lịch khác trong ngày mới chưa (trừ lịch hiện tại)
      const startOfDay = newAppointmentDate.startOf("day").format();
      const endOfDay = newAppointmentDate.endOf("day").format();

      const conflictAppointment = await prisma.appointment.findFirst({
        where: {
          customerId: currentAppointment.customerId,
          appointmentDateTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
          id: { not: id }, // Loại trừ lịch hẹn hiện tại
        },
      });

      if (conflictAppointment) {
        return NextResponse.json(
          {
            error: `Khách hàng ${
              currentAppointment.customer.fullName
            } đã có lịch hẹn khác vào ngày ${newAppointmentDate.format(
              "DD/MM/YYYY"
            )}!`,
          },
          { status: 400 }
        );
      }
    }

    // ✅ RESCHEDULE LOGIC: Nếu thay đổi appointmentDateTime → Reset status về "Chờ xác nhận"
    const updateData = { ...data };
    if (
      data.appointmentDateTime &&
      !dayjs(data.appointmentDateTime).isSame(
        currentAppointment.appointmentDateTime
      )
    ) {
      // Chỉ reset status nếu appointment chưa check-in
      if (!currentAppointment.checkInTime) {
        updateData.status = "Chờ xác nhận";
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: nowVN(),
      },
      include: {
        customer: { select: { id: true, fullName: true, phone: true } },
        primaryDentist: { select: { id: true, fullName: true } },
        secondaryDentist: { select: { id: true, fullName: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Lấy thông tin lịch hẹn để kiểm tra
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: { select: { fullName: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Không tìm thấy lịch hẹn" },
        { status: 404 }
      );
    }

    // ✅ VALIDATION: Không được xóa lịch trong quá khứ
    const appointmentTime = dayjs(appointment.appointmentDateTime);
    if (appointmentTime.isBefore(dayjs(), "day")) {
      return NextResponse.json(
        { error: "Không thể xóa lịch hẹn trong quá khứ!" },
        { status: 400 }
      );
    }

    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa lịch hẹn của ${appointment.customer.fullName}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
