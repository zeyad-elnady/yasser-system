'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Account, Transaction, ViewMode, VoucherType } from '@/types';
import { INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS } from '@/lib/initialData';
import { calculateBalances, formatAmount, getTotals } from '@/lib/calculations';
import { StatementTable } from '@/components/StatementTable';
import { MobileView } from '@/components/MobileView';
import { AddVoucherModal } from '@/components/AddVoucherModal';
import { AccountModal } from '@/components/AccountModal';
import { PrintHeader, PrintFooter } from '@/components/PrintHeader';
import {
  Smartphone,
  LayoutDashboard,
  Printer,
  PlusCircle,
  MinusCircle,
  Search,
  Filter,
  FileSpreadsheet,
  Share2,
  RotateCcw,
  UserPlus,
  Users,
  ChevronDown,
  Calendar,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export default function HomePage() {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc-yasser');
  const [viewMode, setViewMode] = useState<ViewMode>('exact-mobile');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | VoucherType>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modals
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Load from local storage or API on mount
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
      console.error('Error loading accounts:', e);
    }

    // Try fetching from server API
    fetch('/api/data')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAccounts(data);
        }
      })
      .catch(() => {});
  }, []);

  // Save to local storage & API
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
      console.error('Error saving:', e);
    }
  };

  const currentAccount = useMemo(() => {
    return accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  }, [accounts, selectedAccountId]);

  // All transactions with calculated running balance
  const fullCalculatedTransactions = useMemo(() => {
    return calculateBalances(currentAccount.transactions || []);
  }, [currentAccount]);

  // Filtered transactions for display
  const displayTransactions = useMemo(() => {
    let list = fullCalculatedTransactions;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (tx) =>
          tx.details.toLowerCase().includes(q) ||
          String(tx.voucherNo).includes(q) ||
          tx.date.includes(q)
      );
    }

    if (typeFilter !== 'ALL') {
      list = list.filter((tx) => tx.voucherType === typeFilter);
    }

    return list;
  }, [fullCalculatedTransactions, searchQuery, typeFilter]);

  const totals = useMemo(() => {
    return getTotals(displayTransactions);
  }, [displayTransactions]);

  // Highest voucher number
  const nextVoucherNo = useMemo(() => {
    const numbers = (currentAccount.transactions || [])
      .map((t) => Number(t.voucherNo))
      .filter((n) => !isNaN(n));
    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  }, [currentAccount]);

  // Handlers
  const handleSaveTransaction = (txData: Partial<Transaction>) => {
    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === currentAccount.id) {
        let updatedTxs = [...acc.transactions];
        if (editingTransaction) {
          // Edit
          updatedTxs = updatedTxs.map((t) =>
            t.id === editingTransaction.id ? ({ ...t, ...txData } as Transaction) : t
          );
        } else {
          // Add new
          updatedTxs.push(txData as Transaction);
        }
        return {
          ...acc,
          transactions: updatedTxs,
        };
      }
      return acc;
    });

    saveAccounts(updatedAccounts);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا السند؟')) return;

    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === currentAccount.id) {
        return {
          ...acc,
          transactions: acc.transactions.filter((t) => t.id !== id),
        };
      }
      return acc;
    });

    saveAccounts(updatedAccounts);
  };

  const handleSaveAccount = (accountData: Partial<Account>) => {
    let updatedAccounts: Account[];
    if (editingAccount) {
      updatedAccounts = accounts.map((a) =>
        a.id === editingAccount.id ? ({ ...a, ...accountData } as Account) : a
      );
    } else {
      const newAcc: Account = {
        id: accountData.id || `acc-${Date.now()}`,
        name: accountData.name || 'حساب جديد',
        subtitle: accountData.subtitle || 'ورشة تفصيل',
        phone: accountData.phone || '',
        currency: accountData.currency || 'ريال',
        startDate: '01/01/2026',
        endDate: '31/12/2026',
        transactions: [],
      };
      updatedAccounts = [...accounts, newAcc];
      setSelectedAccountId(newAcc.id);
    }

    saveAccounts(updatedAccounts);
    setEditingAccount(null);
  };

  const handleResetToScreenshotData = () => {
    if (
      confirm(
        'هل تريد استعادة بيانات كشف حساب ياسر الأصلية المطابقة للصورة تماماً (21 حركة برصيد 69,290)؟'
      )
    ) {
      const updatedAccounts = accounts.map((acc) => {
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
      saveAccounts(updatedAccounts);
      setSelectedAccountId('acc-yasser');
      setSearchQuery('');
      setTypeFilter('ALL');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'م,الرقم,التاريخ,نوع السند,التفاصيل,عليه,له,الرصيد\n';

    displayTransactions.forEach((tx) => {
      const row = [
        tx.seq,
        tx.voucherNo,
        tx.date,
        tx.voucherType,
        `"${(tx.details || '').replace(/"/g, '""')}"`,
        tx.debit || '',
        tx.credit || '',
        tx.balance || '',
      ].join(',');
      csvContent += row + '\n';
    });

    csvContent += `,,,الاجمالي,"",${totals.totalDebit},${totals.totalCredit},${totals.finalBalance}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `كشف_حساب_${currentAccount.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp share
  const handleWhatsAppShare = () => {
    const title = `*كشف حساب ${currentAccount.name}*`;
    const period = `الفترة: من ${currentAccount.startDate || '18/08/2026'} إلى ${currentAccount.endDate || '21/10/2026'}`;
    const totalsText = `• إجمالي له (دائن): ${formatAmount(totals.totalCredit)} ${currentAccount.currency}\n• إجمالي عليه (مدين): ${formatAmount(totals.totalDebit)} ${currentAccount.currency}\n• *الرصيد النهائي: ${formatAmount(totals.finalBalance)} ${currentAccount.currency} (${totals.finalBalance >= 0 ? 'لكم' : 'عليكم'})*`;
    const message = `${title}\n${period}\n\n${totalsText}\n\nنرجو مراجعة الحساب ومطابقته.`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col font-sans pb-16">
      {/* 1. Global Navigation Top Bar */}
      <header className="bg-slate-900 text-white shadow-md no-print sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wide">نظام كشف الحسابات</h1>
                <span className="text-[11px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                  yasser-system
                </span>
              </div>
              <p className="text-xs text-slate-400">إدارة كشوف الحسابات وسندات القبض والصرف</p>
            </div>
          </div>

          {/* Account Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 gap-2 text-sm">
              <Users className="w-4 h-4 text-blue-400" />
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer text-sm"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                    {acc.name} {acc.subtitle ? `(${acc.subtitle})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setEditingAccount(null);
                setIsAccountModalOpen(true);
              }}
              title="إضافة حساب جديد"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          {/* View Mode Switcher Pills */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('exact-mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'exact-mobile'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>عرض الجوال (مطابق للصورة)</span>
            </button>

            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>لوحة التحكم الكاملة</span>
            </button>

            <button
              onClick={() => {
                setViewMode('print');
                setTimeout(() => window.print(), 200);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كشف</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Action Sub-Bar */}
      <section className="bg-white border-b border-slate-200 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Quick Buttons: Add Voucher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingTransaction(null);
                setIsVoucherModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة قيد / سند جديد</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-xs transition"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة واتساب</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-xs transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>

            <button
              onClick={handleResetToScreenshotData}
              title="استعادة كشف حساب ياسر من الصورة"
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 rounded-xl text-xs font-bold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة بيانات الصورة (21 حركة)</span>
            </button>
          </div>

          {/* Search & Type Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="بحث في التفاصيل أو الرقم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 pl-3 pr-9 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">جميع السندات</option>
              <option value="سند صرف">سند صرف (عليه) فقط</option>
              <option value="سند قبض">سند قبض (له) فقط</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. Summary Statistics Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2 no-print w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* له */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-bold">إجمالي له (دائن)</p>
              <h3 className="text-xl font-black text-blue-700 mt-0.5">
                {formatAmount(totals.totalCredit, true)}
                <span className="text-xs font-semibold text-slate-500 mr-1">
                  {currentAccount.currency}
                </span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm">
              له
            </div>
          </div>

          {/* عليه */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-bold">إجمالي عليه (مدين)</p>
              <h3 className="text-xl font-black text-red-600 mt-0.5">
                {formatAmount(totals.totalDebit, true)}
                <span className="text-xs font-semibold text-slate-500 mr-1">
                  {currentAccount.currency}
                </span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-black text-sm">
              عليه
            </div>
          </div>

          {/* الرصيد النهائي */}
          <div className="bg-white p-3.5 rounded-2xl border-2 border-[#00e5ff] shadow-xs flex items-center justify-between bg-gradient-to-r from-cyan-50/50 to-white">
            <div>
              <p className="text-xs text-slate-600 font-bold">الرصيد الصافي المتبقي</p>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                {formatAmount(totals.finalBalance, true)}
                <span className="text-xs font-bold text-blue-700 mr-1">
                  {totals.finalBalance >= 0 ? '(لكم)' : '(عليكم)'}
                </span>
              </h3>
            </div>
            <div className="px-2 py-1 rounded-lg bg-[#00e5ff] text-slate-900 font-extrabold text-xs shadow-xs">
              مطابق للصورة
            </div>
          </div>

          {/* عدد السندات */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-bold">عدد القيود والحركات</p>
              <h3 className="text-xl font-black text-slate-800 mt-0.5">
                {displayTransactions.length}{' '}
                <span className="text-xs font-medium text-slate-500">سند</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm">
              #
            </div>
          </div>
        </div>
      </section>

      {/* 4. Main Body Content Based on Active View Mode */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full flex-1">
        {/* Printable Header (visible only on print) */}
        <PrintHeader account={currentAccount} />

        {/* View Mode 1: Exact Mobile Mockup as in the user screenshot */}
        {viewMode === 'exact-mobile' && (
          <div className="w-full flex flex-col items-center justify-center py-4">
            <div className="mb-3 text-center no-print">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                معاينة شاشة الهاتف الجوال مطابقة تماماً للمرفق بالصورة
              </span>
            </div>

            <MobileView
              account={currentAccount}
              transactions={displayTransactions}
              onBack={() => setViewMode('dashboard')}
              onOpenMenu={() => setIsVoucherModalOpen(true)}
              onOpenHistory={() => {
                alert(`سجل الحركات: ${displayTransactions.length} حركة مسجلة لحساب ${currentAccount.name}`);
              }}
            />
          </div>
        )}

        {/* View Mode 2: Full Enterprise Dashboard View */}
        {(viewMode === 'dashboard' || viewMode === 'print') && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 print:border-none print:shadow-none print:p-0">
            {/* Account Details Header in Dashboard */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-3 no-print">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900">
                    كشف حساب {currentAccount.name}
                  </h2>
                  {currentAccount.subtitle && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                      {currentAccount.subtitle}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  الفترة: من تاريخ {currentAccount.startDate || '18/08/2026'} إلى تاريخ{' '}
                  {currentAccount.endDate || '21/10/2026'} | الهاتف: {currentAccount.phone || 'غير مسجل'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingAccount(currentAccount);
                    setIsAccountModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                >
                  تعديل بيانات الحساب
                </button>

                <button
                  onClick={() => {
                    setEditingTransaction(null);
                    setIsVoucherModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>سند جديد</span>
                </button>
              </div>
            </div>

            {/* The Table Component */}
            <StatementTable
              transactions={displayTransactions}
              currency={currentAccount.currency}
              isEditable={true}
              onEdit={(tx) => {
                setEditingTransaction(tx);
                setIsVoucherModalOpen(true);
              }}
              onDelete={handleDeleteTransaction}
            />
          </div>
        )}

        {/* Printable Footer (visible only on print) */}
        <PrintFooter />
      </div>

      {/* 5. Modals */}
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

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(null);
        }}
        onSave={handleSaveAccount}
        initialAccount={editingAccount}
      />
    </main>
  );
}
