// src/app/api/treatment-cares/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";
import { Prisma, TreatmentCareStatus } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
const VN_TZ = "Asia/Ho_Chi_Minh";

function getHeader(req: NextRequest, key: string) {
  return req.headers.get(key) || undefined;
}

function parseBool(input: string | null): boolean | undefined {
  if (input == null) return undefined;
  const v = input.trim().toLowerCase();
  if (["1", "true", "yes"].includes(v)) return true;
  if (["0", "false", "no"].includes(v)) return false;
  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId") || undefined;
    const from = searchParams.get("from"); // YYYY-MM-DD
    const to = searchParams.get("to"); // YYYY-MM-DD
    const groupBy = searchParams.get("groupBy"); // "day" | undefined
    const onlyMine = parseBool(searchParams.get("onlyMine"));
    const clinicIdFilter = searchParams.get("clinicId") || undefined;

    const role = getHeader(request, "x-employee-role");
    const employeeId = getHeader(request, "x-employee-id");
    const profileClinicId = getHeader(request, "x-clinic-id");

    const clinicId =
      role && role !== "admin"
        ? profileClinicId
        : clinicIdFilter || profileClinicId;

    if (customerId) {
      // Per-customer history, newest first
      const records = await prisma.treatmentCare.findMany({
        where: {
          customerId,
          ...(clinicId ? { clinicId } : {}),
          ...(onlyMine && employeeId ? { careStaffId: employeeId } : {}),
        },
        include: {
          careStaff: { select: { id: true, fullName: true } },
        },
        orderBy: { careAt: "desc" },
      });
      return NextResponse.json(records);
    }

    const toDay = to ? dayjs.tz(to, VN_TZ) : dayjs().tz(VN_TZ);
    const fromDay = from ? dayjs.tz(from, VN_TZ) : toDay.subtract(34, "day");

    const where: Prisma.TreatmentCareWhereInput = {
      careAt: {
        gte: fromDay.startOf("day").toDate(),
        lte: toDay.endOf("day").toDate(),
      },
      ...(clinicId ? { clinicId } : {}),
      ...(onlyMine && employeeId ? { careStaffId: employeeId } : {}),
    };

    const records = await prisma.treatmentCare.findMany({
      where,
      include: {
        customer: {
          select: { id: true, customerCode: true, fullName: true, phone: true },
        },
        careStaff: { select: { id: true, fullName: true } },
      },
      orderBy: { careAt: "desc" },
    });

    if ((groupBy || "day").toLowerCase() === "day") {
      const groups: Record<string, typeof records> = {} as Record<
        string,
        typeof records
      >;
      for (const r of records) {
        const key = dayjs(r.careAt).tz(VN_TZ).format("YYYY-MM-DD");
        if (!groups[key]) groups[key] = [] as unknown as typeof records;
        groups[key].push(r);
      }
      const payload = Object.keys(groups)
        .sort((a, b) => (a < b ? 1 : -1))
        .map((day) => ({ day, items: groups[day] }));
      return NextResponse.json(payload);
    }

    return NextResponse.json(records);
  } catch (error) {
    console.error("treatment-cares GET", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, treatmentDate, careAt, careStatus, careContent } =
      body as {
        customerId?: string;
        treatmentDate?: string; // YYYY-MM-DD
        careAt?: string; // ISO or parseable
        careStatus?: TreatmentCareStatus | string;
        careContent?: string;
      };

    // role reserved for v2 authorization; v1 uses employeeId and clinic headers
    const employeeId = getHeader(request, "x-employee-id");
    const profileClinicId = getHeader(request, "x-clinic-id");

    if (!employeeId)
      return NextResponse.json(
        { error: "Thiếu danh tính nhân viên" },
        { status: 401 }
      );

    if (
      !customerId ||
      !treatmentDate ||
      !careAt ||
      !careStatus ||
      !careContent
    ) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    const careAtDt = dayjs(careAt).tz(VN_TZ);
    const treatmentDay = dayjs.tz(treatmentDate, VN_TZ);

    if (careAtDt.isBefore(treatmentDay.startOf("day"))) {
      return NextResponse.json(
        { error: "careAt phải cùng ngày hoặc sau treatmentDate" },
        { status: 400 }
      );
    }

    // Verify there exists at least one TreatmentLog on treatmentDate (VN day)
    const tStart = treatmentDay.startOf("day").toDate();
    const tEnd = treatmentDay.endOf("day").toDate();

    const logs = await prisma.treatmentLog.findMany({
      where: {
        customerId,
        treatmentDate: {
          gte: tStart,
          lte: tEnd,
        },
      },
      include: {
        consultedService: { select: { consultedServiceName: true } },
        dentist: { select: { id: true, fullName: true } },
      },
    });

    if (logs.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy TreatmentLog cho ngày điều trị" },
        { status: 422 }
      );
    }

    // Build snapshots
    const serviceSet = new Set<string>();
    const doctorNameSet = new Set<string>();
    const doctorIdSet = new Set<string>();
    const clinicIdSet = new Set<string>();

    for (const l of logs) {
      if (l.consultedService?.consultedServiceName)
        serviceSet.add(l.consultedService.consultedServiceName.trim());
      if (l.dentist?.fullName) doctorNameSet.add(l.dentist.fullName.trim());
      if (l.dentist?.id) doctorIdSet.add(l.dentist.id);
      if (l.clinicId) clinicIdSet.add(l.clinicId);
    }

    // Determine clinicId for record: prefer header clinic, else fallback to employee.clinicId
    let clinicId = profileClinicId;
    if (!clinicId) {
      const emp = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { clinicId: true },
      });
      clinicId = emp?.clinicId || undefined;
    }
    if (!clinicId) {
      return NextResponse.json(
        { error: "Không xác định được clinicId của nhân viên" },
        { status: 400 }
      );
    }

    // Coerce careStatus to enum
    const statusValue =
      typeof careStatus === "string"
        ? (careStatus.toUpperCase() as TreatmentCareStatus)
        : careStatus;
    if (
      !Object.values(TreatmentCareStatus).includes(
        statusValue as TreatmentCareStatus
      )
    ) {
      return NextResponse.json(
        { error: "Giá trị careStatus không hợp lệ" },
        { status: 400 }
      );
    }

    const created = await prisma.treatmentCare.create({
      data: {
        customerId,
        clinicId,
        careStaffId: employeeId,
        treatmentDate: treatmentDay.startOf("day").toDate(),
        careAt: careAtDt.toDate(),
        careStatus: statusValue as TreatmentCareStatus,
        careContent,
        treatmentServiceNames: Array.from(serviceSet),
        treatingDoctorNames: Array.from(doctorNameSet),
        treatingDoctorIds: Array.from(doctorIdSet),
        treatmentClinicIds: Array.from(clinicIdSet),
        createdById: employeeId,
        updatedById: employeeId,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("treatment-cares POST", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
