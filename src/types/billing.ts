// Billing & Invoice Type Definitions

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  userName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface CreateInvoiceRequest {
  userId: string;
  items: InvoiceItem[];
  dueDate: string;
}

export interface Refund {
  id: string;
  transactionId: string;
  userId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  adminNotes?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface RefundRequest {
  transactionId: string;
  amount: number;
  reason: string;
}

export interface ProcessRefundRequest {
  status: 'approved' | 'rejected';
  adminNotes?: string;
}

export interface BillingReport {
  totalRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageTransactionValue: number;
  topStations?: Array<{
    stationId: string;
    stationName: string;
    revenue: number;
  }>;
}

export interface ExportBillingQuery {
  startDate: string;
  endDate: string;
  format: 'csv' | 'pdf' | 'excel';
}
