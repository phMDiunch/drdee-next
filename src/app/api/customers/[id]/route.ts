// src/app/api/customers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get("includeDetails") === "true";

    // ✅ Conditional includes based on query param
    const include = includeDetails
      ? {
          // Full details for CustomerDetailPage
          primaryContact: true,
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
            include: {
              customer: {
                select: {
                  id: true,
                  fullName: true, // ✅ THÊM
                  customerCode: true, // ✅ THÊM
                },
              },
              cashier: { select: { id: true, fullName: true } },
              details: {
                include: {
                  consultedService: {
                    select: {
                      id: true,
                      consultedServiceName: true, // ✅ THÊM
                      finalPrice: true, // ✅ THÊM
                      dentalService: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }
      : {
          // Basic includes for simple operations
          primaryContact: {
            select: {
              id: true,
              customerCode: true,
              fullName: true,
              phone: true,
            },
          },
          paymentVouchers: {
            include: {
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
            orderBy: { createdAt: "desc" },
          },
        };

    const customer = await prisma.customer.findUnique({
      where: { id },
      include,
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Không tìm thấy khách hàng" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error("Lỗi lấy thông tin khách hàng:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // --- Lấy thông tin khách cũ ---
    const oldCustomer = await prisma.customer.findUnique({
      where: { id },
      select: {
        customerCode: true,
      },
    });
    if (!oldCustomer) {
      return NextResponse.json(
        { error: "Khách hàng không tồn tại!" },
        { status: 404 }
      );
    }

    // --- Không cho phép sửa mã khách hàng ---
    data.customerCode = oldCustomer.customerCode;

    // --- Tự động cập nhật fullName_lowercase, searchKeywords ---
    if (data.fullName) {
      data.fullName_lowercase = data.fullName.toLowerCase().trim();
    }
    data.searchKeywords = [
      data.customerCode?.toLowerCase(),
      data.fullName_lowercase,
      data.phone,
      data.email?.toLowerCase(),
    ].filter(Boolean);

    // --- Thực hiện update ---
    const updated = await prisma.customer.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return handlePrismaError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- Hàm xử lý lỗi Prisma (dùng chung) ---
function handlePrismaError(error: any) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const fields = Array.isArray(error.meta?.target)
      ? error.meta.target
      : [error.meta?.target || ""];
    const fieldLabel: Record<string, string> = {
      phone: "Số điện thoại",
      email: "Email",
      customerCode: "Mã khách hàng",
    };
    const msg =
      "Trùng dữ liệu: " + fields.map((f) => fieldLabel[f] || f).join(", ");
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ error: error.message }, { status: 500 });
}
