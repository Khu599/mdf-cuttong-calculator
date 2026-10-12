import React from 'react';
import {
  CurrencyCode,
  DimensionUnit,
  EdgeBandingSettings,
  LaborAndExtraCosts,
  Language,
  OptimizationResult,
  SheetMaterial,
} from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { Hammer, Truck, Percent, Sparkles, Scissors } from 'lucide-react';

interface LaborAndExtrasProps {
  labor: LaborAndExtraCosts;
  setLabor: React.Dispatch<React.SetStateAction<LaborAndExtraCosts>>;
  edgeBanding: EdgeBandingSettings;
  setEdgeBanding: React.Dispatch<React.SetStateAction<EdgeBandingSettings>>;
  optimization: OptimizationResult;
  material: SheetMaterial;
  unit: DimensionUnit;
  currency: CurrencyCode;
  lang: Language;
}

export const LaborAndExtras: React.FC<LaborAndExtrasProps> = ({
  labor,
  setLabor,
  edgeBanding,
  setEdgeBanding,
  optimization,
  material,
  unit,
  currency,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  // Calculations
  const sheetsNeeded = optimization.totalSheetsRequired || 0;
  const totalCuttingFee = sheetsNeeded * labor.cuttingCostPerSheet;

  // Edge banding total linear feet
  const edgeLengthFeet = optimization.totalEdgeBandingLength;
  const edgeTapeCost = edgeBanding.enabled
    ? edgeLengthFeet * edgeBanding.tapeRatePerUnitLength
    : 0;
  const edgeLaborCost = edgeBanding.enabled
    ? edgeLengthFeet * edgeBanding.laborRatePerUnitLength
    : 0;
  const totalEdgeCost = edgeTapeCost + edgeLaborCost;

  // Carpentry labor
  let carpentryCost = 0;
  if (labor.carpentryLaborType === 'fixed') {
    carpentryCost = labor.carpentryLaborValue;
  } else if (labor.carpentryLaborType === 'per_sqft') {
    carpentryCost = optimization.totalPartsArea * labor.carpentryLaborValue;
  } else if (labor.carpentryLaborType === 'percent_material') {
    const rawMaterialCost = sheetsNeeded * material.pricePerSheet;
    carpentryCost = (rawMaterialCost * labor.carpentryLaborValue) / 100;
  }

  // Polishing cost
  const totalPolishingCost = labor.polishingAreaSqft * labor.polishingCostPerSqft;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Hammer className="w-5 h-5 text-amber-400" />
            {t.laborTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ur'
              ? 'کٹائی فیس، نجاری، ایج بینڈنگ، پالش، سامان کی ترسیل، منافع کا مارجن اور پیشگی وصولی'
              : 'Sawing fee, carpentry assembly labor, PVC edge taping, polishing, transport, and profit.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Edge Banding & Cutting Charges */}
        <div className="space-y-5">
          {/* Edge Banding Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-amber-400" />
                {t.edgeBandingSettings}
              </span>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={edgeBanding.enabled}
                  onChange={(e) =>
                    setEdgeBanding({ ...edgeBanding, enabled: e.target.checked })
                  }
                  className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-950"
                />
                <span>{t.enableEdgeBanding}</span>
              </label>
            </div>

            {edgeBanding.enabled ? (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">
                      {t.tapeRate} ({currency}/ft)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={edgeBanding.tapeRatePerUnitLength}
                      onChange={(e) =>
                        setEdgeBanding({
                          ...edgeBanding,
                          tapeRatePerUnitLength: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono-num focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">
                      {t.laborRateEdge} ({currency}/ft)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={edgeBanding.laborRatePerUnitLength}
                      onChange={(e) =>
                        setEdgeBanding({
                          ...edgeBanding,
                          laborRatePerUnitLength: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono-num focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Calculated summary */}
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 text-xs flex justify-between items-center font-mono-num">
                  <span className="text-slate-400">
                    {t.totalLinearLength}: <strong className="text-sky-400">{edgeLengthFeet} ft</strong>
                  </span>
                  <span className="text-slate-300">
                    {t.totalEdgeCost}: <strong className="text-amber-400 font-bold">{Math.round(totalEdgeCost).toLocaleString()} {currency}</strong>
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                {lang === 'ur'
                  ? 'ایج بینڈنگ غیر فعال ہے۔ اگر پی وی سی پٹی کا حساب چاہیے تو چیک باکس آن کریں۔'
                  : 'Edge banding is disabled. Enable checkbox to calculate tape and pressing costs.'}
              </p>
            )}
          </div>

          {/* Cutting Charges (آرہ کٹائی فیس) */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-200 block">
              {t.cuttingCharges}
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs items-center">
              <div>
                <label className="block text-slate-400 mb-1">
                  {lang === 'ur' ? 'فی شیٹ کٹائی ریٹ' : 'Sawing Rate per Sheet'} ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  value={labor.cuttingCostPerSheet}
                  onChange={(e) =>
                    setLabor({ ...labor, cuttingCostPerSheet: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono-num focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 text-xs font-mono-num">
                <div className="text-slate-400 text-[11px]">{sheetsNeeded} {lang === 'ur' ? 'شیٹس کٹائی' : 'sheets'}</div>
                <div className="text-amber-400 font-bold mt-0.5">
                  {totalCuttingFee.toLocaleString()} {currency}
                </div>
              </div>
            </div>
          </div>

          {/* Carpentry Assembly Labor */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-200 block">
              {t.carpentryLabor}
            </span>

            {/* Mode Selector */}
            <div className="flex gap-2 text-xs">
              {(['fixed', 'per_sqft', 'percent_material'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setLabor({ ...labor, carpentryLaborType: mode })}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    labor.carpentryLaborType === mode
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode === 'fixed'
                    ? t.laborTypeFixed
                    : mode === 'per_sqft'
                    ? t.laborTypePerSqft
                    : t.laborTypePercent}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs items-center">
              <div>
                <label className="block text-slate-400 mb-1">
                  {labor.carpentryLaborType === 'fixed'
                    ? `${t.laborTypeFixed} (${currency})`
                    : labor.carpentryLaborType === 'per_sqft'
                    ? `${t.laborTypePerSqft} (${currency}/sq.ft)`
                    : `${t.laborTypePercent} (%)`}
                </label>
                <input
                  type="number"
                  min="0"
                  value={labor.carpentryLaborValue}
                  onChange={(e) =>
                    setLabor({ ...labor, carpentryLaborValue: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono-num focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 text-xs font-mono-num">
                <div className="text-slate-400 text-[11px]">{lang === 'ur' ? 'کل مزدوری' : 'Total Labor'}</div>
                <div className="text-amber-400 font-bold mt-0.5">
                  {Math.round(carpentryCost).toLocaleString()} {currency}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Finishing, Transport, Profit Margin, Advance */}
        <div className="space-y-5">
          {/* Polishing / Finishing */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {t.polishingCharges}
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">
                  {t.polishingRate} ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  value={labor.polishingCostPerSqft}
                  onChange={(e) =>
                    setLabor({
                      ...labor,
                      polishingCostPerSqft: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono-num focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{t.polishingArea}</label>
                <input
                  type="number"
                  min="0"
                  value={labor.polishingAreaSqft}
                  onChange={(e) =>
                    setLabor({
                      ...labor,
                      polishingAreaSqft: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono-num focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-2 rounded bg-slate-950/60 border border-slate-800 text-xs font-mono-num flex justify-between">
              <span className="text-slate-400">{lang === 'ur' ? 'کل پالش خرچہ' : 'Total Polish Cost'}:</span>
              <span className="text-amber-400 font-bold">{Math.round(totalPolishingCost).toLocaleString()} {currency}</span>
            </div>
          </div>

          {/* Transport & Misc Expenses */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-400" />
              {t.transportCharges} & {t.miscExpenses}
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">
                  {t.transportCharges} ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  value={labor.transportationCost}
                  onChange={(e) =>
                    setLabor({
                      ...labor,
                      transportationCost: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono-num focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  {t.miscExpenses} ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  value={labor.miscHardwareCost}
                  onChange={(e) =>
                    setLabor({
                      ...labor,
                      miscHardwareCost: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono-num focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Profit Margin % & Advance Payment */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-amber-400" />
              {t.profitMargin} & {t.advanceAmount}
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">{t.profitMargin} (%)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={labor.profitMarginPercent}
                  onChange={(e) =>
                    setLabor({
                      ...labor,
                      profitMarginPercent: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-amber-400 font-bold font-mono-num focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  {t.advanceAmount} ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  value={labor.advancePaid}
                  onChange={(e) =>
                    setLabor({
                      ...labor,
                      advancePaid: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-emerald-400 font-bold font-mono-num focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
