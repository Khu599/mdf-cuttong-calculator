import React from 'react';
import { CurrencyCode, DimensionUnit, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { Layers, Printer, FolderOpen, RotateCcw, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  unit: DimensionUnit;
  setUnit: (unit: DimensionUnit) => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  onOpenPresets: () => void;
  onOpenProjects: () => void;
  onPrint: () => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  unit,
  setUnit,
  currency,
  setCurrency,
  onOpenPresets,
  onOpenProjects,
  onPrint,
  onReset,
}) => {
  const t = TRANSLATIONS[lang];

  const navItems = [
    { id: 'sheet', label: t.tabSheet },
    { id: 'pieces', label: t.tabPieces },
    { id: 'layout', label: t.tabLayout },
    { id: 'hardware', label: t.tabHardware },
    { id: 'labor', label: t.tabLabor },
    { id: 'summary', label: t.tabSummary },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 no-print">
      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (Nav links) - Zone 3 (Primary Action) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
              {t.appTitle}
            </h1>
            <p className="hidden sm:block text-xs text-slate-400 leading-none mt-0.5">
              {lang === 'ur' ? 'لکڑی و شیٹ کٹنگ آپٹیمائزر اور لاگت کا نظام' : 'Woodworking 2D Cut Optimizer & Cost Estimator'}
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === item.id
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Quick Utilities & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'ur' ? 'en' : 'ur')}
            className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors whitespace-nowrap"
            title="تبدیل زبان / Switch Language"
          >
            {lang === 'ur' ? 'English' : 'اردو'}
          </button>

          {/* Unit Toggle */}
          <div className="hidden sm:flex items-center bg-slate-800 border border-slate-700 rounded p-0.5 text-xs">
            {(['in', 'ft', 'mm'] as DimensionUnit[]).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`px-2 py-0.5 rounded font-mono-num transition-colors ${
                  unit === u ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {u.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Currency Dropdown */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="hidden md:block bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 outline-none focus:border-amber-500"
          >
            <option value="PKR">PKR (Rs.)</option>
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="AED">AED (د.إ)</option>
            <option value="SAR">SAR (ر.س)</option>
          </select>

          {/* Presets Button */}
          <button
            onClick={onOpenPresets}
            className="px-2.5 py-1.5 text-xs font-medium rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors whitespace-nowrap"
            title={t.presets}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{t.presets}</span>
          </button>

          {/* Saved Projects Button */}
          <button
            onClick={onOpenProjects}
            className="px-2.5 py-1.5 text-xs font-medium rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors whitespace-nowrap"
            title={t.loadProject}
          >
            <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">{t.loadProject}</span>
          </button>

          {/* Print Quotation Action */}
          <button
            onClick={onPrint}
            className="px-3 py-1.5 text-xs font-medium rounded bg-amber-500 text-slate-950 hover:bg-amber-400 flex items-center gap-1.5 transition-colors whitespace-nowrap font-bold shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.printQuote}</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 gap-1 scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1 text-xs rounded whitespace-nowrap transition-colors shrink-0 ${
              activeTab === item.id
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
