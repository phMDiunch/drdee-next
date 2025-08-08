// Test script for Employee Permission Logic
// Run này để test xem logic permission có hoạt động đúng không

console.log("🧪 Testing Employee Permission Logic...\n");

// Mock data để test logic
const mockData = {
  admin: { role: 'admin' },
  employee: { role: 'employee' },
  
  // Mock service scenarios
  serviceNotConfirmed: {
    serviceStatus: 'Chưa chốt',
    serviceConfirmDate: null
  },
  
  serviceConfirmed3Days: {
    serviceStatus: 'Đã chốt', 
    serviceConfirmDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  
  serviceConfirmed40Days: {
    serviceStatus: 'Đã chốt',
    serviceConfirmDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() // 40 days ago
  }
};

// Simulate frontend logic
function canEditEmployeeFields(employeeProfile, initialData) {
  const isAdmin = employeeProfile?.role === 'admin';
  
  if (isAdmin) return true;
  
  if (!initialData?.serviceConfirmDate || initialData?.serviceStatus !== "Đã chốt") {
    return true;
  }
  
  // Simple day calculation (not using dayjs for this test)
  const now = new Date();
  const confirmDate = new Date(initialData.serviceConfirmDate);
  const daysDiff = Math.floor((now - confirmDate) / (1000 * 60 * 60 * 24));
  
  return daysDiff <= 33;
}

// Test cases
console.log("📋 Test Cases:\n");

console.log("1️⃣ Admin với service đã chốt 40 ngày:");
console.log("   Can edit:", canEditEmployeeFields(mockData.admin, mockData.serviceConfirmed40Days));

console.log("\n2️⃣ Employee với service chưa chốt:");
console.log("   Can edit:", canEditEmployeeFields(mockData.employee, mockData.serviceNotConfirmed));

console.log("\n3️⃣ Employee với service đã chốt 3 ngày:");
console.log("   Can edit:", canEditEmployeeFields(mockData.employee, mockData.serviceConfirmed3Days));

console.log("\n4️⃣ Employee với service đã chốt 40 ngày:");
console.log("   Can edit:", canEditEmployeeFields(mockData.employee, mockData.serviceConfirmed40Days));

console.log("\n✅ Expected Results:");
console.log("   1️⃣ Should be TRUE (admin has all permissions)");
console.log("   2️⃣ Should be TRUE (service not confirmed yet)");  
console.log("   3️⃣ Should be TRUE (within 33 days)");
console.log("   4️⃣ Should be FALSE (exceed 33 days limit)");

console.log("\n🎯 Test completed!");
