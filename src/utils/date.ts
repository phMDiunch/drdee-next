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
  date: string | Date | undefined | null,
  format: string = "DD/MM/YYYY HH:mm:ss"
): string {
  if (!date) return "";
  // Parse date và đảm bảo hiển thị theo timezone VN
  return dayjs(date).tz(VN_TZ).format(format);
}

/**
 * Format hiển thị ngày (DD/MM/YYYY) ở VN
 */
export function formatDateVN(date: string | Date | undefined | null): string {
  if (!date) return "";
  return dayjs(date).tz(VN_TZ).format("DD/MM/YYYY");
}

/**
 * Convert ngày giờ nhập từ DatePicker (dayjs obj hoặc Date) sang ISO string với timezone VN (lưu DB)
 */
export function toISOStringVN(
  input: dayjs.Dayjs | Date | string | undefined
): string | undefined {
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

/**
 * Tạo timestamp hiện tại với timezone VN (dùng cho database)
 */
export function nowVN(): string {
  return dayjs().tz(VN_TZ).format();
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
 * @param dob Ngày sinh (hỗ trợ cả ISO string từ DB và định dạng DD/MM/YYYY)
 * @returns Tuổi
 */
export const calculateAge = (dob: string | Date): number => {
  const today = dayjs();

  // Tự động detect format - dayjs sẽ parse ISO string, còn DD/MM/YYYY cần chỉ định format
  let birthDate: dayjs.Dayjs;

  // Nếu là Date object
  if (dob instanceof Date) {
    birthDate = dayjs(dob);
  }
  // Nếu là string và có dạng DD/MM/YYYY (có chứa dấu /)
  else if (typeof dob === "string" && dob.includes("/")) {
    birthDate = dayjs(dob, "DD/MM/YYYY");
  }
  // Ngược lại assume là ISO string hoặc format khác mà dayjs tự parse được
  else {
    birthDate = dayjs(dob);
  }

  return today.diff(birthDate, "year");
};

/**
 * Định dạng số tiền theo định dạng của Việt Nam
 * @param amount Số tiền
 * @returns Chuỗi định dạng số tiền
 */
export const formatCurrency = (amount: number): string => {
  if (!amount && amount !== 0) return "0 đ";
  return amount.toLocaleString("vi-VN") + " đ";
};
