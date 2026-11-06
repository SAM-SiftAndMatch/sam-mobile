import { apiRequest, requestKey } from './api/client';
export interface IncomeMonth {
  month: number;
  netIncome: number;
  grossIncome: number;
  platformFees: number;
  completedCount: number;
  sandboxNetIncome: number;
}
export interface FreelancerIncome {
  currency: string;
  timezone: string;
  year: number;
  totalNetIncome: number;
  totalGrossIncome: number;
  totalPlatformFees: number;
  completedCount: number;
  sandboxNetIncome: number;
  yearNetIncome: number;
  yearGrossIncome: number;
  yearPlatformFees: number;
  yearCompletedCount: number;
  yearSandboxNetIncome: number;
  months: IncomeMonth[];
}
export interface IncomeEntry {
  id: string;
  jobId: string;
  jobTitle: string;
  maintenanceOrderId?: string;
  acceptedAt: string;
  grossIncome: number;
  platformFees: number;
  netIncome: number;
}
export interface IncomeEntries {
  items: IncomeEntry[];
  page: number;
  size: number;
  totalElements: number;
  year: number;
}
export interface BankSetupStatus {
  status: 'READY' | 'PENDING' | 'ACTION_REQUIRED';
  hasVerifiedAccount: boolean;
  hasBankAccount: boolean;
  needsBankAccount: boolean;
  pendingCount: number;
}
export interface Bank {
  id: string;
  bankCode: string;
  lastFour: string;
  status: string;
  verificationNote?: string;
}
export interface Withdrawal {
  id: string;
  bankCode: string;
  lastFour: string;
  amount: number;
  status: string;
  createdAt: string;
  history?: { action: string; detail: string; createdAt: string }[];
}
export interface FinanceTransaction {
  id: string;
  description: string;
  createdAt: string;
  sandbox: boolean;
  grossAmount: number;
  payableChange: number;
}
export interface Wallet {
  availableBalance: number;
  pendingBalance: number;
  heldBalance: number;
  reservedBalance: number;
  paidTotal: number;
  sandboxBalance: number;
  withdrawalsEnabled: boolean;
  minimumWithdrawal: number;
  dailyWithdrawalLimit: number;
  escrowGross: number;
  lockedDeposit: number;
  payables: {
    id: string;
    jobId: string;
    jobTitle: string;
    earnings: number;
    depositRefund: number;
    availableAt: string;
    blocked: boolean;
    sandbox: boolean;
  }[];
}
export interface Maintenance {
  warrantyEndsAt: string;
  maintenanceStatus: string;
  openIssueCount: number;
  canCreateWarrantyTicket: boolean;
  canRequestPaidMaintenance: boolean;
  payoutBlocked: boolean;
}
export interface Ticket {
  id: string;
  title: string;
  description: string;
  kind: 'WARRANTY' | 'PAID';
  status: string;
  closedAt?: string;
  resolutionDueAt: string;
  events?: { id: string; action: string; content: string; createdAt: string }[];
}
export const statusLabel: Record<string, string> = {
  REQUESTED: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  PROCESSING: 'Đang chuyển tiền',
  RECONCILIATION_REQUIRED: 'Đang đối soát',
  PAID: 'Đã chuyển ngân hàng',
  FAILED: 'Đã xác nhận thất bại',
  REJECTED: 'Bị từ chối',
  CANCELLED: 'Đã hủy',
  PENDING: 'Chờ xác minh',
  VERIFIED: 'Đã xác minh',
  DISABLED: 'Ngừng sử dụng',
  OPEN: 'Mới mở',
  IN_PROGRESS: 'Đang xử lý',
  WAITING_CLIENT: 'Chờ khách hàng',
  FIX_SUBMITTED: 'Chờ kiểm tra bản vá',
  DISPUTED: 'Cần admin hỗ trợ',
  RESOLVED: 'Đã giải quyết',
  OUT_OF_SCOPE: 'Ngoài phạm vi',
  WITHDRAWN: 'Đã rút ticket',
};
export const money = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);
export const dateTime = (value: string) => new Date(value).toLocaleString('vi-VN');
export const finance = {
  income: (year?: number) =>
    apiRequest<FreelancerIncome>(`/finance/income${year === undefined ? '' : `?year=${year}`}`),
  incomeEntries: (year: number, page = 0) =>
    apiRequest<IncomeEntries>(`/finance/income/entries?year=${year}&page=${page}`),
  bankSetup: () => apiRequest<BankSetupStatus>('/finance/bank-accounts/setup-status'),
  transactions: (page = 0) =>
    apiRequest<FinanceTransaction[]>(`/finance/transactions?page=${page}`),
  wallet: () => apiRequest<Wallet>('/finance/wallet'),
  banks: () => apiRequest<Bank[]>('/finance/bank-accounts'),
  withdrawals: (page = 0) => apiRequest<Withdrawal[]>(`/finance/withdrawals?page=${page}`),
  requestKey,
};
