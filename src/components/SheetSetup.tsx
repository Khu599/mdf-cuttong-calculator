import React from 'react';
import { CurrencyCode, DimensionUnit, Language, SheetMaterial } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { Info, Maximize2, ShieldCheck, Tag } from 'lucide-react';
import { convertToInches, convertFromInches } from '../utils/optimizer';

interface SheetSetupProps {
  material: SheetMaterial;
  setMaterial: React.Dispatch<React.SetStateAction<SheetMaterial>>;
  unit: DimensionUnit;
  currency: CurrencyCode;
  lang: Language;
}

export const SheetSetup: React.FC<SheetSetupProps> = ({
  material,
  setMaterial,
  unit,
  currency,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  // Quick standard sizes based on active unit
  const handleSelectStandardSize = (lengthInches: number, widthInches: number) => {
    setMaterial((prev) => ({
      ...prev,
      sheetLength: Number(convertFromInches(lengthInches, unit).toFixed(1)),
      sheetWidth: Number(convertFromInches(widthInches, unit).toFixed(1)),
    }));
  };

  // Calculate gross area in sq ft
  const lengthIn = convertToInches(material.sheetLength, unit);
  const widthIn = convertToInches(material.sheetWidth, unit);
  const areaSqFt = Number(((lengthIn * widthIn) / 144).toFixed(2));
  const usableLengthIn = Math.max(0, lengthIn - material.trimMargin * 2);
  const usableWidthIn = Math.max(0, widthIn - material.trimMargin * 2);
  const usableAreaSqFt = Number(((usableLengthIn * usableWidthIn) / 144).toFixed(2));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Maximize2 className="w-5 h-5 text-amber-400" />
            {t.sheetDimensions}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ur'
              ? 'خام شیٹ کا درست سائز، کٹائی کا مارجن اور فی شیٹ قیمت درج کریں تاکہ آپٹیمائزر درست حساب لگا سکے۔'
              : 'Specify sheet dimensions, saw blade kerf allowance, trim margin, and unit cost.'}
          </p>
        </div>

        {/* Currency & Unit Indicator */}
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono-num">
          <span>
            {t.unit}: <strong className="text-amber-400">{unit.toUpperCase()}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {t.currency}: <strong className="text-amber-400">{currency}</strong>
          </span>
        </div>
      </div>

      {/* Standard Size Buttons */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          {t.standardSizes}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => handleSelectStandardSize(96, 48)}
            className="p-3 text-left rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-amber-500/50 transition-colors group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400">
              8 × 4 {lang === 'ur' ? 'فٹ' : 'ft'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono-num">
              96 × 48 in (2440 × 1220 mm)
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectStandardSize(84, 48)}
            className="p-3 text-left rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-amber-500/50 transition-colors group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400">
              7 × 4 {lang === 'ur' ? 'فٹ' : 'ft'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono-num">
              84 × 48 in (2135 × 1220 mm)
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectStandardSize(72, 48)}
            className="p-3 text-left rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-amber-500/50 transition-colors group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400">
              6 × 4 {lang === 'ur' ? 'فٹ' : 'ft'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono-num">
              72 × 48 in (1830 × 1220 mm)
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectStandardSize(96, 36)}
            className="p-3 text-left rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-amber-500/50 transition-colors group"
          >
            <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400">
              8 × 3 {lang === 'ur' ? 'فٹ' : 'ft'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono-num">
              96 × 36 in (2440 × 915 mm)
            </div>
          </button>
        </div>
      </div>

      {/* Main Parameters Form & Visual Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sheet Length */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.sheetLength} ({unit})
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={material.sheetLength}
                onChange={(e) =>
                  setMaterial({ ...material, sheetLength: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono-num focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Sheet Width */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.sheetWidth} ({unit})
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={material.sheetWidth}
                onChange={(e) =>
                  setMaterial({ ...material, sheetWidth: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono-num focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Material Category */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.materialCategory}
              </label>
              <select
                value={material.category}
                onChange={(e) =>
                  setMaterial({
                    ...material,
                    category: e.target.value as SheetMaterial['category'],
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="lasani">{t.matLasani}</option>
                <option value="mdf">{t.matMdf}</option>
                <option value="plywood">{t.matPlywood}</option>
                <option value="uv_high_gloss">{t.matUvGloss}</option>
                <option value="acrylic">{t.matAcrylic}</option>
                <option value="chipboard">{t.matChipboard}</option>
                <option value="veneer">{t.matVeneer}</option>
                <option value="solid_wood">{t.matSolidWood}</option>
              </select>
            </div>

            {/* Thickness */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.sheetThickness}
              </label>
              <input
                type="text"
                value={material.thickness}
                onChange={(e) => setMaterial({ ...material, thickness: e.target.value })}
                placeholder="16mm / 18mm / 3/4 in"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none font-mono-num"
              />
            </div>
          </div>

          {/* Price per Sheet */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t.pricePerSheet} ({currency})
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="50"
                value={material.pricePerSheet}
                onChange={(e) =>
                  setMaterial({
                    ...material,
                    pricePerSheet: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-400 font-bold font-mono-num focus:border-amber-500 focus:outline-none"
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-xs text-slate-500 font-mono-num">
                {currency}
              </div>
            </div>
          </div>

          {/* Advanced Cutting Margins: Saw Kerf & Trim Margin */}
          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ur' ? 'کٹائی کے تکنیکی مارجنز' : 'Technical Cutting Allowances'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Saw Kerf */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-300">{t.sawKerf} ({unit})</label>
                  <span className="text-[10px] text-slate-500" title={t.kerfTooltip}>
                    <Info className="w-3.5 h-3.5 inline" />
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={material.sawKerf}
                  onChange={(e) =>
                    setMaterial({ ...material, sawKerf: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono-num focus:border-amber-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                  {lang === 'ur' ? 'بلیڈ کی موٹائی (عموماً 0.125" یا 3mm)' : 'Standard saw kerf (~0.125" / 3mm)'}
                </p>
              </div>

              {/* Trim Margin */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-300">{t.trimMargin} ({unit})</label>
                  <span className="text-[10px] text-slate-500" title={t.trimTooltip}>
                    <Info className="w-3.5 h-3.5 inline" />
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.05"
                  value={material.trimMargin}
                  onChange={(e) =>
                    setMaterial({ ...material, trimMargin: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono-num focus:border-amber-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                  {lang === 'ur' ? 'کنارے سیدھے کرنے کی کٹائی (عموماً 0.5")' : 'Square-up raw edges (~0.5" / 12mm)'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Visual Summary Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-400" />
                {lang === 'ur' ? 'شیٹ کارڈ و خصوصیات' : 'Sheet Specifications Card'}
              </span>
              <span className="text-xs font-mono-num text-amber-400 font-bold">
                {material.pricePerSheet.toLocaleString()} {currency}
              </span>
            </div>

            {/* Visual Mini Diagram of Raw Sheet */}
            <div className="relative mx-auto my-3 w-48 h-32 rounded-lg border-2 border-dashed border-amber-500/40 bg-amber-500/5 flex flex-col items-center justify-center p-2 text-center">
              {/* Inner usable area representation */}
              <div className="w-[88%] h-[82%] border border-amber-500/70 bg-amber-500/10 rounded flex flex-col items-center justify-center">
                <span className="text-[11px] font-bold text-amber-300 font-mono-num">
                  {material.sheetLength} × {material.sheetWidth} {unit}
                </span>
                <span className="text-[9px] text-slate-400 font-mono-num mt-0.5">
                  {usableAreaSqFt} sq ft {lang === 'ur' ? 'خالص رقبہ' : 'usable'}
                </span>
              </div>
              <span className="absolute bottom-1 right-2 text-[8px] text-slate-500 font-mono-num">
                {material.thickness}
              </span>
            </div>

            {/* Metrics List */}
            <div className="space-y-2 text-xs pt-2">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">{lang === 'ur' ? 'کل رقبہ فی شیٹ' : 'Gross Sheet Area'}</span>
                <span className="text-slate-200 font-mono-num font-semibold">{areaSqFt} sq ft</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">{lang === 'ur' ? 'قابل استعمال رقبہ (خالص)' : 'Usable Net Area'}</span>
                <span className="text-emerald-400 font-mono-num font-semibold">{usableAreaSqFt} sq ft</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">{lang === 'ur' ? 'لاگت فی مربع فٹ' : 'Cost per Sq. Ft'}</span>
                <span className="text-amber-400 font-mono-num font-semibold">
                  {areaSqFt > 0 ? (material.pricePerSheet / areaSqFt).toFixed(1) : 0} {currency}/sq.ft
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">{lang === 'ur' ? 'شیٹ میٹریل' : 'Material'}</span>
                <span className="text-slate-200 font-medium">
                  {lang === 'ur' ? t[`mat${material.category.charAt(0).toUpperCase() + material.category.slice(1)}` as keyof typeof t] || material.category : material.category.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
            {lang === 'ur'
              ? '💡 نوٹ: شیٹ کا درست سائز اگلی اسکرین میں تمام کٹنگ پارٹس کو خودکار ترتیب دینے کے لیے استعمال ہوگا۔'
              : '💡 Note: Sheet setup directly feeds the 2D Guillotine optimizer algorithm in the next step.'}
          </div>
        </div>
      </div>
    </div>
  );
};
