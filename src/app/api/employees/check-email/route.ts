// src/app/api/employees/check-email/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ exists: false }, { status: 400 });
  }

  const employee = await prisma.employee.findUnique({
    where: { email: email.toLowerCase() },
  });

  return NextResponse.json({ exists: !!employee });
}
