import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const VN_TZ = "Asia/Ho_Chi_Minh";

/**
 * Format hiển thị ngày giờ cho user (DD/MM/YYYY HH:mm:ss) ở VN
 */
export function formatDateTimeVN(
  date: string | Date | undefined | null
): string {
  if (!date) return "";
  return dayjs(date).tz(VN_TZ).format("DD/MM/YYYY HH:mm:ss");
}

/**
 * Format hiển thị ngày (DD/MM/YYYY) ở VN
 */
export function formatDateVN(date: string | Date | undefined | null): string {
  if (!date) return "";
  return dayjs(date).tz(VN_TZ).format("DD/MM/YYYY");
}

/**
 * Convert ngày giờ nhập từ DatePicker (dayjs obj hoặc Date) sang ISO string UTC (lưu DB)
 */
export function toISOStringUTC(input: any): string | undefined {
  if (!input) return undefined;
  // Nếu là dayjs object
  if (dayjs.isDayjs(input)) {
    return input.tz(VN_TZ).toDate().toISOString();
  }
  // Nếu là Date
  if (input instanceof Date) {
    return dayjs(input).tz(VN_TZ).toDate().toISOString();
  }
  // Nếu là string đã đúng format thì trả về luôn
  if (typeof input === "string") return input;
  return undefined;
}

/**
 * Parse ISO string UTC ra dayjs object ở múi giờ VN (dùng cho DatePicker initialValue)
 */
export function parseDateFromISOString(dateStr?: string) {
  if (!dateStr) return undefined;
  return dayjs(dateStr).tz(VN_TZ);
}

/**
 * Tính tuổi dựa vào ngày sinh
 * @param dob Ngày sinh (định dạng DD/MM/YYYY)
 * @returns Tuổi
 */
export const calculateAge = (dob: string): number => {
  const today = dayjs();
  const birthDate = dayjs(dob, "DD/MM/YYYY");
  return today.diff(birthDate, "year");
};
