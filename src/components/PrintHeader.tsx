'use client';

import React from 'react';
import { Account } from '@/types';

interface PrintHeaderProps {
  account: Account;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({ account }) => {
  const [printDate, setPrintDate] = React.useState<string>('27/10/2026');

  React.useEffect(() => {
    setPrintDate(new Date().toLocaleDateString('ar-EG'));
  }, []);

  return (
    <div className="w-full mb-4 pb-3 border-b-2 border-slate-700 hidden print:block">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">نظام إدارة الحسابات والورش</h1>
          <p className="text-sm text-slate-600 font-medium">سندات القبض والصرف وكشوف الحسابات المعتمدة</p>
        </div>
        <div className="text-left text-xs text-slate-500 font-medium space-y-0.5">
          <p>تاريخ الطباعة: {printDate}</p>
          <p>الصفحة: 1 من 1</p>
        </div>
      </div>

      <div className="mt-3 p-2 bg-slate-50 border border-slate-300 rounded flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">كشف حساب:</span>
          <span className="font-extrabold text-blue-700 text-base">{account.name}</span>
          {account.subtitle && <span className="text-slate-500 text-xs">({account.subtitle})</span>}
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-700 font-bold">
          <span>من: {account.startDate || '18/08/2026'}</span>
          <span>إلى: {account.endDate || '21/10/2026'}</span>
          <span>العملة: {account.currency}</span>
        </div>
      </div>
    </div>
  );
};

export const PrintFooter: React.FC = () => {
  return (
    <div className="w-full mt-8 pt-4 border-t border-slate-400 hidden print:grid grid-cols-3 gap-6 text-center text-xs font-bold text-slate-700">
      <div>
        <p className="mb-8">توقيع المستلم / العميل</p>
        <div className="border-b border-dashed border-slate-400 w-36 mx-auto"></div>
      </div>
      <div>
        <p className="mb-8">ختم الورشة / المؤسسة</p>
        <div className="border-b border-dashed border-slate-400 w-36 mx-auto"></div>
      </div>
      <div>
        <p className="mb-8">توقيع المحاسب / الإدارة</p>
        <div className="border-b border-dashed border-slate-400 w-36 mx-auto"></div>
      </div>
    </div>
  );
};
