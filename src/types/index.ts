export type VoucherType = 'سند صرف' | 'سند قبض';

export interface Transaction {
  id: string;
  seq?: number;              // م (Row sequence)
  voucherNo: string | number; // الرقم (Document / Voucher number)
  date: string;              // التاريخ (DD/MM/YYYY)
  voucherType: VoucherType;   // نوع السند
  details: string;           // التفاصيل
  debit: number;             // عليه (Spent / paid out / penalty)
  credit: number;            // له (Delivered / earned / receipt)
  balance?: number;          // الرصيد (Calculated running balance)
  quantity?: number;         // اختياري: الكمية
  unitPrice?: number;        // اختياري: سعر القطعة
}

export interface Account {
  id: string;
  name: string;              // اسم الحساب (مثل: ياسر)
  subtitle?: string;         // ورشة تفصيل / صنايعي / مورد
  phone?: string;
  currency: string;          // ريال / جنيه / دولار
  startDate?: string;
  endDate?: string;
  transactions: Transaction[];
}

export type ViewMode = 'exact-mobile' | 'dashboard' | 'print';

