// src/app/api/customers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { Prisma } from "@prisma/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
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
    },
  });
  if (!customer)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(customer);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
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
  { params }: { params: { id: string } }
) {
  try {
    await prisma.customer.delete({ where: { id: params.id } });
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
