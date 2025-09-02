// src/app/api/suppliers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

function getEmployeeId(req: NextRequest): string | null {
  return req.headers.get("x-employee-id");
}

// GET /api/suppliers/[id] - Get supplier by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { id: true, fullName: true },
        },
        updatedBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Không tìm thấy nhà cung cấp" },
        { status: 404 }
      );
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return NextResponse.json(
      { error: "Không thể tải thông tin nhà cung cấp" },
      { status: 500 }
    );
  }
}

// PUT /api/suppliers/[id] - Update supplier
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = getEmployeeId(request);
    if (!employeeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Check if supplier exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id: params.id },
    });

    if (!existingSupplier) {
      return NextResponse.json(
        { error: "Không tìm thấy nhà cung cấp" },
        { status: 404 }
      );
    }

    // Check for duplicate email if provided and different from current
    if (body.email && body.email !== existingSupplier.email) {
      const existingEmail = await prisma.supplier.findFirst({
        where: {
          email: body.email,
          id: { not: params.id },
        },
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: "Email này đã được sử dụng" },
          { status: 400 }
        );
      }
    }

    // Check for duplicate tax ID if provided and different from current
    if (body.taxId && body.taxId !== existingSupplier.taxId) {
      const existingTaxId = await prisma.supplier.findFirst({
        where: {
          taxId: body.taxId,
          id: { not: params.id },
        },
      });
      if (existingTaxId) {
        return NextResponse.json(
          { error: "Mã số thuế này đã được sử dụng" },
          { status: 400 }
        );
      }
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id: params.id },
      data: {
        ...body,
        updatedById: employeeId,
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true },
        },
        updatedBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật nhà cung cấp" },
      { status: 500 }
    );
  }
}

// DELETE /api/suppliers/[id] - Delete/deactivate supplier
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = getEmployeeId(request);
    if (!employeeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if supplier exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id: params.id },
    });

    if (!existingSupplier) {
      return NextResponse.json(
        { error: "Không tìm thấy nhà cung cấp" },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    const updatedSupplier = await prisma.supplier.update({
      where: { id: params.id },
      data: {
        isActive: false,
        updatedById: employeeId,
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true },
        },
        updatedBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json(
      { error: "Không thể xóa nhà cung cấp" },
      { status: 500 }
    );
  }
}
