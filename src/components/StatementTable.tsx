'use client';

import React from 'react';
import { Transaction } from '@/types';
import { formatAmount, getTotals } from '@/lib/calculations';
import { formatTafqeet } from '@/lib/tafqeet';

interface StatementTableProps {
  transactions: Transaction[];
  currency?: string;
  onRowClick?: (tx: Transaction) => void;
}

export const StatementTable: React.FC<StatementTableProps> = ({
  transactions,
  currency = 'ريال',
  onRowClick,
}) => {
  const totals = getTotals(transactions);
  const tafqeetText = formatTafqeet(totals.finalBalance, currency);

  return (
    <div className="w-full flex flex-col items-center">
      {/* 100% Mobile Table */}
      <div className="w-full overflow-hidden">
        <table className="statement-table w-full border-collapse text-center">
          <thead>
            <tr className="bg-[#0b57d0] text-white">
              <th className="font-bold border border-slate-600 w-[12%]">الرصيد</th>
              <th className="font-bold border border-slate-600 w-[11%]">له</th>
              <th className="font-bold border border-slate-600 w-[11%]">عليه</th>
              <th className="font-bold border border-slate-600 w-[24%]">التفاصيل</th>
              <th className="font-bold border border-slate-600 w-[14%]">نوع السند</th>
              <th className="font-bold border border-slate-600 w-[17%]">التاريخ</th>
              <th className="font-bold border border-slate-600 w-[7%]">الرقم</th>
              <th className="font-bold border border-slate-600 w-[4%]">م</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 font-medium">
                  لا توجد حركات مسجلة
                </td>
              </tr>
            ) : (
              transactions.map((tx, idx) => {
                return (
                  <tr
                    key={tx.id || idx}
                    onClick={() => onRowClick?.(tx)}
                    className="hover:bg-blue-50/70 active:bg-blue-100 transition-colors cursor-pointer select-none border-b border-slate-400"
                  >
                    {/* الرصيد (Balance) - Bold Dark Blue */}
                    <td className="font-bold text-[#0f3460] whitespace-nowrap">
                      {formatAmount(tx.balance, true)}
                    </td>

                    {/* له (Credit) - Bold Dark Blue */}
                    <td className="font-bold text-[#0f3460] whitespace-nowrap">
                      {formatAmount(tx.credit)}
                    </td>

                    {/* عليه (Debit) - Bold Red */}
                    <td className="font-bold text-[#dc2626] whitespace-nowrap">
                      {formatAmount(tx.debit)}
                    </td>

                    {/* التفاصيل (Details) */}
                    <td className="font-semibold text-slate-900 leading-tight px-1">
                      {tx.details || ''}
                    </td>

                    {/* نوع السند (Voucher Type) */}
                    <td className="font-semibold text-slate-800 whitespace-nowrap">
                      {tx.voucherType}
                    </td>

                    {/* التاريخ (Date) */}
                    <td className="font-semibold text-slate-800 whitespace-nowrap text-[10.5px] sm:text-[12px]">
                      {tx.date}
                    </td>

                    {/* الرقم (Voucher No) */}
                    <td className="font-semibold text-slate-800 whitespace-nowrap">
                      {tx.voucherNo}
                    </td>

                    {/* م (Index) */}
                    <td className="font-semibold text-slate-600 whitespace-nowrap text-[10.5px] sm:text-[12px]">
                      {tx.seq ?? idx + 1}
                    </td>
                  </tr>
                );
              })
            )}

            {/* Total Row (الاجمالي) - Exact Cyan Highlight (#00e5ff) as in Screenshot */}
            <tr className="font-bold border-t-2 border-slate-700">
              {/* الرصيد الإجمالي */}
              <td className="bg-[#00e5ff] text-slate-950 font-black text-[12px] sm:text-[14px] border border-slate-600 whitespace-nowrap">
                {formatAmount(totals.finalBalance, true)}
              </td>

              {/* إجمالي له */}
              <td className="bg-[#00e5ff] text-slate-950 font-black text-[12px] sm:text-[14px] border border-slate-600 whitespace-nowrap">
                {formatAmount(totals.totalCredit, true)}
              </td>

              {/* إجمالي عليه */}
              <td className="bg-[#00e5ff] text-slate-950 font-black text-[12px] sm:text-[14px] border border-slate-600 whitespace-nowrap">
                {formatAmount(totals.totalDebit, true)}
              </td>

              {/* كلمة الاجمالي ممتدة عبر الـ 5 أعمدة */}
              <td
                colSpan={5}
                className="py-1.5 border border-slate-600 text-center bg-white font-black text-[13px] sm:text-[15px] text-slate-900"
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
        <div className="text-[#0b57d0] font-black text-[14px] sm:text-[16px] tracking-wide mb-1 leading-snug">
          {tafqeetText}
        </div>

        {/* Accounting disclaimer note */}
        <div className="text-[11px] sm:text-[12px] text-slate-600 font-medium leading-relaxed max-w-md">
          نرجو مراجعة الحساب ومطابقته والإشعار بأي ملاحظة خلال 3 أيام وإلا يعتبر الكشف صحيحاً ومعتمداً.
        </div>
      </div>
    </div>
  );
};
