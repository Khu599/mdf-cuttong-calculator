import React, { useState } from 'react';
import { CurrencyCode, HardwareItem, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { Wrench, Plus, Trash2, Tag, ShieldCheck } from 'lucide-react';

interface HardwareListProps {
  hardware: HardwareItem[];
  setHardware: React.Dispatch<React.SetStateAction<HardwareItem[]>>;
  currency: CurrencyCode;
  lang: Language;
}

export const HardwareList: React.FC<HardwareListProps> = ({
  hardware,
  setHardware,
  currency,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  // New hardware local state
  const [newItem, setNewItem] = useState<Partial<HardwareItem>>({
    nameUrdu: '',
    nameEn: '',
    category: 'hinges',
    quantity: 1,
    unit: lang === 'ur' ? 'عدد' : 'pcs',
    unitPrice: 150,
  });

  const handleAddItem = () => {
    if (!newItem.quantity || !newItem.unitPrice) return;
    const itemToAdd: HardwareItem = {
      id: `hw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      nameUrdu: newItem.nameUrdu?.trim() || 'ہارڈ ویئر آئٹم',
      nameEn: newItem.nameEn?.trim() || newItem.nameUrdu?.trim() || 'Hardware Item',
      category: newItem.category || 'other',
      quantity: Math.max(1, Number(newItem.quantity)),
      unit: newItem.unit || (lang === 'ur' ? 'عدد' : 'pcs'),
      unitPrice: Math.max(0, Number(newItem.unitPrice)),
    };

    setHardware((prev) => [...prev, itemToAdd]);
    setNewItem({
      nameUrdu: '',
      nameEn: '',
      category: 'hinges',
      quantity: 1,
      unit: lang === 'ur' ? 'عدد' : 'pcs',
      unitPrice: 150,
    });
  };

  const handleUpdate = (id: string, updates: Partial<HardwareItem>) => {
    setHardware((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const handleDelete = (id: string) => {
    setHardware((prev) => prev.filter((item) => item.id !== id));
  };

  // Quick preset hardware items
  const quickCommonFittings = [
    {
      urdu: 'ہائیڈرولک سوفٹ کلوز قبضے (Hydraulic Hinges)',
      en: 'Soft-Close Hydraulic Hinges',
      cat: 'hinges' as const,
      price: 220,
      unit: lang === 'ur' ? 'عدد' : 'pcs',
    },
    {
      urdu: 'دراز چینل 20 انچ (20" Drawer Telescopic Slides)',
      en: '20" Telescopic Drawer Slides',
      cat: 'channels' as const,
      price: 650,
      unit: lang === 'ur' ? 'جوڑی' : 'pair',
    },
    {
      urdu: 'جدید ڈور ہینڈلز (Cabinet / Door Handles)',
      en: 'Modern Pull Handles',
      cat: 'handles' as const,
      price: 320,
      unit: lang === 'ur' ? 'عدد' : 'pcs',
    },
    {
      urdu: 'جرمن لکڑی کا گوند / فیویکول (German Wood Glue)',
      en: 'German Adhesive Wood Glue',
      cat: 'adhesive' as const,
      price: 550,
      unit: lang === 'ur' ? 'بوتل' : 'bottle',
    },
    {
      urdu: 'پیچ، نیلز و ایل بریکٹس ڈبہ (Screws & Fasteners Box)',
      en: 'Wood Screws & Fasteners Box',
      cat: 'screws' as const,
      price: 450,
      unit: lang === 'ur' ? 'ڈبہ' : 'box',
    },
    {
      urdu: 'الماری / دراز کا تالا (Cabinet / Drawer Lock)',
      en: 'Security Cam Lock',
      cat: 'locks' as const,
      price: 400,
      unit: lang === 'ur' ? 'عدد' : 'pcs',
    },
    {
      urdu: 'پلاسٹک واٹر پروف کیبنٹ پائے (Adjustable PVC Legs)',
      en: 'Waterproof Leveling Legs',
      cat: 'legs' as const,
      price: 120,
      unit: lang === 'ur' ? 'عدد' : 'pcs',
    },
  ];

  const handleAddQuickFitting = (fit: (typeof quickCommonFittings)[0]) => {
    const itemToAdd: HardwareItem = {
      id: `hw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      nameUrdu: fit.urdu,
      nameEn: fit.en,
      category: fit.cat,
      quantity: fit.cat === 'screws' || fit.cat === 'adhesive' ? 1 : 4,
      unit: fit.unit,
      unitPrice: fit.price,
    };
    setHardware((prev) => [...prev, itemToAdd]);
  };

  const totalHardwareCost = hardware.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            {t.hardwareTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ur'
              ? 'فرنیچر کی فٹنگز، قبضے، درازوں کے چینل، ہینڈلز، لکڑی کا گوند اور پیچ وغیرہ کی قیمت شامل کریں۔'
              : 'Add cabinet hinges, drawer slides, handles, adhesives, screws, and accessories.'}
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 font-mono-num">
          <span className="text-xs text-slate-400">{lang === 'ur' ? 'کل ہارڈ ویئر رقم' : 'Hardware Total'}:</span>
          <strong className="text-amber-400 font-bold text-base">
            {totalHardwareCost.toLocaleString()} {currency}
          </strong>
        </div>
      </div>

      {/* Quick Add Fitting Chips */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          {t.addCommonHardware}
        </label>
        <div className="flex flex-wrap gap-2">
          {quickCommonFittings.map((fit, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddQuickFitting(fit)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-amber-500/40 text-xs text-slate-300 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3 h-3 text-amber-400" />
              <span>{lang === 'ur' ? fit.urdu.split('(')[0] : fit.en}</span>
              <span className="text-[10px] text-slate-500 font-mono-num">
                ({fit.price} {currency})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Add Hardware Form */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-amber-400" />
          <span>{lang === 'ur' ? 'کسٹم ہارڈ ویئر شامل کریں' : 'Add Custom Hardware Item'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Description (4 cols) */}
          <div className="sm:col-span-4">
            <label className="block text-[11px] text-slate-400 mb-1">{t.hardwareItemName}</label>
            <input
              type="text"
              placeholder={lang === 'ur' ? 'مثال: ہائیڈرولک قبضہ، سلائیڈر، ہینڈل' : 'e.g. Soft-Close Hinge'}
              value={lang === 'ur' ? newItem.nameUrdu : newItem.nameEn}
              onChange={(e) =>
                lang === 'ur'
                  ? setNewItem({ ...newItem, nameUrdu: e.target.value, nameEn: e.target.value })
                  : setNewItem({ ...newItem, nameEn: e.target.value, nameUrdu: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Category (2 cols) */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] text-slate-400 mb-1">{t.category}</label>
            <select
              value={newItem.category}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  category: e.target.value as HardwareItem['category'],
                })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
            >
              <option value="hinges">{t.catHinges}</option>
              <option value="channels">{t.catChannels}</option>
              <option value="handles">{t.catHandles}</option>
              <option value="screws">{t.catScrews}</option>
              <option value="adhesive">{t.catAdhesive}</option>
              <option value="locks">{t.catLocks}</option>
              <option value="legs">{t.catLegs}</option>
              <option value="other">{t.catOther}</option>
            </select>
          </div>

          {/* Quantity (1.5 cols) */}
          <div className="sm:col-span-1.5">
            <label className="block text-[11px] text-slate-400 mb-1">{t.qty}</label>
            <input
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({ ...newItem, quantity: parseInt(e.target.value, 10) || 1 })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono-num focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Unit (1.5 cols) */}
          <div className="sm:col-span-1.5">
            <label className="block text-[11px] text-slate-400 mb-1">{lang === 'ur' ? 'یونٹ' : 'Unit'}</label>
            <input
              type="text"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Unit Price (2 cols) */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] text-slate-400 mb-1">
              {t.rate} ({currency})
            </label>
            <input
              type="number"
              min="0"
              value={newItem.unitPrice}
              onChange={(e) =>
                setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-400 font-mono-num font-bold focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Add Button (1 col) */}
          <div className="sm:col-span-1">
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition-colors"
              title={t.addHardware}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hardware Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-3 w-10 text-center font-mono-num">#</th>
              <th className="py-3 px-3">{t.hardwareItemName}</th>
              <th className="py-3 px-3">{t.category}</th>
              <th className="py-3 px-3 text-center font-mono-num">{t.qty}</th>
              <th className="py-3 px-3 text-center">{lang === 'ur' ? 'یونٹ' : 'Unit'}</th>
              <th className="py-3 px-3 font-mono-num">{t.rate} ({currency})</th>
              <th className="py-3 px-3 font-mono-num">{t.total} ({currency})</th>
              <th className="py-3 px-3 text-center w-16">{lang === 'ur' ? 'حذف' : 'Action'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono-num">
            {hardware.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                  {lang === 'ur'
                    ? 'کوئی ہارڈ ویئر شامل نہیں ہے۔ اوپر دی گئی فہرست سے منتخب کریں یا کسٹم آئٹم شامل کریں۔'
                    : 'No hardware items added yet. Click one of the quick fittings above.'}
                </td>
              </tr>
            ) : (
              hardware.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice;
                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-200 font-sans">
                      <input
                        type="text"
                        value={lang === 'ur' ? item.nameUrdu : item.nameEn}
                        onChange={(e) =>
                          handleUpdate(
                            item.id,
                            lang === 'ur'
                              ? { nameUrdu: e.target.value }
                              : { nameEn: e.target.value }
                          )
                        }
                        className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-amber-500 outline-none w-full text-slate-200"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {t[`cat${item.category.charAt(0).toUpperCase() + item.category.slice(1)}` as keyof typeof t] || item.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdate(item.id, {
                            quantity: parseInt(e.target.value, 10) || 1,
                          })
                        }
                        className="w-14 bg-slate-950/60 border border-slate-700/60 rounded px-1.5 py-0.5 text-center text-slate-100 outline-none focus:border-amber-500"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-400 font-sans">
                      {item.unit}
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleUpdate(item.id, {
                            unitPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-20 bg-slate-950/60 border border-slate-700/60 rounded px-1.5 py-0.5 text-amber-400 font-bold outline-none focus:border-amber-500"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-slate-100 font-bold">
                      {lineTotal.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title={t.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
