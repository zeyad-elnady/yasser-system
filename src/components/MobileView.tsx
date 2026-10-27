'use client';

import React from 'react';
import { Account, Transaction } from '@/types';
import { StatementTable } from './StatementTable';
import {
  ArrowLeft,
  Clock,
  MoreVertical,
  Wifi,
  BatteryCharging,
  Signal,
  Printer,
  Share2,
  Download,
} from 'lucide-react';

interface MobileViewProps {
  account: Account;
  transactions: Transaction[];
  onOpenHistory?: () => void;
  onOpenMenu?: () => void;
  onBack?: () => void;
}

export const MobileView: React.FC<MobileViewProps> = ({
  account,
  transactions,
  onOpenHistory,
  onOpenMenu,
  onBack,
}) => {
  return (
    <div className="w-full max-w-[430px] mx-auto bg-white rounded-[28px] shadow-2xl border-4 border-slate-800 overflow-hidden flex flex-col min-h-[860px] text-slate-900 relative">
      {/* 1. Android Status Bar (matching 4:18 / 3% battery in screenshot) */}
      <div className="bg-white px-4 pt-2.5 pb-1 flex items-center justify-between text-xs text-slate-800 font-sans select-none border-b border-slate-100">
        <div className="flex items-center gap-1.5 font-bold">
          <span>%3</span>
          <BatteryCharging className="w-4 h-4 text-slate-700" />
          <Wifi className="w-3.5 h-3.5 text-slate-700" />
          <Signal className="w-3.5 h-3.5 text-slate-700" />
          <span className="text-[10px] text-slate-500 mr-1">١,١١ ك.ب/ث</span>
        </div>

        <div className="flex items-center gap-2 font-bold">
          <span className="text-[10px] text-slate-400">••</span>
          <span>4:18</span>
        </div>
      </div>

      {/* 2. Top Header App Bar (matching screenshot: 3 dots, Clock, Title, Left Arrow) */}
      <div className="bg-white px-3 py-2 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMenu}
            className="p-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
            title="خيارات إضافية"
          >
            <MoreVertical className="w-6 h-6" />
          </button>

          <button
            onClick={onOpenHistory}
            className="p-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
            title="سجل الحساب"
          >
            <Clock className="w-6 h-6" />
          </button>
        </div>

        {/* Title truncated like the screenshot: كشف حساب حـ... يا... */}
        <div className="text-right flex-1 mx-2">
          <h1
            className="text-[19px] font-black tracking-tight text-slate-900 truncate"
            title={`كشف حساب ${account.name}`}
          >
            كشف حساب {account.name}
          </h1>
        </div>

        <button
          onClick={onBack}
          className="p-1 text-slate-800 hover:text-black hover:bg-slate-100 rounded-full transition"
          title="رجوع"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* 3. Date Range Header (من تاريخ ... إلى تاريخ ...) */}
      <div className="bg-white py-1 px-3 text-center border-b border-slate-200 text-xs text-slate-700 font-semibold">
        <span>من تاريخ {account.startDate || '18/08/2026'}</span>
        <span className="mx-2">إلى تاريخ {account.endDate || '21/10/2026'}</span>
      </div>

      {/* 4. Table Area with Floating 1/1 Page Indicator */}
      <div className="relative flex-1 p-1 bg-white overflow-y-auto">
        {/* Floating 1/1 Badge matching screenshot overlay */}
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <div className="bg-slate-900/60 backdrop-blur-xs text-white text-[12px] font-bold px-2 py-0.5 rounded-full shadow">
            1/1
          </div>
        </div>

        {/* Exact Table */}
        <StatementTable
          transactions={transactions}
          currency={account.currency}
          isEditable={false}
        />
      </div>

      {/* 5. Mobile Quick Action Footer bar */}
      <div className="bg-slate-50 border-t border-slate-200 p-2.5 flex items-center justify-around text-xs font-bold text-slate-700">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة كشف</span>
        </button>

        <button
          onClick={() => {
            const text = `كشف حساب ${account.name}\nإجمالي له: ${transactions.reduce((s,t)=>s+(t.credit||0),0).toLocaleString()} ${account.currency}\nإجمالي عليه: ${transactions.reduce((s,t)=>s+(t.debit||0),0).toLocaleString()} ${account.currency}\nالرصيد النهائي: ${(transactions.reduce((s,t)=>s+(t.credit||0),0) - transactions.reduce((s,t)=>s+(t.debit||0),0)).toLocaleString()} ${account.currency}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs"
        >
          <Share2 className="w-4 h-4" />
          <span>واتساب</span>
        </button>
      </div>
    </div>
  );
};
