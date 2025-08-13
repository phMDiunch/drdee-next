// Vietnamese number to words (simplified for currency amounts)
// Covers non-negative integers up to the trillion range commonly used in receipts.

const NUMBER_WORDS = [
  "không",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];

function readThreeDigits(num: number, full: boolean): string {
  const hundreds = Math.floor(num / 100);
  const tens = Math.floor((num % 100) / 10);
  const ones = num % 10;
  const result: string[] = [];

  if (full || hundreds > 0) {
    result.push(NUMBER_WORDS[hundreds], "trăm");
  }

  if (tens > 1) {
    result.push(NUMBER_WORDS[tens], "mươi");
    if (ones === 1) result.push("mốt");
    else if (ones === 4) result.push("tư");
    else if (ones === 5) result.push("lăm");
    else if (ones > 0) result.push(NUMBER_WORDS[ones]);
  } else if (tens === 1) {
    result.push("mười");
    if (ones === 5) result.push("lăm");
    else if (ones > 0) result.push(NUMBER_WORDS[ones]);
  } else if (tens === 0 && ones > 0) {
    if (full || hundreds > 0) result.push("lẻ");
    result.push(NUMBER_WORDS[ones]);
  }

  return result.join(" ").trim();
}

export function numberToVietnameseWords(n: number): string {
  if (!Number.isFinite(n)) return "";
  if (n === 0) return "không";
  if (n < 0) return `âm ${numberToVietnameseWords(Math.abs(n))}`;

  const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"]; // extendable
  const parts: string[] = [];
  let unitIndex = 0;

  while (n > 0 && unitIndex < units.length) {
    const chunk = n % 1000;
    if (chunk > 0) {
      const full = parts.length > 0; // need full reading when there are higher units
      const chunkWords = readThreeDigits(chunk, full);
      const unitLabel = units[unitIndex];
      parts.unshift([chunkWords, unitLabel].filter(Boolean).join(" "));
    }
    n = Math.floor(n / 1000);
    unitIndex++;
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function currencyToVietnameseText(n: number): string {
  const words = numberToVietnameseWords(Math.round(n));
  if (!words) return "";
  return `${words} đồng`;
}
