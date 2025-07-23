import { NextResponse } from 'next/server';
import { prisma } from '@/services/prismaClient';

// Lấy danh sách nhân viên
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lấy danh sách nhân viên' }, { status: 500 });
  }
}

// Thêm mới nhân viên
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Bạn nên kiểm tra và validate data ở đây (email, phone,...)

    const employee = await prisma.employee.create({
      data,
    });
    return NextResponse.json(employee, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi tạo nhân viên' }, { status: 500 });
  }
}
