const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const VN_TZ = "Asia/Ho_Chi_Minh";

// Test function tương tự như trong utils/date.ts
function toISOStringVN(input) {
  if (!input) return undefined;
  // Nếu là dayjs object
  if (dayjs.isDayjs(input)) {
    return input.tz(VN_TZ).format();
  }
  // Nếu là Date
  if (input instanceof Date) {
    return dayjs(input).tz(VN_TZ).format();
  }
  // Nếu là string, parse và convert về VN timezone
  if (typeof input === "string") {
    return dayjs(input).tz(VN_TZ).format();
  }
  return undefined;
}

function nowVN() {
  return dayjs().tz(VN_TZ).format();
}

function formatDateTimeVN(date, format = "DD/MM/YYYY HH:mm:ss") {
  if (!date) return "";
  return dayjs(date).tz(VN_TZ).format(format);
}

// Test cases
console.log("=== TESTING TIMEZONE FUNCTIONS ===");
console.log();

// Test 1: nowVN() should return current time in VN timezone
const now = nowVN();
console.log("1. nowVN():", now);
console.log("   Should contain '+07:00':", now.includes("+07:00"));
console.log();

// Test 2: toISOStringVN with different inputs
const testDate = new Date("2025-08-07T10:30:15.000Z"); // UTC time
const testString = "2025-08-07T10:30:15+07:00"; // VN time
const testDayjs = dayjs("2025-08-07T10:30:15.000Z");

console.log("2. toISOStringVN tests:");
console.log("   From Date:", toISOStringVN(testDate));
console.log("   From String:", toISOStringVN(testString));
console.log("   From dayjs:", toISOStringVN(testDayjs));
console.log();

// Test 3: formatDateTimeVN
console.log("3. formatDateTimeVN tests:");
console.log("   Format now:", formatDateTimeVN(now));
console.log(
  "   Format specific time:",
  formatDateTimeVN("2025-08-07T10:30:15+07:00")
);
console.log("   Custom format:", formatDateTimeVN(now, "HH:mm DD/MM/YYYY"));
console.log();

// Test 4: Database simulation - what should be stored
console.log("4. Database simulation:");
console.log("   Current time for DB:", nowVN());
console.log("   User input simulation:", toISOStringVN(new Date()));
console.log();

// Test 5: Verify timezone consistency
const dbTime = "2025-08-07T10:30:15+07:00";
const parsedTime = dayjs(dbTime);
console.log("5. Timezone consistency:");
console.log("   Original DB time:", dbTime);
console.log("   Parsed and formatted:", formatDateTimeVN(dbTime));
console.log("   Is same hour?", parsedTime.hour() === 10);
console.log("   Timezone offset:", parsedTime.format("Z"));
