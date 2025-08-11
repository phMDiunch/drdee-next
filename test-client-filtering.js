// test-client-filtering.js
// Test script để kiểm tra logic client-side filtering

// Mock data giống như real data structure
const mockRevenueData = {
  totalRevenue: 1000000,
  totalSales: 50,
  totalTransactions: 45,
  averageTransaction: 22222,
  byPaymentMethod: {
    cash: 500000,
    cardNormal: 300000,
    cardVisa: 100000,
    transfer: 100000,
  },
  byTime: [
    { date: "2024-08-01", revenue: 100000, sales: 5, transactions: 4 },
    { date: "2024-08-02", revenue: 150000, sales: 7, transactions: 6 },
    { date: "2024-08-03", revenue: 200000, sales: 10, transactions: 8 },
  ],
  byEmployee: [
    {
      employeeId: "emp1",
      employeeName: "Dr. A",
      revenue: 400000,
      sales: 20,
      transactions: 18,
    },
    {
      employeeId: "emp2",
      employeeName: "Dr. B",
      revenue: 600000,
      sales: 30,
      transactions: 27,
    },
  ],
  byClinic: [
    {
      clinicId: "153DN",
      clinicName: "Clinic DN",
      revenue: 600000,
      sales: 30,
      transactions: 27,
    },
    {
      clinicId: "154HN",
      clinicName: "Clinic HN",
      revenue: 400000,
      sales: 20,
      transactions: 18,
    },
  ],
};

// Import functions (simulate)
function canUseClientSideFiltering(allClinicsData, targetClinicId) {
  if (!allClinicsData || !targetClinicId) {
    return false;
  }

  const hasClinicData = allClinicsData.byClinic.some(
    (clinic) => clinic.clinicId === targetClinicId
  );

  return hasClinicData;
}

function filterRevenueDataByClinic(data, targetClinicId) {
  if (!targetClinicId || !data) {
    return data;
  }

  const clinicData = data.byClinic.find(
    (clinic) => clinic.clinicId === targetClinicId
  );

  if (!clinicData) {
    return data; // Fallback nếu không tìm thấy clinic
  }

  const revenuePercentage = clinicData.revenue / data.totalRevenue;

  return {
    ...data,
    totalRevenue: clinicData.revenue,
    totalSales: clinicData.sales,
    totalTransactions: clinicData.transactions,
    averageTransaction:
      clinicData.transactions > 0
        ? Math.round(clinicData.revenue / clinicData.transactions)
        : 0,
    byPaymentMethod: {
      cash: Math.round(data.byPaymentMethod.cash * revenuePercentage),
      cardNormal: Math.round(
        data.byPaymentMethod.cardNormal * revenuePercentage
      ),
      cardVisa: Math.round(data.byPaymentMethod.cardVisa * revenuePercentage),
      transfer: Math.round(data.byPaymentMethod.transfer * revenuePercentage),
    },
    byTime: data.byTime.map((day) => ({
      ...day,
      revenue: Math.round(day.revenue * revenuePercentage),
      sales: Math.round(day.sales * revenuePercentage),
      transactions: Math.round(day.transactions * revenuePercentage),
    })),
    byEmployee: data.byEmployee.map((emp) => ({
      ...emp,
      revenue: Math.round(emp.revenue * revenuePercentage),
      sales: Math.round(emp.sales * revenuePercentage),
      transactions: Math.round(emp.transactions * revenuePercentage),
    })),
    byClinic: [clinicData],
  };
}

// Test cases
console.log("=== Test Client-side Filtering Logic ===\n");

// Test 1: Can filter existing clinic
const canFilter153 = canUseClientSideFiltering(mockRevenueData, "153DN");
console.log("1. Can filter clinic 153DN:", canFilter153); // Should be true

// Test 2: Cannot filter non-existing clinic
const canFilter999 = canUseClientSideFiltering(mockRevenueData, "999XX");
console.log("2. Can filter clinic 999XX:", canFilter999); // Should be false

// Test 3: Filter data for clinic 153DN
if (canFilter153) {
  const filtered153 = filterRevenueDataByClinic(mockRevenueData, "153DN");
  console.log("3. Filtered data for clinic 153DN:");
  console.log("   Total Revenue:", filtered153.totalRevenue); // Should be 600000
  console.log("   Total Sales:", filtered153.totalSales); // Should be 30
  console.log("   Clinic Count:", filtered153.byClinic.length); // Should be 1
  console.log("   Cash Payment:", filtered153.byPaymentMethod.cash); // Should be 300000 (60% of 500000)
}

// Test 4: Performance simulation
console.log("\n=== Performance Comparison ===");

// Scenario 1: User loads "All Clinics" first
console.log('Scenario 1: User loads "All Clinics"');
console.log("  - API Call: YES (load all data)");
console.log("  - Loading time: Normal");

// Scenario 2: User switches to specific clinic (with optimization)
console.log("\nScenario 2: User switches to Clinic 153DN (WITH optimization)");
const hasAllData = true; // Already loaded all clinics
const canUseClientside = canUseClientSideFiltering(mockRevenueData, "153DN");
console.log("  - Has all data:", hasAllData);
console.log("  - Can use client-side:", canUseClientside);
console.log(
  "  - API Call:",
  canUseClientside ? "NO (filtered client-side)" : "YES"
);
console.log("  - Loading time:", canUseClientside ? "INSTANT" : "Normal");

// Scenario 3: User switches to specific clinic (without optimization)
console.log(
  "\nScenario 3: User switches to Clinic 153DN (WITHOUT optimization)"
);
console.log("  - API Call: YES (always)");
console.log("  - Loading time: Normal");

console.log("\n✅ Optimization Impact:");
console.log("  - Eliminates unnecessary API calls when switching clinics");
console.log("  - Provides instant filtering for existing clinic data");
console.log("  - Improves user experience with faster response times");
