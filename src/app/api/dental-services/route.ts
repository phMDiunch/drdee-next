// src/app/api/dental-services/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/services/prismaClient";

export async function GET() {
  const data = await prisma.dentalService.findMany();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(body);

    const newService = await prisma.dentalService.create({ data: body });
    return NextResponse.json(newService);
  } catch (error: any) {
    console.error(error); 
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
