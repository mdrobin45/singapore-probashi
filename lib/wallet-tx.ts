// Client-safe — no prisma import. Shared wallet transaction labels and the
// user-to-user transfer fee math (see lib/wallet.ts for the server side).

export const WALLET_TX_LABELS: Record<string, string> = {
  DEPOSIT: "Deposit",
  WITHDRAWAL: "Withdrawal",
  SHARE_PURCHASE: "Share Purchase",
  SHARE_SALE: "Share Sale",
  REFUND: "Refund",
  COMMISSION: "Referral Commission",
  ADMIN_CREDIT: "Admin Credit",
  ADMIN_DEBIT: "Admin Debit",
  CHECKOUT_PAYMENT: "Checkout Payment",
  TRANSFER_SENT: "Money Sent",
  TRANSFER_RECEIVED: "Money Received",
  TRANSFER_FEE: "Transfer Fee",
  PICKPUT_PAYMENT: "Pick & Put Payment",
  PICKPUT_EARNING: "Pick & Put Earning",
};

export const CREDIT_TX_TYPES = new Set([
  "DEPOSIT",
  "SHARE_SALE",
  "REFUND",
  "COMMISSION",
  "ADMIN_CREDIT",
  "TRANSFER_RECEIVED",
  "PICKPUT_EARNING",
]);

export type TransferFeeMode = "PERCENTAGE" | "FIXED";
export type TransferFeeSetting = { mode: TransferFeeMode; value: number };

export const DEFAULT_TRANSFER_FEE: TransferFeeSetting = { mode: "PERCENTAGE", value: 0 };

// Fee the sender pays on top of the amount — the recipient always gets the
// full amount.
export function computeTransferFee(setting: TransferFeeSetting, amount: number): number {
  const raw = setting.mode === "FIXED" ? setting.value : amount * (setting.value / 100);
  return Math.max(0, Math.round(raw * 100) / 100);
}
