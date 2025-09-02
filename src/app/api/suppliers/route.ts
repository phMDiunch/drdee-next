// src/app/api/suppliers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

function getEmployeeId(req: NextRequest): string | null {
  return req.headers.get("x-employee-id");
}

// GET /api/suppliers - List suppliers with basic filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search");
    const categoryType = searchParams.get("categoryType");
    const isActive = searchParams.get("isActive");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { supplierCode: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { contactPerson: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryType) {
      where.categoryType = categoryType;
    }

    if (isActive === "true") {
      where.isActive = true;
    } else if (isActive === "false") {
      where.isActive = false;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, fullName: true },
          },
          updatedBy: {
            select: { id: true, fullName: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.supplier.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: suppliers,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { error: "Không thể tải danh sách nhà cung cấp" },
      { status: 500 }
    );
  }
}

// POST /api/suppliers - Create new supplier
export async function POST(request: NextRequest) {
  try {
    const employeeId = getEmployeeId(request);
    if (!employeeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.categoryType) {
      return NextResponse.json(
        { error: "Tên nhà cung cấp và loại là bắt buộc" },
        { status: 400 }
      );
    }

    // Check for duplicate email if provided
    if (body.email) {
      const existingEmail = await prisma.supplier.findFirst({
        where: { email: body.email },
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: "Email này đã được sử dụng" },
          { status: 400 }
        );
      }
    }

    // Check for duplicate tax ID if provided
    if (body.taxId) {
      const existingTaxId = await prisma.supplier.findFirst({
        where: { taxId: body.taxId },
      });
      if (existingTaxId) {
        return NextResponse.json(
          { error: "Mã số thuế này đã được sử dụng" },
          { status: 400 }
        );
      }
    }

    // Generate supplier code
    const supplierCode = await generateSupplierCode();

    const supplier = await prisma.supplier.create({
      data: {
        ...body,
        supplierCode,
        createdById: employeeId,
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

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { error: "Không thể tạo nhà cung cấp mới" },
      { status: 500 }
    );
  }
}

// Helper function to generate supplier code
async function generateSupplierCode(): Promise<string> {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, "0");

  // Find the latest supplier code for this month
  const prefix = `NCC${year}${month}`;
  const latestSupplier = await prisma.supplier.findFirst({
    where: {
      supplierCode: {
        startsWith: prefix,
      },
    },
    orderBy: {
      supplierCode: "desc",
    },
  });

  let sequence = 1;
  if (latestSupplier?.supplierCode) {
    const currentSequence = parseInt(latestSupplier.supplierCode.slice(-3));
    if (!isNaN(currentSequence)) {
      sequence = currentSequence + 1;
    }
  }

  return `${prefix}${sequence.toString().padStart(3, "0")}`;
}
