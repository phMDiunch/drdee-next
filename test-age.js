// Test calculateAge function
import { calculateAge } from "../src/utils/date";

// Test cases
console.log("Testing calculateAge function:");

// Test với ISO string (format từ database)
const isoDate = "1990-05-15T00:00:00.000Z";
console.log(`ISO date ${isoDate} -> Age: ${calculateAge(isoDate)}`);

// Test với DD/MM/YYYY format
const ddmmyyyy = "15/05/1990";
console.log(`DD/MM/YYYY ${ddmmyyyy} -> Age: ${calculateAge(ddmmyyyy)}`);

// Test với Date object
const dateObj = new Date("1990-05-15");
console.log(`Date object ${dateObj} -> Age: ${calculateAge(dateObj)}`);

console.log("Tests completed!");
