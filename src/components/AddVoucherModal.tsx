'use client';

import React, { useState, useEffect } from 'react';
import { Transaction, VoucherType } from '@/types';
import { X, Plus, Calculator, Check } from 'lucide-react';

interface AddVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Partial<Transaction>) => void;
  initialData?: Transaction | null;
  nextVoucherNo: number;
}

const COMMON_DETAILS = [
  'دفعة',
  'قميص خاص',
  'قميص عرض',
  'غلطة خاص سادة',
  'قميص بواقي',
  'قطيفة سوستة',
  'هودي قطيفة',
  'ترنج',
  'غلطة نسيج',
  'رصيد سابق',
];

export const AddVoucherModal: React.FC<AddVoucherModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  nextVoucherNo,
}) => {
  const [voucherType, setVoucherType] = useState<VoucherType>('سند صرف');
  const [voucherNo, setVoucherNo] = useState<string | number>(nextVoucherNo);
  const [date, setDate] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  // Optional calculator
  const [useCalc, setUseCalc] = useState(false);
  const [quantity, setQuantity] = useState<string>('');
  const [unitPrice, setUnitPrice] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setVoucherType(initialData.voucherType);
      setVoucherNo(initialData.voucherNo);
      setDate(initialData.date);
      setDetails(initialData.details || '');
      setAmount(
        initialData.voucherType === 'سند صرف'
          ? initialData.debit.toString()
          : initialData.credit.toString()
      );
    } else {
      // Default to today
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();

      setDate(`${dd}/${mm}/${yyyy}`);
      setVoucherNo(nextVoucherNo);
      setVoucherType('سند صرف');
      setDetails('دفعة');
      setAmount('');
      setQuantity('');
      setUnitPrice('');
      setUseCalc(false);
    }
  }, [initialData, nextVoucherNo, isOpen]);

  // Handle calculator calculation
  useEffect(() => {
    if (useCalc && quantity && unitPrice) {
      const q = parseFloat(quantity);
      const p = parseFloat(unitPrice);
      if (!isNaN(q) && !isNaN(p)) {
        const total = q * p;
        setAmount(total.toString());
      }
    }
  }, [useCalc, quantity, unitPrice]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      alert('يرجى إدخال مبلغ صحيح أكبر من صفر');
      return;
    }

    let finalDetails = details.trim();
    if (useCalc && quantity && unitPrice && !finalDetails.includes(quantity)) {
      finalDetails = `${quantity} ${finalDetails} (${unitPrice} للقطعة)`;
    }

    const payload: Partial<Transaction> = {
      id: initialData?.id || `tx-${Date.now()}`,
      voucherNo,
      date,
      voucherType,
      details: finalDetails,
      debit: voucherType === 'سند صرف' ? val : 0,
      credit: voucherType === 'سند قبض' ? val : 0,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-lg font-bold">
            {initialData ? 'تعديل السند' : 'إضافة قيد / سند جديد'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Voucher Type Selector */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              نوع السند
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVoucherType('سند صرف')}
                className={`py-2.5 px-4 rounded-xl font-bold border-2 transition flex items-center justify-center gap-2 ${
                  voucherType === 'سند صرف'
                    ? 'border-red-600 bg-red-50 text-red-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-red-600"></span>
                <span>سند صرف (عليه / مدين)</span>
              </button>

              <button
                type="button"
                onClick={() => setVoucherType('سند قبض')}
                className={`py-2.5 px-4 rounded-xl font-bold border-2 transition flex items-center justify-center gap-2 ${
                  voucherType === 'سند قبض'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span>سند قبض (له / دائن)</span>
              </button>
            </div>
          </div>

          {/* Voucher Number & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                رقم السند
              </label>
              <input
                type="text"
                required
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                التاريخ (يوم/شهر/سنة)
              </label>
              <input
                type="text"
                required
                placeholder="DD/MM/YYYY"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center"
              />
            </div>
          </div>

          {/* Details / Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              التفاصيل / البيان
            </label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="مثال: دفعة، 36 قميص خاص، هودي قطيفة..."
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Quick suggestion tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_DETAILS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setDetails(tag)}
                  className="text-xs bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-md transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Calculator toggle (Quantity x Price) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setUseCalc(!useCalc)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{useCalc ? 'إخفاء حاسبة الكمية والقطعة' : 'حساب المبلغ بالكمية والسعر (مثال: 36 × 250)'}</span>
            </button>

            {useCalc && (
              <div className="mt-2 p-3 bg-blue-50/60 rounded-xl border border-blue-200 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الكمية (عدد القطع)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="مثال: 36"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    سعر القطعة
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="مثال: 250"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              المبلغ الإجمالي ({voucherType === 'سند صرف' ? 'عليه - مدين' : 'له - دائن'})
            </label>
            <input
              type="number"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full px-4 py-2.5 border-2 rounded-xl text-lg font-black text-center focus:outline-none ${
                voucherType === 'سند صرف'
                  ? 'border-red-300 text-red-600 focus:border-red-500'
                  : 'border-blue-300 text-blue-700 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Action buttons */}
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
              <span>{initialData ? 'حفظ التعديل' : 'إضافة السند'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

