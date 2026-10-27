'use client';

import React from 'react';
import { Transaction } from '@/types';
import { formatAmount, getTotals } from '@/lib/calculations';
import { formatTafqeet } from '@/lib/tafqeet';
import { Trash2, Edit2 } from 'lucide-react';

interface StatementTableProps {
  transactions: Transaction[];
  currency?: string;
  isEditable?: boolean;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
}

export const StatementTable: React.FC<StatementTableProps> = ({
  transactions,
  currency = 'ريال',
  isEditable = false,
  onEdit,
  onDelete,
}) => {
  const totals = getTotals(transactions);
  const tafqeetText = formatTafqeet(totals.finalBalance, currency);

  return (
    <div className="w-full flex flex-col items-center">
      {/* The Exact Table matching the screenshot */}
      <div className="w-full overflow-x-auto">
        <table className="statement-table border-collapse text-[13px] md:text-[14px] text-center w-full">
          <thead>
            <tr className="bg-[#1059c2] text-white">
              <th className="py-2.5 px-2 border border-slate-500 font-bold min-w-[70px]">الرصيد</th>
              <th className="py-2.5 px-2 border border-slate-500 font-bold min-w-[75px]">له</th>
              <th className="py-2.5 px-2 border border-slate-500 font-bold min-w-[75px]">عليه</th>
              <th className="py-2.5 px-2 border border-slate-500 font-bold min-w-[140px] max-w-[240px]">التفاصيل</th>
              <th className="py-2.5 px-2 border border-slate-500 font-bold min-w-[75px]">نوع السند</th>
              <th className="py-2.5 px-2 border border-slate-500 font-bold min-w-[85px]">التاريخ</th>
              <th className="py-2.5 px-2 border border-slate-500 font-bold min-w-[45px]">الرقم</th>
              <th className="py-2.5 px-1.5 border border-slate-500 font-bold w-[32px]">م</th>
              {isEditable && <th className="py-2.5 px-1 border border-slate-500 font-bold w-[65px] no-print">إجراءات</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-400">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={isEditable ? 9 : 8} className="py-6 text-center text-slate-500">
                  لا توجد حركات مسجلة في هذا الكشف
                </td>
              </tr>
            ) : (
              transactions.map((tx, idx) => {
                return (
                  <tr
                    key={tx.id || idx}
                    className="hover:bg-blue-50/50 transition-colors border-b border-slate-400"
                  >
                    {/* الرصيد (Balance) - Bold Dark Blue */}
                    <td className="py-1.5 px-2 border border-slate-400 font-bold text-[#123970] whitespace-nowrap">
                      {formatAmount(tx.balance, true)}
                    </td>

                    {/* له (Credit) - Bold Blue */}
                    <td className="py-1.5 px-2 border border-slate-400 font-bold text-[#123970] whitespace-nowrap">
                      {formatAmount(tx.credit)}
                    </td>

                    {/* عليه (Debit) - Bold Red */}
                    <td className="py-1.5 px-2 border border-slate-400 font-bold text-[#d00000] whitespace-nowrap">
                      {formatAmount(tx.debit)}
                    </td>

                    {/* التفاصيل (Details) */}
                    <td className="py-1.5 px-2 border border-slate-400 font-medium text-slate-900 text-center">
                      {tx.details || ''}
                    </td>

                    {/* نوع السند (Voucher Type) */}
                    <td className="py-1.5 px-2 border border-slate-400 font-medium text-slate-800 whitespace-nowrap">
                      {tx.voucherType}
                    </td>

                    {/* التاريخ (Date) */}
                    <td className="py-1.5 px-1.5 border border-slate-400 font-medium text-slate-800 whitespace-nowrap text-xs md:text-[13px]">
                      {tx.date}
                    </td>

                    {/* الرقم (Voucher No) */}
                    <td className="py-1.5 px-1 border border-slate-400 font-medium text-slate-800 whitespace-nowrap">
                      {tx.voucherNo}
                    </td>

                    {/* م (Index) */}
                    <td className="py-1.5 px-1 border border-slate-400 font-medium text-slate-600 whitespace-nowrap">
                      {tx.seq ?? idx + 1}
                    </td>

                    {isEditable && (
                      <td className="py-1 px-1 border border-slate-400 whitespace-nowrap no-print text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEdit?.(tx)}
                            title="تعديل السند"
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete?.(tx.id)}
                            title="حذف السند"
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}

            {/* Total Row (الاجمالي) - Exact Cyan Highlight as in Screenshot */}
            <tr className="font-bold border-t-2 border-slate-600 text-slate-900">
              {/* الرصيد الإجمالي */}
              <td className="py-2 px-2 border border-slate-500 bg-[#00e5ff] text-slate-950 text-center font-bold text-[14px] md:text-[15px]">
                {formatAmount(totals.finalBalance, true)}
              </td>

              {/* إجمالي له */}
              <td className="py-2 px-2 border border-slate-500 bg-[#00e5ff] text-slate-950 text-center font-bold text-[14px] md:text-[15px]">
                {formatAmount(totals.totalCredit, true)}
              </td>

              {/* إجمالي عليه */}
              <td className="py-2 px-2 border border-slate-500 bg-[#00e5ff] text-slate-950 text-center font-bold text-[14px] md:text-[15px]">
                {formatAmount(totals.totalDebit, true)}
              </td>

              {/* كلمة الاجمالي ممتدة */}
              <td
                colSpan={isEditable ? 6 : 5}
                className="py-2 px-3 border border-slate-500 text-center bg-white font-extrabold text-[15px] text-slate-900"
              >
                الاجمالي
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tafqeet & Footer Disclaimer under the table */}
      <div className="w-full mt-3 px-2 flex flex-col items-center text-center">
        {/* Tafqeet in Bold Blue matching the screenshot */}
        <div className="text-[#1059c2] font-bold text-[15px] md:text-[16px] tracking-wide mb-1.5">
          {tafqeetText}
        </div>

        {/* Accounting disclaimer note */}
        <div className="text-[12px] md:text-[13px] text-slate-500 font-medium">
          نرجو مراجعة كشف الحساب ومطابقته والإشعار بأي ملاحظة خلال 3 أيام وإلا يعتبر الكشف صحيحاً ومعتمداً.
        </div>
      </div>
    </div>
  );
};
