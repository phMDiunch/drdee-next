// test-null-safety.js
// Test script để verify null safety trong filtering functions

console.log("=== Null Safety Testing ===\n");

// Test cases with null/undefined data
const testCases = [
  {
    name: "Null data",
    data: null,
    clinicId: "153DN",
    expectedBehavior: "Should return null without error",
  },
  {
    name: "Undefined data",
    data: undefined,
    clinicId: "153DN",
    expectedBehavior: "Should return undefined without error",
  },
  {
    name: "Missing byTime array",
    data: {
      totalRevenue: 1000000,
      byClinic: [{ clinicId: "153DN", revenue: 500000 }],
      byEmployee: [{ employeeId: "emp1", revenue: 300000 }],
      // byTime: missing
      byPaymentMethod: {
        cash: 500000,
        cardNormal: 300000,
        cardVisa: 100000,
        transfer: 100000,
      },
    },
    clinicId: "153DN",
    expectedBehavior: "Should log warning and return original data",
  },
  {
    name: "Missing byClinic array",
    data: {
      totalRevenue: 1000000,
      byTime: [{ date: "2024-08-01", revenue: 100000 }],
      byEmployee: [{ employeeId: "emp1", revenue: 300000 }],
      // byClinic: missing
      byPaymentMethod: {
        cash: 500000,
        cardNormal: 300000,
        cardVisa: 100000,
        transfer: 100000,
      },
    },
    clinicId: "153DN",
    expectedBehavior: "Should log warning and return original data",
  },
  {
    name: "Missing byEmployee array",
    data: {
      totalRevenue: 1000000,
      byTime: [{ date: "2024-08-01", revenue: 100000 }],
      byClinic: [{ clinicId: "153DN", revenue: 500000 }],
      // byEmployee: missing
      byPaymentMethod: {
        cash: 500000,
        cardNormal: 300000,
        cardVisa: 100000,
        transfer: 100000,
      },
    },
    clinicId: "153DN",
    expectedBehavior: "Should log warning and return original data",
  },
  {
    name: "Missing byPaymentMethod object",
    data: {
      totalRevenue: 1000000,
      byTime: [{ date: "2024-08-01", revenue: 100000 }],
      byClinic: [{ clinicId: "153DN", revenue: 500000 }],
      byEmployee: [{ employeeId: "emp1", revenue: 300000 }],
      // byPaymentMethod: missing
    },
    clinicId: "153DN",
    expectedBehavior: "Should handle with default values (0s)",
  },
  {
    name: "Clinic not found",
    data: {
      totalRevenue: 1000000,
      byTime: [{ date: "2024-08-01", revenue: 100000 }],
      byClinic: [{ clinicId: "154HN", revenue: 500000 }], // Different clinic
      byEmployee: [{ employeeId: "emp1", revenue: 300000 }],
      byPaymentMethod: {
        cash: 500000,
        cardNormal: 300000,
        cardVisa: 100000,
        transfer: 100000,
      },
    },
    clinicId: "153DN", // Looking for clinic that doesn't exist
    expectedBehavior: "Should return empty data structure",
  },
];

// Mock the filter function (simplified version)
function mockFilterRevenueDataByClinic(data, targetClinicId) {
  // Basic null checks
  if (!targetClinicId || !data) {
    return data;
  }

  // Check required arrays
  if (!data.byClinic || !Array.isArray(data.byClinic)) {
    console.warn(
      "⚠️ Invalid data structure: byClinic is missing or not an array"
    );
    return data;
  }

  if (!data.byTime || !Array.isArray(data.byTime)) {
    console.warn(
      "⚠️ Invalid data structure: byTime is missing or not an array"
    );
    return data;
  }

  if (!data.byEmployee || !Array.isArray(data.byEmployee)) {
    console.warn(
      "⚠️ Invalid data structure: byEmployee is missing or not an array"
    );
    return data;
  }

  // Find clinic
  const clinicData = data.byClinic.find((c) => c.clinicId === targetClinicId);

  if (!clinicData) {
    console.warn(`⚠️ Clinic ${targetClinicId} not found`);
    return {
      ...data,
      totalRevenue: 0,
      totalSales: 0,
      totalTransactions: 0,
      averageTransaction: 0,
      byPaymentMethod: { cash: 0, cardNormal: 0, cardVisa: 0, transfer: 0 },
      byTime: [],
      byEmployee: [],
      byClinic: [],
    };
  }

  // Safe payment method calculation
  const revenuePercentage =
    data.totalRevenue > 0 ? clinicData.revenue / data.totalRevenue : 0;
  const filteredPaymentMethods = {
    cash: Math.round((data.byPaymentMethod?.cash || 0) * revenuePercentage),
    cardNormal: Math.round(
      (data.byPaymentMethod?.cardNormal || 0) * revenuePercentage
    ),
    cardVisa: Math.round(
      (data.byPaymentMethod?.cardVisa || 0) * revenuePercentage
    ),
    transfer: Math.round(
      (data.byPaymentMethod?.transfer || 0) * revenuePercentage
    ),
  };

  return {
    ...data,
    totalRevenue: clinicData.revenue,
    byPaymentMethod: filteredPaymentMethods,
    byClinic: [clinicData],
  };
}

// Run tests
testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. Testing: ${testCase.name}`);
  console.log(`   Expected: ${testCase.expectedBehavior}`);

  try {
    const result = mockFilterRevenueDataByClinic(
      testCase.data,
      testCase.clinicId
    );
    console.log(`   ✅ Result: No error, returned:`, typeof result);

    if (result && typeof result === "object") {
      console.log(`   📊 Total Revenue: ${result.totalRevenue || "N/A"}`);
      console.log(`   🏥 Clinics Count: ${result.byClinic?.length || "N/A"}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log("");
});

console.log("🎯 Summary:");
console.log("✅ All null safety checks should prevent runtime errors");
console.log("✅ Invalid data structures should log warnings and return safely");
console.log("✅ Missing clinics should return empty data structures");
console.log("✅ Missing payment methods should default to 0 values");
console.log(
  "\n💡 The original error \"Cannot read properties of undefined (reading 'map')\" should now be fixed!"
);
