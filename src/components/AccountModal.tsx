'use client';

import React, { useState } from 'react';
import { Account } from '@/types';
import { X, UserPlus, Check } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Partial<Account>) => void;
  initialAccount?: Account | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAccount,
}) => {
  const [name, setName] = useState(initialAccount?.name || '');
  const [subtitle, setSubtitle] = useState(initialAccount?.subtitle || 'ورشة تصنيع وتفصيل');
  const [phone, setPhone] = useState(initialAccount?.phone || '');
  const [currency, setCurrency] = useState(initialAccount?.currency || 'ريال');
  const [initialCredit, setInitialCredit] = useState('');
  const [initialDebit, setInitialDebit] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('يرجى إدخال اسم الحساب');
      return;
    }

    const payload: Partial<Account> = {
      id: initialAccount?.id || `acc-${Date.now()}`,
      name: name.trim().startsWith('حـ/') ? name.trim() : `حـ/ ${name.trim()}`,
      subtitle: subtitle.trim(),
      phone: phone.trim(),
      currency,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <span>{initialAccount ? 'تعديل بيانات الحساب' : 'إضافة حساب / عميل جديد'}</span>
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              اسم الحساب (العميل / الورشة)
            </label>
            <input
              type="text"
              required
              placeholder="مثال: ياسر أو مصطفى"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              النشاط / الوصف
            </label>
            <input
              type="text"
              placeholder="مثال: ورشة تصنيع ملابس / مورد أقمشة"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                رقم الهاتف
              </label>
              <input
                type="tel"
                placeholder="05XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                العملة
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              >
                <option value="ريال">ريال (SAR)</option>
                <option value="جنيه">جنيه (EGP)</option>
                <option value="درهم">درهم (AED)</option>
                <option value="دولار">دولار (USD)</option>
                <option value="دينار">دينار</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>حفظ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

