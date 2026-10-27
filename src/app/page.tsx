'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Account, Transaction } from '@/types';
import { INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS } from '@/lib/initialData';
import { calculateBalances, formatAmount, getTotals } from '@/lib/calculations';
import { StatementTable, SizeMode } from '@/components/StatementTable';
import { AddVoucherModal } from '@/components/AddVoucherModal';
import { AccountModal } from '@/components/AccountModal';
import {
  ArrowLeft,
  Clock,
  MoreVertical,
  Plus,
  Printer,
  Share2,
  FileSpreadsheet,
  RotateCcw,
  UserPlus,
  X,
  Trash2,
  Edit,
  Type,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

export default function MobileSinglePage() {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc-yasser');
  const [sizeMode, setSizeMode] = useState<SizeMode>('normal');

  // Modals & Bottom Sheets
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedRowAction, setSelectedRowAction] = useState<Transaction | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Auto-detect narrow screens on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 375) {
        setSizeMode('compact');
      }
    }
  }, []);

  // Load from local storage or API
  useEffect(() => {
    try {
      const saved = localStorage.getItem('yasser_system_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAccounts(parsed);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }

    fetch('/api/data')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAccounts(data);
        }
      })
      .catch(() => {});
  }, []);

  const saveAccounts = (newAccounts: Account[]) => {
    setAccounts(newAccounts);
    try {
      localStorage.setItem('yasser_system_accounts', JSON.stringify(newAccounts));
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccounts),
      }).catch(() => {});
    } catch (e) {
      console.error(e);
    }
  };

  const currentAccount = useMemo(() => {
    return accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  }, [accounts, selectedAccountId]);

  // Full transactions with running balance
  const calculatedTransactions = useMemo(() => {
    return calculateBalances(currentAccount.transactions || []);
  }, [currentAccount]);

  const totals = useMemo(() => {
    return getTotals(calculatedTransactions);
  }, [calculatedTransactions]);

  const nextVoucherNo = useMemo(() => {
    const nums = (currentAccount.transactions || [])
      .map((t) => Number(t.voucherNo))
      .filter((n) => !isNaN(n));
    return nums.length > 0 ? Math.max(...nums) + 1 : 1;
  }, [currentAccount]);

  // Actions
  const handleSaveTransaction = (txData: Partial<Transaction>) => {
    const updated = accounts.map((acc) => {
      if (acc.id === currentAccount.id) {
        let txs = [...acc.transactions];
        if (editingTransaction) {
          txs = txs.map((t) => (t.id === editingTransaction.id ? ({ ...t, ...txData } as Transaction) : t));
        } else {
          txs.push(txData as Transaction);
        }
        return { ...acc, transactions: txs };
      }
      return acc;
    });

    saveAccounts(updated);
    setEditingTransaction(null);
    setSelectedRowAction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السند؟')) return;
    const updated = accounts.map((acc) => {
      if (acc.id === currentAccount.id) {
        return {
          ...acc,
          transactions: acc.transactions.filter((t) => t.id !== id),
        };
      }
      return acc;
    });
    saveAccounts(updated);
    setSelectedRowAction(null);
  };

  const handleResetToScreenshot = () => {
    if (confirm('هل تريد استعادة بيانات كشف حساب ياسر الأصلية (21 حركة برصيد 69,290)؟')) {
      const updated = accounts.map((acc) => {
        if (acc.id === 'acc-yasser') {
          return {
            ...acc,
            transactions: INITIAL_TRANSACTIONS,
            startDate: '18/08/2026',
            endDate: '21/10/2026',
          };
        }
        return acc;
      });
      saveAccounts(updated);
      setSelectedAccountId('acc-yasser');
      setIsMenuOpen(false);
    }
  };

  const handleWhatsAppShare = () => {
    const msg = `*كشف حساب ${currentAccount.name}*\nمن ${currentAccount.startDate || '18/08/2026'} إلى ${currentAccount.endDate || '21/10/2026'}\n\n• إجمالي له: ${formatAmount(totals.totalCredit)} ${currentAccount.currency}\n• إجمالي عليه: ${formatAmount(totals.totalDebit)} ${currentAccount.currency}\n• *الرصيد: ${formatAmount(totals.finalBalance)} ${currentAccount.currency} (${totals.finalBalance >= 0 ? 'لكم' : 'عليكم'})*`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    setIsMenuOpen(false);
  };

  const handleExportCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,\uFEFF';
    csv += 'م,الرقم,التاريخ,نوع السند,التفاصيل,عليه,له,الرصيد\n';
    calculatedTransactions.forEach((t) => {
      csv += `${t.seq},${t.voucherNo},${t.date},${t.voucherType},"${(t.details || '').replace(/"/g, '""')}",${t.debit || ''},${t.credit || ''},${t.balance || ''}\n`;
    });
    csv += `,,,الاجمالي,"",${totals.totalDebit},${totals.totalCredit},${totals.finalBalance}\n`;

    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `كشف_حساب_${currentAccount.name}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsMenuOpen(false);
  };

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 flex flex-col font-sans select-none antialiased">
      {/* 1. Top App Bar - Exact layout matching screenshot 1 */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-300 px-2 sm:px-3 py-2 flex items-center justify-between no-print">
        {/* Left Action Buttons: Menu ⋮ , History 🕒 , and Size/Zoom Adjuster Aa */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-1.5 text-slate-800 hover:bg-slate-100 active:bg-slate-200 rounded-full transition"
            title="القائمة والخيارات"
          >
            <MoreVertical className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={() => setIsStatsOpen(true)}
            className="p-1.5 text-slate-800 hover:bg-slate-100 active:bg-slate-200 rounded-full transition"
            title="ملخص الحساب والإحصائيات"
          >
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Quick Size / Fit Toggle (Aa) */}
          <button
            onClick={() => setIsSizeMenuOpen(!isSizeMenuOpen)}
            className={`px-1.5 py-0.5 rounded-lg border text-xs font-black transition flex items-center gap-0.5 ${
              sizeMode === 'compact'
                ? 'bg-blue-50 border-blue-400 text-blue-700'
                : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
            title="تعديل مقاس الجدول ليناسب شاشتك"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">
              {sizeMode === 'compact' ? 'مضغوط' : sizeMode === 'large' ? 'كبير' : 'عادي'}
            </span>
          </button>
        </div>

        {/* Center Title: كشف حساب حـ/ ياسر */}
        <div className="text-right flex-1 mx-1.5 sm:mx-2 truncate">
          <h1
            className="text-[17px] sm:text-[20px] font-black tracking-tight text-slate-950 truncate"
            title={`كشف حساب ${currentAccount.name}`}
          >
            كشف حساب {currentAccount.name}
          </h1>
        </div>

        {/* Right Action: Back Arrow ← */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-1.5 text-slate-800 hover:bg-slate-100 active:bg-slate-200 rounded-full transition"
          title="رجوع / القائمة"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </header>

      {/* Quick Size Mode Selector Dropdown */}
      {isSizeMenuOpen && (
        <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center justify-between text-xs font-bold no-print shadow-xs animate-in slide-in-from-top-2 duration-150">
          <span className="text-slate-600">تعديل حجم الجدول ليناسب هاتفك:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setSizeMode('compact');
                setIsSizeMenuOpen(false);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                sizeMode === 'compact' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
              }`}
            >
              مضغوط (هواتف صغيرة)
            </button>
            <button
              onClick={() => {
                setSizeMode('normal');
                setIsSizeMenuOpen(false);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                sizeMode === 'normal' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
              }`}
            >
              عادي
            </button>
            <button
              onClick={() => {
                setSizeMode('large');
                setIsSizeMenuOpen(false);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                sizeMode === 'large' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
              }`}
            >
              كبير
            </button>
          </div>
        </div>
      )}

      {/* 2. Subtitle Bar: من تاريخ ... إلى تاريخ ... */}
      <div className="bg-white py-1 px-2 text-center border-b border-slate-300 text-[11px] sm:text-[13px] text-slate-700 font-bold select-none no-print">
        <span>من تاريخ {currentAccount.startDate || '18/08/2026'}</span>
        <span className="mx-2">إلى تاريخ {currentAccount.endDate || '21/10/2026'}</span>
      </div>

      {/* 3. Main Full-Bleed Table */}
      <main className="w-full flex-1 px-0 pt-0.5 pb-24">
        <StatementTable
          transactions={calculatedTransactions}
          currency={currentAccount.currency}
          sizeMode={sizeMode}
          onRowClick={(tx) => setSelectedRowAction(tx)}
        />
      </main>

      {/* 4. Sleek Floating Action Button (FAB) at bottom-left */}
      <div className="fixed bottom-4 left-4 z-40 no-print">
        <button
          onClick={() => {
            setEditingTransaction(null);
            setIsVoucherModalOpen(true);
          }}
          className="w-12 h-12 rounded-full bg-[#0b57d0] hover:bg-blue-700 active:scale-95 text-white shadow-xl flex items-center justify-center transition-all border-2 border-white"
          title="إضافة سند جديد"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* 5. Mobile Bottom Sheet: Menu Options (⋮) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs no-print">
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 space-y-3 animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-black text-base text-slate-900">خيارات كشف الحساب</h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setEditingTransaction(null);
                  setIsVoucherModalOpen(true);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition text-sm"
              >
                <Plus className="w-5 h-5" />
                <span>إضافة قيد / سند جديد</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setTimeout(() => window.print(), 100);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 text-slate-800 font-bold transition text-sm"
              >
                <Printer className="w-5 h-5 text-slate-600" />
                <span>طباعة كشف الحساب / تصدير PDF</span>
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 text-emerald-700 font-bold transition text-sm"
              >
                <Share2 className="w-5 h-5 text-emerald-600" />
                <span>مشاركة كشف الحساب عبر WhatsApp</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 text-slate-800 font-bold transition text-sm"
              >
                <FileSpreadsheet className="w-5 h-5 text-slate-600" />
                <span>تصدير ملف Excel (CSV)</span>
              </button>

              <button
                onClick={handleResetToScreenshot}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 text-amber-800 font-bold transition text-sm"
              >
                <RotateCcw className="w-5 h-5 text-amber-600" />
                <span>استعادة بيانات الصورة الأصلية (21 حركة)</span>
              </button>

              {/* Adjust Table Size */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  مقاس الجدول للشاشة:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSizeMode('compact')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                      sizeMode === 'compact' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    مضغوط
                  </button>
                  <button
                    onClick={() => setSizeMode('normal')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                      sizeMode === 'normal' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    عادي
                  </button>
                  <button
                    onClick={() => setSizeMode('large')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                      sizeMode === 'large' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    كبير
                  </button>
                </div>
              </div>

              {/* Account Switcher */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  تبديل الحساب:
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedAccountId}
                    onChange={(e) => {
                      setSelectedAccountId(e.target.value);
                      setIsMenuOpen(false);
                    }}
                    className="flex-1 py-2 px-3 bg-slate-100 border border-slate-300 rounded-xl font-bold text-xs text-slate-800 focus:outline-none"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} {acc.subtitle ? `(${acc.subtitle})` : ''}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsAccountModalOpen(true);
                    }}
                    className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>حساب جديد</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Mobile Bottom Sheet: History & Summary Stats (🕒) */}
      {isStatsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs no-print">
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-black text-base text-slate-900">
                ملخص حساب {currentAccount.name}
              </h3>
              <button
                onClick={() => setIsStatsOpen(false)}
                className="p-1 rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-slate-600">إجمالي له (دائن)</p>
                <p className="text-lg font-black text-blue-700 mt-0.5">
                  {formatAmount(totals.totalCredit, true)} {currentAccount.currency}
                </p>
              </div>

              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs font-bold text-slate-600">إجمالي عليه (مدين)</p>
                <p className="text-lg font-black text-red-600 mt-0.5">
                  {formatAmount(totals.totalDebit, true)} {currentAccount.currency}
                </p>
              </div>

              <div className="col-span-2 p-3.5 bg-gradient-to-r from-cyan-100 to-cyan-50 rounded-xl border-2 border-[#00e5ff] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-700">الرصيد النهائي الصافي</p>
                  <p className="text-xl font-black text-slate-950 mt-0.5">
                    {formatAmount(totals.finalBalance, true)} {currentAccount.currency}
                    <span className="text-xs font-bold text-blue-700 mr-2">
                      ({totals.finalBalance >= 0 ? 'لكم' : 'عليكم'})
                    </span>
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-[#00e5ff] text-slate-950 font-black text-xs rounded-lg shadow-xs">
                  مطابق للصورة
                </span>
              </div>
            </div>

            <div className="text-center text-xs text-slate-500 font-semibold pt-1">
              إجمالي الحركات المسجلة: {calculatedTransactions.length} حركة
            </div>
          </div>
        </div>
      )}

      {/* 7. Action Sheet when Tapping a Row (Edit or Delete) */}
      {selectedRowAction && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs no-print">
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  سند رقم #{selectedRowAction.voucherNo}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedRowAction.date} - {selectedRowAction.voucherType}
                </p>
              </div>
              <button
                onClick={() => setSelectedRowAction(null)}
                className="p-1 rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-sm space-y-1">
              <p>
                <span className="font-bold text-slate-600">البيان: </span>
                <span className="font-bold text-slate-900">{selectedRowAction.details || '—'}</span>
              </p>
              <p>
                <span className="font-bold text-slate-600">المبلغ: </span>
                <span
                  className={`font-black ${
                    selectedRowAction.voucherType === 'سند صرف' ? 'text-red-600' : 'text-blue-700'
                  }`}
                >
                  {formatAmount(selectedRowAction.debit || selectedRowAction.credit)} {currentAccount.currency}
                </span>
              </p>
              <p>
                <span className="font-bold text-slate-600">الرصيد بعد الحركة: </span>
                <span className="font-black text-slate-900">
                  {formatAmount(selectedRowAction.balance)} {currentAccount.currency}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setEditingTransaction(selectedRowAction);
                  setSelectedRowAction(null);
                  setIsVoucherModalOpen(true);
                }}
                className="py-2.5 px-4 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Edit className="w-4 h-4" />
                <span>تعديل السند</span>
              </button>

              <button
                onClick={() => handleDeleteTransaction(selectedRowAction.id)}
                className="py-2.5 px-4 bg-red-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف السند</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Add/Edit Voucher Modal */}
      <AddVoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => {
          setIsVoucherModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
        nextVoucherNo={nextVoucherNo}
      />

      {/* 9. Account Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={(accData) => {
          const newAcc: Account = {
            id: accData.id || `acc-${Date.now()}`,
            name: accData.name || 'حساب جديد',
            subtitle: accData.subtitle || 'ورشة تفصيل',
            phone: accData.phone || '',
            currency: accData.currency || 'ريال',
            startDate: '01/01/2026',
            endDate: '31/12/2026',
            transactions: [],
          };
          const updated = [...accounts, newAcc];
          saveAccounts(updated);
          setSelectedAccountId(newAcc.id);
        }}
      />
    </div>
  );
}
