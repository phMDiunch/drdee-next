// src/app/api/treatment-cares/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
const VN_TZ = "Asia/Ho_Chi_Minh";

function getHeader(req: NextRequest, key: string) {
  return req.headers.get(key) || undefined;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const role = getHeader(request, "x-employee-role");
    const employeeId = getHeader(request, "x-employee-id");

    const record = await prisma.treatmentCare.findUnique({ where: { id } });
    if (!record)
      return NextResponse.json(
        { error: "Không tìm thấy bản ghi" },
        { status: 404 }
      );

    if (role !== "admin") {
      // Non-admin: only delete own records and only on the same VN day
      if (!employeeId || record.careStaffId !== employeeId) {
        return NextResponse.json(
          { error: "Không có quyền xóa" },
          { status: 403 }
        );
      }
      const nowVN = dayjs().tz(VN_TZ);
      const careDay = dayjs(record.careAt).tz(VN_TZ);
      if (!careDay.isSame(nowVN, "day")) {
        return NextResponse.json(
          { error: "Chỉ được xóa trong ngày tạo" },
          { status: 403 }
        );
      }
    }

    await prisma.treatmentCare.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const isKnown = error instanceof Prisma.PrismaClientKnownRequestError;
    if (isKnown && error.code === "P2021") {
      return NextResponse.json(
        {
          error:
            "Bảng TreatmentCare chưa được migrate. Vui lòng triển khai migration trước.",
        },
        { status: 503 }
      );
    }
    console.error("treatment-cares DELETE", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
