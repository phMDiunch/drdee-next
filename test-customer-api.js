// test-customer-api.js - Script test API customer detail
const API_BASE = "http://localhost:3000";

async function testCustomerDetailAPI() {
  try {
    console.log("🧪 Testing Customer Detail API...");

    // Test 1: Get customers list to get a sample ID
    console.log("\n1️⃣ Getting customers list...");
    const customersResponse = await fetch(`${API_BASE}/api/customers`);

    if (!customersResponse.ok) {
      throw new Error(`Failed to fetch customers: ${customersResponse.status}`);
    }

    const customers = await customersResponse.json();
    console.log(`✅ Found ${customers.length} customers`);

    if (customers.length === 0) {
      console.log("⚠️ No customers found to test with");
      return;
    }

    // Test 2: Get customer detail with includeDetails=true
    const sampleCustomerId = customers[0].id;
    console.log(`\n2️⃣ Getting customer detail for ID: ${sampleCustomerId}`);

    const detailResponse = await fetch(
      `${API_BASE}/api/customers/${sampleCustomerId}?includeDetails=true`
    );

    if (!detailResponse.ok) {
      throw new Error(
        `Failed to fetch customer detail: ${detailResponse.status}`
      );
    }

    const customerDetail = await detailResponse.json();
    console.log(`✅ Customer detail loaded: ${customerDetail.fullName}`);

    // Test 3: Check consulted services structure
    console.log("\n3️⃣ Checking consulted services...");
    const consultedServices = customerDetail.consultedServices || [];
    console.log(`📊 Found ${consultedServices.length} consulted services`);

    if (consultedServices.length > 0) {
      const firstService = consultedServices[0];
      console.log("\n📋 First service structure:");
      console.log(`- Service Name: ${firstService.consultedServiceName}`);
      console.log(`- Has dentalService: ${!!firstService.dentalService}`);
      console.log(`- Has consultingDoctor: ${!!firstService.consultingDoctor}`);
      console.log(`- Has treatingDoctor: ${!!firstService.treatingDoctor}`);
      console.log(`- Has consultingSale: ${!!firstService.consultingSale}`);

      if (firstService.consultingDoctor) {
        console.log(
          `  - Consulting Doctor: ${firstService.consultingDoctor.fullName}`
        );
      }
      if (firstService.treatingDoctor) {
        console.log(
          `  - Treating Doctor: ${firstService.treatingDoctor.fullName}`
        );
      }
      if (firstService.consultingSale) {
        console.log(
          `  - Consulting Sale: ${firstService.consultingSale.fullName}`
        );
      }
    }

    console.log("\n🎉 API Test completed successfully!");
  } catch (error) {
    console.error("❌ API Test failed:", error.message);
  }
}

// Run the test
testCustomerDetailAPI();
