// src/app/api/dental-services/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

export async function PUT(request: NextRequest, { params }) {
  const body = await request.json();
  const updated = await prisma.dentalService.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }) {
  await prisma.dentalService.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
