// src/features/payment/constants.ts

export const PAYMENT_METHODS = [
  { label: "Tiền mặt", value: "Tiền mặt", color: "green", icon: "💵" },
  {
    label: "Quẹt thẻ thường",
    value: "Quẹt thẻ thường",
    color: "blue",
    icon: "💳",
  },
  {
    label: "Quẹt thẻ Visa",
    value: "Quẹt thẻ Visa",
    color: "purple",
    icon: "💎",
  },
  { label: "Chuyển khoản", value: "Chuyển khoản", color: "orange", icon: "🏦" },
] as const;

export const PAYMENT_STATUS = [
  { label: "Đã thanh toán", value: "paid", color: "green" },
  { label: "Chưa thanh toán", value: "unpaid", color: "red" },
  { label: "Thanh toán một phần", value: "partial", color: "orange" },
] as const;

// Helper functions
export const getPaymentMethodConfig = (method: string) => {
  return (
    PAYMENT_METHODS.find((pm) => pm.value === method) || PAYMENT_METHODS[0]
  );
};

export const categorizePaymentMethods = (
  details: Array<{ amount: number; paymentMethod: string }>
) => {
  const summary = {
    cash: 0, // Tiền mặt
    cardNormal: 0, // Quẹt thẻ thường
    cardVisa: 0, // Quẹt thẻ Visa
    transfer: 0, // Chuyển khoản
  };

  details.forEach((detail) => {
    const amount = detail.amount || 0;
    switch (detail.paymentMethod) {
      case "Tiền mặt":
        summary.cash += amount;
        break;
      case "Quẹt thẻ thường":
        summary.cardNormal += amount;
        break;
      case "Quẹt thẻ Visa":
        summary.cardVisa += amount;
        break;
      case "Chuyển khoản":
        summary.transfer += amount;
        break;
      default:
        summary.cash += amount; // Default to cash
    }
  });

  return summary;
};
