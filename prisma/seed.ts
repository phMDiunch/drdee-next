// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu seed dữ liệu...");

  // ========================================
  // 1. XÓA DỮ LIỆU CŨ (theo thứ tự dependency)
  // ========================================
  console.log("🧹 Xóa dữ liệu cũ...");

  await prisma.paymentVoucherDetail.deleteMany();
  await prisma.paymentVoucher.deleteMany();
  await prisma.treatmentLog.deleteMany();
  await prisma.consultedService.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.dentalService.deleteMany();
  await prisma.employee.deleteMany();

  // ========================================
  // 2. TẠO EMPLOYEES (Nhân viên)
  // ========================================
  console.log("👥 Tạo nhân viên...");

  const employees = await Promise.all([
    // Admin/Manager
    prisma.employee.create({
      data: {
        email: "admin@drdee.vn",
        role: "admin",
        employeeCode: "ADMIN001",
        fullName: "Dr. Nguyễn Văn An",
        phone: "0901234567",
        gender: "Nam",
        employmentStatus: "Đang làm việc",
        department: "Tổng hợp",
        title: "Bác sĩ",
        position: "Giám đốc",
        currentAddress: "123 Đường Lê Lợi, Q1, TP.HCM",
        avatarUrl: null,
        dob: new Date("1980-05-15"),
      },
    }),

    // Bác sĩ 1
    prisma.employee.create({
      data: {
        email: "bs.linh@drdee.vn",
        role: "employee",
        employeeCode: "BS002",
        fullName: "Dr. Trần Thị Linh",
        phone: "0901234568",
        gender: "Nữ",
        employmentStatus: "Đang làm việc",
        department: "Răng hàm mặt",
        title: "Bác sĩ",
        position: "Bác sĩ chính",
        currentAddress: "456 Đường Nguyễn Huệ, Q1, TP.HCM",
        dob: new Date("1985-08-20"),
      },
    }),

    // Bác sĩ 2
    prisma.employee.create({
      data: {
        email: "bs.duc@drdee.vn",
        role: "employee",
        employeeCode: "BS003",
        fullName: "Dr. Lê Minh Đức",
        phone: "0901234569",
        gender: "Nam",
        employmentStatus: "Đang làm việc",
        department: "Nha chu",
        title: "Bác sĩ",
        position: "Bác sĩ",
        currentAddress: "789 Đường Điện Biên Phủ, Q3, TP.HCM",
        dob: new Date("1988-12-10"),
      },
    }),

    // Điều dưỡng 1
    prisma.employee.create({
      data: {
        email: "dd.mai@drdee.vn",
        role: "employee",
        employeeCode: "DD004",
        fullName: "Nguyễn Thị Mai",
        phone: "0901234570",
        gender: "Nữ",
        employmentStatus: "Đang làm việc",
        department: "Tổng hợp",
        title: "Điều dưỡng",
        position: "Điều dưỡng trưởng",
        currentAddress: "321 Đường Võ Văn Tần, Q3, TP.HCM",
        dob: new Date("1990-03-25"),
      },
    }),

    // Lễ tân
    prisma.employee.create({
      data: {
        email: "lt.vy@drdee.vn",
        role: "employee",
        employeeCode: "LT005",
        fullName: "Phạm Thị Vy",
        phone: "0901234571",
        gender: "Nữ",
        employmentStatus: "Đang làm việc",
        department: "Hành chính",
        title: "Lễ tân",
        position: "Lễ tân",
        currentAddress: "654 Đường Cách Mạng Tháng 8, Q10, TP.HCM",
        dob: new Date("1995-07-12"),
      },
    }),

    // Nhân viên thử việc
    prisma.employee.create({
      data: {
        email: "nv.hoa@drdee.vn",
        role: "employee",
        employeeCode: "NV006",
        fullName: "Võ Thị Hoa",
        phone: "0901234572",
        gender: "Nữ",
        employmentStatus: "Thử việc",
        department: "Tổng hợp",
        title: "Điều dưỡng",
        position: "Điều dưỡng",
        currentAddress: "987 Đường Lý Tự Trọng, Q1, TP.HCM",
        dob: new Date("1996-11-08"),
      },
    }),
  ]);

  const [admin, drLinh, drDuc, nureMai, receptionVy] = employees;

  // Update createdById và updatedById cho tất cả employees (tự reference)
  await Promise.all(
    employees.map((emp) =>
      prisma.employee.update({
        where: { id: emp.id },
        data: {
          createdById: admin.id,
          updatedById: admin.id,
        },
      })
    )
  );

  // ========================================
  // 3. TẠO DENTAL SERVICES (Dịch vụ nha khoa)
  // ========================================
  console.log("🦷 Tạo dịch vụ nha khoa...");

  const dentalServices = await Promise.all([
    // Dịch vụ tổng quát
    prisma.dentalService.create({
      data: {
        name: "Khám tổng quát",
        description: "Khám tổng quát răng miệng, tư vấn sức khỏe răng miệng",
        serviceGroup: "Tổng quát",
        department: "Tổng quát",
        unit: "Lần",
        price: 100000,
        avgTreatmentMinutes: 30,
        avgTreatmentSessions: 1,
        createdById: admin.id,
        updatedById: admin.id,
      },
    }),

    prisma.dentalService.create({
      data: {
        name: "Cạo vôi răng",
        description: "Cạo vôi răng, làm sạch răng miệng",
        serviceGroup: "Nha chu",
        department: "Nha chu",
        unit: "Hàm",
        price: 200000,
        avgTreatmentMinutes: 45,
        avgTreatmentSessions: 1,
        createdById: admin.id,
        updatedById: admin.id,
      },
    }),

    // Trám răng
    prisma.dentalService.create({
      data: {
        name: "Trám răng Composite",
        description: "Trám răng bằng vật liệu composite cao cấp",
        serviceGroup: "Phục hình",
        department: "Tổng quát",
        unit: "Răng",
        price: 300000,
        avgTreatmentMinutes: 60,
        avgTreatmentSessions: 1,
        clinicWarranty: "6 tháng",
        createdById: admin.id,
        updatedById: admin.id,
      },
    }),

    // Nhổ răng
    prisma.dentalService.create({
      data: {
        name: "Nhổ răng đơn giản",
        description: "Nhổ răng không phức tạp",
        serviceGroup: "Phẫu thuật",
        department: "Phẫu thuật",
        unit: "Răng",
        price: 150000,
        avgTreatmentMinutes: 30,
        avgTreatmentSessions: 1,
        createdById: admin.id,
        updatedById: admin.id,
      },
    }),

    prisma.dentalService.create({
      data: {
        name: "Nhổ răng khôn",
        description: "Nhổ răng khôn phức tạp",
        serviceGroup: "Phẫu thuật",
        department: "Phẫu thuật",
        unit: "Răng",
        price: 500000,
        avgTreatmentMinutes: 90,
        avgTreatmentSessions: 1,
        createdById: admin.id,
        updatedById: admin.id,
      },
    }),

    // Tẩy trắng răng
    prisma.dentalService.create({
      data: {
        name: "Tẩy trắng răng",
        description: "Tẩy trắng răng bằng công nghệ laser",
        serviceGroup: "Thẩm mỹ",
        department: "Thẩm mỹ",
        unit: "Hàm",
        price: 2000000,
        avgTreatmentMinutes: 120,
        avgTreatmentSessions: 2,
        clinicWarranty: "1 năm",
        createdById: admin.id,
        updatedById: admin.id,
      },
    }),

    // Mão răng sứ
    prisma.dentalService.create({
      data: {
        name: "Mão răng sứ Titan",
        description: "Bọc răng sứ Titan cao cấp",
        serviceGroup: "Phục hình",
        department: "Phục hình",
        unit: "Răng",
        price: 1500000,
        avgTreatmentMinutes: 90,
        avgTreatmentSessions: 3,
        officialWarranty: "10 năm",
        clinicWarranty: "2 năm",
        origin: "Đức",
        createdById: admin.id,
        updatedById: admin.id,
      },
    }),

    // Implant
    prisma.dentalService.create({
      data: {
        name: "Cấy ghép Implant",
        description: "Cấy ghép implant titanium nguyên khối",
        serviceGroup: "Phẫu thuật",
        department: "Phẫu thuật",
        unit: "Răng",
        price: 15000000,
        avgTreatmentMinutes: 180,
        avgTreatmentSessions: 4,
        officialWarranty: "20 năm",
        clinicWarranty: "5 năm",
        origin: "Thụy Sĩ",
        createdById: admin.id,
        updatedById: admin.id,
      },
    }),

    // Niềng răng
    prisma.dentalService.create({
      data: {
        name: "Niềng răng mắc cài kim loại",
        description: "Niềng răng bằng mắc cài kim loại truyền thống",
        serviceGroup: "Chỉnh nha",
        department: "Chỉnh nha",
        unit: "Lần",
        price: 25000000,
        avgTreatmentMinutes: 60,
        avgTreatmentSessions: 24,
        clinicWarranty: "2 năm",
        createdById: admin.id,
        updatedById: admin.id,
      },
    }),

    prisma.dentalService.create({
      data: {
        name: "Niềng răng Invisalign",
        description: "Niềng răng trong suốt công nghệ Invisalign",
        serviceGroup: "Chỉnh nha",
        department: "Chỉnh nha",
        unit: "Lần",
        price: 80000000,
        avgTreatmentMinutes: 45,
        avgTreatmentSessions: 18,
        officialWarranty: "5 năm",
        clinicWarranty: "3 năm",
        origin: "Mỹ",
        createdById: admin.id,
        updatedById: admin.id,
      },
    }),
  ]);

  const [
    examService,
    scalingService,
    fillingService, // skip unused services
    ,
    ,
    ,
    ,
    implantService,
    metalBracesService,
  ] = dentalServices;

  // ========================================
  // 4. TẠO CUSTOMERS (Khách hàng)
  // ========================================
  console.log("👤 Tạo khách hàng...");

  const customers = await Promise.all([
    // Khách hàng 1 - Người trẻ
    prisma.customer.create({
      data: {
        customerCode: "KH001",
        fullName: "Nguyễn Thị Hương",
        fullName_lowercase: "nguyen thi huong",
        phone: "0987654321",
        email: "huong.nt@gmail.com",
        address: "123 Nguyễn Văn Cừ, Q5, TP.HCM",
        city: "TP.HCM",
        district: "Quận 5",
        gender: "Nữ",
        dob: new Date("1995-06-15"),
        occupation: "Nhân viên văn phòng",
        source: "Facebook",
        servicesOfInterest: ["Tẩy trắng răng", "Niềng răng"],
        searchKeywords: ["nguyen thi huong", "huong nt", "0987654321"],
        createdById: receptionVy.id,
        updatedById: receptionVy.id,
      },
    }),

    // Khách hàng 2 - Người trung niên
    prisma.customer.create({
      data: {
        customerCode: "KH002",
        fullName: "Trần Văn Minh",
        fullName_lowercase: "tran van minh",
        phone: "0976543210",
        email: "minh.tv@company.com",
        address: "456 Lê Văn Sỹ, Q3, TP.HCM",
        city: "TP.HCM",
        district: "Quận 3",
        gender: "Nam",
        dob: new Date("1980-03-22"),
        occupation: "Kỹ sư",
        source: "Giới thiệu",
        servicesOfInterest: ["Cấy ghép Implant", "Mão răng sứ"],
        searchKeywords: ["tran van minh", "minh tv", "0976543210"],
        createdById: receptionVy.id,
        updatedById: receptionVy.id,
      },
    }),

    // Khách hàng 3 - Học sinh
    prisma.customer.create({
      data: {
        customerCode: "KH003",
        fullName: "Lê Thị Anh",
        fullName_lowercase: "le thi anh",
        phone: "0965432109",
        address: "789 Điện Biên Phủ, Q1, TP.HCM",
        city: "TP.HCM",
        district: "Quận 1",
        gender: "Nữ",
        dob: new Date("2005-09-10"),
        occupation: "Học sinh",
        source: "Tìm kiếm Google",
        servicesOfInterest: ["Niềng răng", "Khám tổng quát"],
        searchKeywords: ["le thi anh", "anh lt", "0965432109"],
        createdById: receptionVy.id,
        updatedById: receptionVy.id,
      },
    }),

    // Khách hàng 4 - Gia đình (mẹ)
    prisma.customer.create({
      data: {
        customerCode: "KH004",
        fullName: "Phạm Thị Lan",
        fullName_lowercase: "pham thi lan",
        phone: "0954321098",
        email: "lan.pt@email.com",
        address: "321 Võ Văn Tần, Q3, TP.HCM",
        city: "TP.HCM",
        district: "Quận 3",
        gender: "Nữ",
        dob: new Date("1985-12-05"),
        occupation: "Giáo viên",
        source: "Giới thiệu",
        servicesOfInterest: ["Khám tổng quát", "Trám răng"],
        searchKeywords: ["pham thi lan", "lan pt", "0954321098"],
        createdById: receptionVy.id,
        updatedById: receptionVy.id,
      },
    }),

    // Khách hàng 5 - Con của khách hàng 4
    prisma.customer.create({
      data: {
        customerCode: "KH005",
        fullName: "Phạm Minh Tuấn",
        fullName_lowercase: "pham minh tuan",
        phone: "0943210987",
        address: "321 Võ Văn Tần, Q3, TP.HCM",
        city: "TP.HCM",
        district: "Quận 3",
        gender: "Nam",
        dob: new Date("2010-08-20"),
        occupation: "Học sinh",
        source: "Giới thiệu",
        relationshipToPrimary: "Con",
        servicesOfInterest: ["Khám tổng quát"],
        searchKeywords: ["pham minh tuan", "tuan pm", "0943210987"],
        createdById: receptionVy.id,
        updatedById: receptionVy.id,
      },
    }),

    // Thêm một số khách hàng khác
    prisma.customer.create({
      data: {
        customerCode: "KH006",
        fullName: "Võ Thành Công",
        fullName_lowercase: "vo thanh cong",
        phone: "0932109876",
        email: "cong.vt@business.vn",
        address: "654 Cách Mạng Tháng 8, Q10, TP.HCM",
        city: "TP.HCM",
        district: "Quận 10",
        gender: "Nam",
        dob: new Date("1975-01-30"),
        occupation: "Doanh nhân",
        source: "Website",
        servicesOfInterest: ["Cấy ghép Implant", "Tẩy trắng răng"],
        searchKeywords: ["vo thanh cong", "cong vt", "0932109876"],
        createdById: receptionVy.id,
        updatedById: receptionVy.id,
      },
    }),

    prisma.customer.create({
      data: {
        customerCode: "KH007",
        fullName: "Ngô Thị Kim",
        fullName_lowercase: "ngo thi kim",
        phone: "0921098765",
        address: "987 Nguyễn Thái Học, Q1, TP.HCM",
        city: "TP.HCM",
        district: "Quận 1",
        gender: "Nữ",
        dob: new Date("1992-04-18"),
        occupation: "Kiến trúc sư",
        source: "Zalo",
        servicesOfInterest: ["Niềng răng", "Mão răng sứ"],
        searchKeywords: ["ngo thi kim", "kim nt", "0921098765"],
        createdById: receptionVy.id,
        updatedById: receptionVy.id,
      },
    }),
  ]);

  const [
    huongCustomer,
    minhCustomer,
    anhCustomer,
    lanCustomer,
    tuanCustomer,
    congCustomer,
    kimCustomer,
  ] = customers;

  // Set primary contact relationship
  await prisma.customer.update({
    where: { id: tuanCustomer.id },
    data: { primaryContactId: lanCustomer.id },
  });

  // ========================================
  // 5. TẠO APPOINTMENTS (Lịch hẹn)
  // ========================================
  console.log("📅 Tạo lịch hẹn...");

  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const appointments = await Promise.all([
    // Lịch hẹn hôm qua - đã completed
    prisma.appointment.create({
      data: {
        customerId: huongCustomer.id,
        appointmentDateTime: new Date(yesterday.setHours(9, 0, 0, 0)),
        duration: 30,
        notes: "Khám tổng quát định kỳ",
        primaryDentistId: drLinh.id,
        clinicId: "clinic-main", // Default clinic
        status: "Đã đến",
        checkInTime: new Date(yesterday.setHours(9, 5, 0, 0)),
        checkOutTime: new Date(yesterday.setHours(9, 35, 0, 0)),
        createdById: receptionVy.id,
        updatedById: receptionVy.id,
      },
    }),

    // Lịch hẹn hôm nay - đã check-in
    prisma.appointment.create({
      data: {
        customerId: minhCustomer.id,
        appointmentDateTime: new Date(today.setHours(10, 0, 0, 0)),
        duration: 60,
        notes: "Tư vấn cấy ghép implant",
        primaryDentistId: drDuc.id,
        secondaryDentistId: nureMai.id,
        clinicId: "clinic-main",
        status: "Đã đến",
        checkInTime: new Date(today.setHours(9, 55, 0, 0)),
        createdById: receptionVy.id,
        updatedById: receptionVy.id,
      },
    }),

    // Lịch hẹn hôm nay - chưa đến
    prisma.appointment.create({
      data: {
        customerId: anhCustomer.id,
        appointmentDateTime: new Date(today.setHours(14, 0, 0, 0)),
        duration: 45,
        notes: "Tư vấn niềng răng",
        primaryDentistId: drLinh.id,
        clinicId: "clinic-main",
        status: "Đã xác nhận",
        createdById: receptionVy.id,
        updatedById: receptionVy.id,
      },
    }),

    // Lịch hẹn ngày mai
    prisma.appointment.create({
      data: {
        customerId: lanCustomer.id,
        appointmentDateTime: new Date(tomorrow.setHours(9, 30, 0, 0)),
        duration: 30,
        notes: "Khám tổng quát",
        primaryDentistId: drLinh.id,
        clinicId: "clinic-main",
        status: "Đã xác nhận",
        createdById: receptionVy.id,
        updatedById: receptionVy.id,
      },
    }),

    // Lịch hẹn tuần sau
    prisma.appointment.create({
      data: {
        customerId: congCustomer.id,
        appointmentDateTime: new Date(nextWeek.setHours(11, 0, 0, 0)),
        duration: 90,
        notes: "Tư vấn tẩy trắng răng",
        primaryDentistId: drDuc.id,
        clinicId: "clinic-main",
        status: "Đã xác nhận",
        createdById: receptionVy.id,
        updatedById: receptionVy.id,
      },
    }),
  ]);

  const [yesterdayAppt, todayAppt, todayAppt2, tomorrowAppt, nextWeekAppt] =
    appointments;

  // ========================================
  // 6. TẠO CONSULTED SERVICES (Dịch vụ đã tư vấn)
  // ========================================
  console.log("💊 Tạo dịch vụ đã tư vấn...");

  const consultedServices = await Promise.all([
    // Dịch vụ khám tổng quát - đã chốt và hoàn thành
    prisma.consultedService.create({
      data: {
        customerId: huongCustomer.id,
        appointmentId: yesterdayAppt.id,
        dentalServiceId: examService.id,
        clinicId: "clinic-main",
        consultedServiceName: examService.name,
        consultedServiceUnit: examService.unit,
        quantity: 1,
        price: examService.price,
        preferentialPrice: examService.price,
        finalPrice: examService.price,
        amountPaid: examService.price,
        debt: 0,
        serviceStatus: "Đã chốt",
        treatmentStatus: "Hoàn thành",
        consultationDate: yesterday,
        serviceConfirmDate: yesterday,
        consultingDoctorId: drLinh.id,
        treatingDoctorId: drLinh.id,
        createdById: drLinh.id,
        updatedById: drLinh.id,
      },
    }),

    // Dịch vụ cạo vôi - đã chốt và hoàn thành
    prisma.consultedService.create({
      data: {
        customerId: huongCustomer.id,
        appointmentId: yesterdayAppt.id,
        dentalServiceId: scalingService.id,
        clinicId: "clinic-main",
        consultedServiceName: scalingService.name,
        consultedServiceUnit: scalingService.unit,
        quantity: 1,
        price: scalingService.price,
        preferentialPrice: 180000, // Giảm giá
        finalPrice: 180000,
        amountPaid: 180000,
        debt: 0,
        serviceStatus: "Đã chốt",
        treatmentStatus: "Hoàn thành",
        consultationDate: yesterday,
        serviceConfirmDate: yesterday,
        consultingDoctorId: drLinh.id,
        treatingDoctorId: drLinh.id,
        createdById: drLinh.id,
        updatedById: drLinh.id,
      },
    }),

    // Dịch vụ implant - đã tư vấn nhưng chưa chốt
    prisma.consultedService.create({
      data: {
        customerId: minhCustomer.id,
        appointmentId: todayAppt.id,
        dentalServiceId: implantService.id,
        clinicId: "clinic-main",
        consultedServiceName: implantService.name,
        consultedServiceUnit: implantService.unit,
        toothPositions: ["16", "26"], // Răng số 6 hàm trên
        specificStatus: "Mất răng, xương còn đủ để cấy ghép",
        quantity: 2,
        price: implantService.price,
        preferentialPrice: 13000000, // Giảm giá package
        finalPrice: 26000000,
        amountPaid: 0,
        debt: 26000000,
        serviceStatus: "Chưa chốt",
        treatmentStatus: "Chưa điều trị",
        consultationDate: today,
        consultingDoctorId: drDuc.id,
        createdById: drDuc.id,
        updatedById: drDuc.id,
      },
    }),

    // Dịch vụ niềng răng kim loại - đã chốt, đang điều trị
    prisma.consultedService.create({
      data: {
        customerId: kimCustomer.id,
        dentalServiceId: metalBracesService.id,
        clinicId: "clinic-main",
        consultedServiceName: metalBracesService.name,
        consultedServiceUnit: metalBracesService.unit,
        specificStatus: "Răng mọc lệch, cần niềng để căn chỉnh",
        quantity: 1,
        price: metalBracesService.price,
        preferentialPrice: 22000000,
        finalPrice: 22000000,
        amountPaid: 5000000, // Đã đặt cọc
        debt: 17000000,
        serviceStatus: "Đã chốt",
        treatmentStatus: "Đang điều trị",
        consultationDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 ngày trước
        serviceConfirmDate: new Date(
          today.getTime() - 25 * 24 * 60 * 60 * 1000
        ),
        consultingDoctorId: drLinh.id,
        treatingDoctorId: drLinh.id,
        createdById: drLinh.id,
        updatedById: drLinh.id,
      },
    }),

    // Dịch vụ trám răng - đã chốt, hoàn thành
    prisma.consultedService.create({
      data: {
        customerId: lanCustomer.id,
        dentalServiceId: fillingService.id,
        clinicId: "clinic-main",
        consultedServiceName: fillingService.name,
        consultedServiceUnit: fillingService.unit,
        toothPositions: ["36", "37"], // Răng hàm dưới
        specificStatus: "Sâu răng nông, cần trám composite",
        quantity: 2,
        price: fillingService.price,
        preferentialPrice: fillingService.price,
        finalPrice: 600000,
        amountPaid: 600000,
        debt: 0,
        serviceStatus: "Đã chốt",
        treatmentStatus: "Hoàn thành",
        consultationDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 tuần trước
        serviceConfirmDate: new Date(
          today.getTime() - 14 * 24 * 60 * 60 * 1000
        ),
        consultingDoctorId: drLinh.id,
        treatingDoctorId: drLinh.id,
        createdById: drLinh.id,
        updatedById: drLinh.id,
      },
    }),
  ]);

  const [examCS, scalingCS, , bracesCS, fillingCS] = consultedServices;

  // ========================================
  // 7. TẠO PAYMENT VOUCHERS (Phiếu thu)
  // ========================================
  console.log("💰 Tạo phiếu thu...");

  const paymentVouchers = await Promise.all([
    // Phiếu thu cho khách hàng Hương
    prisma.paymentVoucher.create({
      data: {
        paymentNumber: "PT001",
        customerId: huongCustomer.id,
        paymentDate: yesterday,
        totalAmount: 380000, // Khám + cạo vôi
        notes: "Thanh toán khám và cạo vôi răng",
        cashierId: receptionVy.id,
        createdById: receptionVy.id,
        updatedById: receptionVy.id,
      },
    }),

    // Phiếu thu cọc cho khách hàng Kim (niềng răng)
    prisma.paymentVoucher.create({
      data: {
        paymentNumber: "PT002",
        customerId: kimCustomer.id,
        paymentDate: new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000),
        totalAmount: 5000000,
        notes: "Đặt cọc niềng răng kim loại",
        cashierId: receptionVy.id,
        createdById: receptionVy.id,
        updatedById: receptionVy.id,
      },
    }),

    // Phiếu thu cho khách hàng Lan (trám răng)
    prisma.paymentVoucher.create({
      data: {
        paymentNumber: "PT003",
        customerId: lanCustomer.id,
        paymentDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
        totalAmount: 600000,
        notes: "Thanh toán trám răng composite",
        cashierId: receptionVy.id,
        createdById: receptionVy.id,
        updatedById: receptionVy.id,
      },
    }),
  ]);

  const [paymentVoucher1, paymentVoucher2, paymentVoucher3] = paymentVouchers;

  // ========================================
  // 8. TẠO PAYMENT VOUCHER DETAILS (Chi tiết phiếu thu)
  // ========================================
  console.log("💳 Tạo chi tiết phiếu thu...");

  await Promise.all([
    // Chi tiết phiếu thu 1 - Khám tổng quát
    prisma.paymentVoucherDetail.create({
      data: {
        paymentVoucherId: paymentVoucher1.id,
        consultedServiceId: examCS.id,
        amount: 100000,
        paymentMethod: "Tiền mặt",
        createdById: receptionVy.id,
      },
    }),

    // Chi tiết phiếu thu 1 - Cạo vôi
    prisma.paymentVoucherDetail.create({
      data: {
        paymentVoucherId: paymentVoucher1.id,
        consultedServiceId: scalingCS.id,
        amount: 180000,
        paymentMethod: "Tiền mặt",
        createdById: receptionVy.id,
      },
    }),

    // Chi tiết phiếu thu 2 - Cọc niềng răng
    prisma.paymentVoucherDetail.create({
      data: {
        paymentVoucherId: paymentVoucher2.id,
        consultedServiceId: bracesCS.id,
        amount: 5000000,
        paymentMethod: "Chuyển khoản",
        createdById: receptionVy.id,
      },
    }),

    // Chi tiết phiếu thu 3 - Trám răng
    prisma.paymentVoucherDetail.create({
      data: {
        paymentVoucherId: paymentVoucher3.id,
        consultedServiceId: fillingCS.id,
        amount: 600000,
        paymentMethod: "Quẹt thẻ",
        createdById: receptionVy.id,
      },
    }),
  ]);

  // ========================================
  // 9. TẠO TREATMENT LOGS (Nhật ký điều trị)
  // ========================================
  console.log("📝 Tạo nhật ký điều trị...");

  await Promise.all([
    // Nhật ký điều trị khám tổng quát
    prisma.treatmentLog.create({
      data: {
        customerId: huongCustomer.id,
        consultedServiceId: examCS.id,
        appointmentId: yesterdayAppt.id,
        treatmentDate: yesterday,
        treatmentNotes:
          "Khám tổng quát: Răng miệng tổng thể khỏe mạnh. Có một ít vôi răng ở cổ răng.",
        treatmentStatus: "Hoàn tất dịch vụ",
        dentistId: drLinh.id,
        assistant1Id: nureMai.id,
        createdById: drLinh.id,
        updatedById: drLinh.id,
      },
    }),

    // Nhật ký điều trị cạo vôi
    prisma.treatmentLog.create({
      data: {
        customerId: huongCustomer.id,
        consultedServiceId: scalingCS.id,
        appointmentId: yesterdayAppt.id,
        treatmentDate: yesterday,
        treatmentNotes:
          "Cạo vôi răng toàn hàm. Vệ sinh răng miệng tốt. Hướng dẫn chải răng đúng cách.",
        nextStepNotes: "Tái khám sau 6 tháng",
        treatmentStatus: "Hoàn tất dịch vụ",
        dentistId: drLinh.id,
        assistant1Id: nureMai.id,
        createdById: drLinh.id,
        updatedById: drLinh.id,
      },
    }),

    // Nhật ký điều trị trám răng (buổi 1)
    prisma.treatmentLog.create({
      data: {
        customerId: lanCustomer.id,
        consultedServiceId: fillingCS.id,
        treatmentDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
        treatmentNotes:
          "Trám răng 36, 37 bằng composite. Sâu răng độ 2, không đau. Trám thành công.",
        treatmentStatus: "Hoàn tất dịch vụ",
        dentistId: drLinh.id,
        assistant1Id: nureMai.id,
        createdById: drLinh.id,
        updatedById: drLinh.id,
      },
    }),

    // Nhật ký điều trị niềng răng (buổi lắp mắc cài)
    prisma.treatmentLog.create({
      data: {
        customerId: kimCustomer.id,
        consultedServiceId: bracesCS.id,
        treatmentDate: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000),
        treatmentNotes:
          "Lắp mắc cài kim loại hàm trên và hàm dưới. Hướng dẫn vệ sinh răng miệng khi niềng.",
        nextStepNotes: "Tái khám và thay dây cung sau 4 tuần",
        treatmentStatus: "Đang tiến hành",
        dentistId: drLinh.id,
        assistant1Id: nureMai.id,
        createdById: drLinh.id,
        updatedById: drLinh.id,
      },
    }),
  ]);

  console.log("✅ Seed dữ liệu hoàn tất!");
  console.log(`
📊 Tóm tắt dữ liệu đã tạo:
👥 Nhân viên: ${employees.length}
🦷 Dịch vụ nha khoa: ${dentalServices.length}
👤 Khách hàng: ${customers.length}
📅 Lịch hẹn: ${appointments.length}
💊 Dịch vụ đã tư vấn: ${consultedServices.length}
💰 Phiếu thu: ${paymentVouchers.length}
📝 Nhật ký điều trị: 4

🎯 Dữ liệu test đã sẵn sàng để sử dụng!
  `);
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi seed dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
