// src/app/api/consulted-services/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { nowVN, calculateDaysSinceConfirm } from "@/utils/date";

// ✅ GET single consulted service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const consultedService = await prisma.consultedService.findUnique({
      where: { id },
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
    });

    if (!consultedService) {
      return NextResponse.json(
        { error: "Không tìm thấy dịch vụ tư vấn" },
        { status: 404 }
      );
    }

    return NextResponse.json(consultedService);
  } catch (error: unknown) {
    console.error("Error fetching consulted service:", error);
    return NextResponse.json(
      { error: "Lỗi server khi tải dịch vụ tư vấn" },
      { status: 500 }
    );
  }
}

// --- HÀM CẬP NHẬT (SỬA) ---
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // ✅ Kiểm tra dịch vụ đã chốt chưa
    const existingService = await prisma.consultedService.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Không tìm thấy dịch vụ" },
        { status: 404 }
      );
    }

    if (existingService.serviceStatus === "Đã chốt") {
      return NextResponse.json(
        { error: "Không thể sửa dịch vụ đã chốt!" },
        { status: 400 }
      );
    }

    // ✅ NEW: Check permission for employee fields if service is confirmed
    const hasEmployeeFieldChanges = [
      "consultingDoctorId",
      "treatingDoctorId",
      "consultingSaleId",
    ].some((field) => field in data);

    if (
      hasEmployeeFieldChanges &&
      existingService.serviceStatus === "Đã chốt" &&
      existingService.serviceConfirmDate
    ) {
      // Get current user role from updatedById
      const currentUserId = data.updatedById;
      if (currentUserId) {
        const currentUser = await prisma.employee.findUnique({
          where: { id: currentUserId },
          select: { role: true },
        });

        if (currentUser?.role !== "admin") {
          // Check 33 days rule với VN timezone
          const confirmDateStr =
            typeof existingService.serviceConfirmDate === "string"
              ? existingService.serviceConfirmDate
              : existingService.serviceConfirmDate.toISOString();
          const daysSinceConfirm = calculateDaysSinceConfirm(confirmDateStr);

          if (daysSinceConfirm > 33) {
            return NextResponse.json(
              {
                error:
                  "Không có quyền sửa thông tin nhân sự sau 33 ngày từ ngày chốt",
              },
              { status: 403 }
            );
          }
        }
      }
    }

    // Tiếp tục logic update...
    const updated = await prisma.consultedService.update({
      where: { id },
      data: {
        ...data,
        updatedAt: nowVN(),
      },
      include: {
        customer: { select: { id: true, fullName: true } },
        dentalService: { select: { id: true, name: true, unit: true } },
        consultingDoctor: { select: { id: true, fullName: true } },
        consultingSale: { select: { id: true, fullName: true } },
        treatingDoctor: { select: { id: true, fullName: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to get header value
function getHeader(req: NextRequest, key: string) {
  return req.headers.get(key) || undefined;
}

// --- HÀM XÓA ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ✅ NEW: Get user role from headers
    const role = getHeader(request, "x-employee-role");
    const isAdmin = role === "admin";

    // ✅ NEW: Check if service is confirmed before allowing delete
    const existingService = await prisma.consultedService.findUnique({
      where: { id },
      select: {
        serviceStatus: true,
        consultedServiceName: true,
        customer: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Không tìm thấy dịch vụ" },
        { status: 404 }
      );
    }

    // ✅ UPDATED: Only allow admin to delete confirmed services
    if (existingService.serviceStatus === "Đã chốt" && !isAdmin) {
      return NextResponse.json(
        { error: "Không thể xóa dịch vụ đã chốt! Chỉ admin mới có quyền này." },
        { status: 403 } // 403 Forbidden for permission denied
      );
    }

    await prisma.consultedService.delete({
      where: { id },
    });

    const message =
      existingService.serviceStatus === "Đã chốt"
        ? `Admin đã xóa dịch vụ đã chốt: "${existingService.consultedServiceName}" của khách hàng "${existingService.customer?.fullName}"`
        : `Đã xóa dịch vụ: "${existingService.consultedServiceName}"`;

    console.log(`🗑️ DELETE Service: ${message}`, {
      serviceId: id,
      serviceName: existingService.consultedServiceName,
      serviceStatus: existingService.serviceStatus,
      deletedBy: isAdmin ? "admin" : "regular user",
      customerName: existingService.customer?.fullName,
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error: any) {
    console.error("Lỗi khi xóa dịch vụ tư vấn:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- HÀM CHỐT DỊCH VỤ ---
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Kiểm tra service có tồn tại không
    const existingService = await prisma.consultedService.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Không tìm thấy dịch vụ" },
        { status: 404 }
      );
    }

    // Kiểm tra service đã chốt chưa
    if (existingService.serviceStatus === "Đã chốt") {
      return NextResponse.json(
        { error: "Dịch vụ đã được chốt trước đó" },
        { status: 400 }
      );
    }

    // Cập nhật service
    const now = nowVN();
    const updatedService = await prisma.consultedService.update({
      where: { id },
      data: {
        serviceStatus: "Đã chốt",
        serviceConfirmDate: now,
        updatedById: body.updatedById,
        updatedAt: now,
      },
    });

    return NextResponse.json(updatedService);
  } catch (error: any) {
    console.error("Lỗi khi chốt dịch vụ:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
