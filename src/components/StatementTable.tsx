'use client';

import React from 'react';
import { Transaction } from '@/types';
import { formatAmount, getTotals } from '@/lib/calculations';
import { formatTafqeet } from '@/lib/tafqeet';

export type SizeMode = 'compact' | 'normal' | 'large';

interface StatementTableProps {
  transactions: Transaction[];
  currency?: string;
  sizeMode?: SizeMode;
  onRowClick?: (tx: Transaction) => void;
}

export const StatementTable: React.FC<StatementTableProps> = ({
  transactions,
  currency = 'ريال',
  sizeMode = 'normal',
  onRowClick,
}) => {
  const totals = getTotals(transactions);
  const tafqeetText = formatTafqeet(totals.finalBalance, currency);

  // Responsive typography classes based on sizeMode
  const sizeClasses = {
    compact: {
      table: 'text-[10px] sm:text-[11px]',
      th: 'py-1 px-0.5',
      td: 'py-0.5 px-0.5',
      totalTh: 'text-[11px]',
      totalTd: 'text-[11px]',
      tafqeet: 'text-[12.5px]',
    },
    normal: {
      table: 'text-[11px] sm:text-[12px]',
      th: 'py-1.5 px-0.5 sm:px-1',
      td: 'py-1 px-0.5 sm:px-1',
      totalTh: 'text-[12px] sm:text-[13px]',
      totalTd: 'text-[12px] sm:text-[13px]',
      tafqeet: 'text-[13.5px] sm:text-[15px]',
    },
    large: {
      table: 'text-[12.5px] sm:text-[13.5px]',
      th: 'py-2 px-1',
      td: 'py-1.5 px-1',
      totalTh: 'text-[13.5px] sm:text-[14.5px]',
      totalTd: 'text-[13.5px] sm:text-[14.5px]',
      tafqeet: 'text-[15px] sm:text-[16.5px]',
    },
  }[sizeMode];

  return (
    <div className="w-full flex flex-col items-center">
      {/* 
        Horizontal scrollable wrapper ensures 100% visibility on all mobile widths.
        Columns are ordered Right to Left matching the screenshot:
        م -> الرقم -> التاريخ -> نوع السند -> التفاصيل -> عليه -> له -> الرصيد
      */}
      <div className="w-full overflow-x-auto select-none">
        <table
          className={`w-full border-collapse text-center leading-tight ${sizeClasses.table}`}
          style={{ minWidth: sizeMode === 'large' ? '460px' : '350px' }}
        >
          <thead>
            {/* Header: Exact Dark/Vivid Blue matching screenshot */}
            <tr className="bg-[#0b57d0] text-white">
              <th className={`font-bold border border-slate-600 w-[5%] ${sizeClasses.th}`}>م</th>
              <th className={`font-bold border border-slate-600 w-[7%] ${sizeClasses.th}`}>الرقم</th>
              <th className={`font-bold border border-slate-600 w-[17%] ${sizeClasses.th}`}>التاريخ</th>
              <th className={`font-bold border border-slate-600 w-[14%] ${sizeClasses.th}`}>نوع السند</th>
              <th className={`font-bold border border-slate-600 w-[27%] ${sizeClasses.th}`}>التفاصيل</th>
              <th className={`font-bold border border-slate-600 w-[10%] ${sizeClasses.th}`}>عليه</th>
              <th className={`font-bold border border-slate-600 w-[10%] ${sizeClasses.th}`}>له</th>
              <th className={`font-bold border border-slate-600 w-[10%] ${sizeClasses.th}`}>الرصيد</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 font-medium">
                  لا توجد حركات مسجلة في هذا الكشف
                </td>
              </tr>
            ) : (
              transactions.map((tx, idx) => {
                return (
                  <tr
                    key={tx.id || idx}
                    onClick={() => onRowClick?.(tx)}
                    className="hover:bg-blue-50/80 active:bg-blue-100 transition-colors cursor-pointer border-b border-slate-400"
                  >
                    {/* 1. م (Index - Far Right) */}
                    <td className={`font-semibold text-slate-600 border border-slate-400 whitespace-nowrap ${sizeClasses.td}`}>
                      {tx.seq ?? idx + 1}
                    </td>

                    {/* 2. الرقم (Voucher No) */}
                    <td className={`font-bold text-slate-800 border border-slate-400 whitespace-nowrap ${sizeClasses.td}`}>
                      {tx.voucherNo}
                    </td>

                    {/* 3. التاريخ (Date) */}
                    <td className={`font-semibold text-slate-800 border border-slate-400 whitespace-nowrap ${sizeClasses.td}`}>
                      {tx.date}
                    </td>

                    {/* 4. نوع السند (Voucher Type: سند قبض / سند صرف) */}
                    <td className={`font-semibold text-slate-800 border border-slate-400 whitespace-nowrap ${sizeClasses.td}`}>
                      {tx.voucherType}
                    </td>

                    {/* 5. التفاصيل (Details / Description) */}
                    <td className={`font-semibold text-slate-900 border border-slate-400 text-center ${sizeClasses.td}`}>
                      {tx.details || ''}
                    </td>

                    {/* 6. عليه (Debit - Bold Red) */}
                    <td className={`font-bold text-[#dc2626] border border-slate-400 whitespace-nowrap ${sizeClasses.td}`}>
                      {formatAmount(tx.debit)}
                    </td>

                    {/* 7. له (Credit - Bold Blue) */}
                    <td className={`font-bold text-[#0f3460] border border-slate-400 whitespace-nowrap ${sizeClasses.td}`}>
                      {formatAmount(tx.credit)}
                    </td>

                    {/* 8. الرصيد (Balance - Bold Blue - Far Left) */}
                    <td className={`font-bold text-[#0f3460] border border-slate-400 whitespace-nowrap ${sizeClasses.td}`}>
                      {formatAmount(tx.balance, true)}
                    </td>
                  </tr>
                );
              })
            )}

            {/* Total Row (الاجمالي) matching the exact screenshot layout */}
            <tr className="font-bold border-t-2 border-slate-700">
              {/* كلمة الاجمالي ممتدة عبر الـ 5 أعمدة الأولى (م، الرقم، التاريخ، نوع السند، التفاصيل) */}
              <td
                colSpan={5}
                className={`border border-slate-600 text-center bg-white font-black text-slate-950 ${sizeClasses.totalTh}`}
              >
                الاجمالي
              </td>

              {/* إجمالي عليه - Cyan Background #00e5ff */}
              <td className={`bg-[#00e5ff] text-slate-950 font-black border border-slate-600 whitespace-nowrap ${sizeClasses.totalTd}`}>
                {formatAmount(totals.totalDebit, true)}
              </td>

              {/* إجمالي له - Cyan Background #00e5ff */}
              <td className={`bg-[#00e5ff] text-slate-950 font-black border border-slate-600 whitespace-nowrap ${sizeClasses.totalTd}`}>
                {formatAmount(totals.totalCredit, true)}
              </td>

              {/* الرصيد الإجمالي الصافي - Cyan Background #00e5ff (Far Left) */}
              <td className={`bg-[#00e5ff] text-slate-950 font-black border border-slate-600 whitespace-nowrap ${sizeClasses.totalTd}`}>
                {formatAmount(totals.finalBalance, true)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tafqeet & Footer Disclaimer under the table */}
      <div className="w-full mt-3 px-2 flex flex-col items-center text-center">
        {/* Tafqeet in Bold Blue matching the screenshot */}
        <div className={`text-[#0b57d0] font-black tracking-tight mb-1 leading-snug ${sizeClasses.tafqeet}`}>
          {tafqeetText}
        </div>

        {/* Accounting disclaimer note */}
        <div className="text-[11px] sm:text-[12px] text-slate-500 font-medium leading-relaxed max-w-md">
          نرجو مراجعة الحساب ومطابقته والإشعار بأي ملاحظة خلال 3 أيام وإلا يعتبر الكشف صحيحاً ومطابقاً.
        </div>
      </div>
    </div>
  );
};
