// src/app/api/clinics/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

export async function GET() {
  try {
    // Get unique clinic IDs from payment vouchers and consulted services
    const [paymentClinics, serviceClinics] = await Promise.all([
      prisma.paymentVoucher.findMany({
        where: {
          clinicId: {
            not: undefined,
          },
        },
        select: {
          clinicId: true,
        },
        distinct: ["clinicId"],
      }),
      prisma.consultedService.findMany({
        where: {
          clinicId: {
            not: undefined,
          },
        },
        select: {
          clinicId: true,
        },
        distinct: ["clinicId"],
      }),
    ]);

    // Combine and deduplicate clinic IDs
    const allClinicIds = new Set([
      ...paymentClinics.map((p) => p.clinicId).filter(Boolean),
      ...serviceClinics.map((s) => s.clinicId).filter(Boolean),
    ]);

    // Transform to response format
    const clinics = Array.from(allClinicIds).map((clinicId) => ({
      id: clinicId,
      name: clinicId, // Use raw clinic ID as name
    }));

    return NextResponse.json(clinics);
  } catch (error) {
    console.error("Error fetching clinics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
