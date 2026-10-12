import React, { useState } from 'react';
import {
  CurrencyCode,
  DimensionUnit,
  EdgeBandingSettings,
  HardwareItem,
  LaborAndExtraCosts,
  Language,
  OptimizationResult,
  ProjectData,
  SheetMaterial,
} from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  Printer,
  FileText,
  User,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle2,
  Share2,
} from 'lucide-react';

interface QuotationInvoiceProps {
  project: ProjectData;
  setProject: React.Dispatch<React.SetStateAction<ProjectData>>;
  material: SheetMaterial;
  optimization: OptimizationResult;
  edgeBanding: EdgeBandingSettings;
  hardware: HardwareItem[];
  labor: LaborAndExtraCosts;
  unit: DimensionUnit;
  currency: CurrencyCode;
  lang: Language;
}

export const QuotationInvoice: React.FC<QuotationInvoiceProps> = ({
  project,
  setProject,
  material,
  optimization,
  edgeBanding,
  hardware,
  labor,
  unit,
  currency,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const [printMode, setPrintMode] = useState<'client' | 'workshop'>('client');

  // Calculate Costs
  const sheetsNeeded = optimization.totalSheetsRequired || 0;
  const rawMaterialCost = sheetsNeeded * material.pricePerSheet;

  // Cutting fees
  const cuttingCost = sheetsNeeded * labor.cuttingCostPerSheet;

  // Edge Banding
  const edgeFeet = optimization.totalEdgeBandingLength;
  const edgeCost = edgeBanding.enabled
    ? edgeFeet * (edgeBanding.tapeRatePerUnitLength + edgeBanding.laborRatePerUnitLength)
    : 0;

  // Hardware
  const hardwareCost = hardware.reduce((acc, h) => acc + h.quantity * h.unitPrice, 0);

  // Carpentry Labor
  let carpentryCost = 0;
  if (labor.carpentryLaborType === 'fixed') {
    carpentryCost = labor.carpentryLaborValue;
  } else if (labor.carpentryLaborType === 'per_sqft') {
    carpentryCost = optimization.totalPartsArea * labor.carpentryLaborValue;
  } else if (labor.carpentryLaborType === 'percent_material') {
    carpentryCost = (rawMaterialCost * labor.carpentryLaborValue) / 100;
  }

  // Polishing
  const polishingCost = labor.polishingAreaSqft * labor.polishingCostPerSqft;

  // Transport & Misc
  const transportCost = labor.transportationCost;
  const miscCost = labor.miscHardwareCost;

  // Subtotal (Direct costs)
  const subtotalCost =
    rawMaterialCost +
    cuttingCost +
    edgeCost +
    hardwareCost +
    carpentryCost +
    polishingCost +
    transportCost +
    miscCost;

  // Profit Margin
  const profitAmount = (subtotalCost * labor.profitMarginPercent) / 100;

  // Grand Total
  const grandTotal = subtotalCost + profitAmount;
  const balanceDue = Math.max(0, grandTotal - labor.advancePaid);

  const handlePrint = (mode: 'client' | 'workshop') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 no-print">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            {t.quoteTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ur'
              ? 'گاہک کے لیے شفاف کوٹیشن انوائس یا ورکشاپ کاریگر کے لیے پرنٹ ایبل کٹ شیٹ تیار کریں۔'
              : 'Official client quotation invoice and printable workshop cut list.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePrint('workshop')}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.printWorkshop}</span>
          </button>

          <button
            onClick={() => handlePrint('client')}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.printQuote}</span>
          </button>
        </div>
      </div>

      {/* Editable Client & Project Info Fields (No-print controls) */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 no-print">
        <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <User className="w-4 h-4 text-amber-400" />
          <span>{t.clientDetails}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">{t.projectName}</label>
            <input
              type="text"
              value={project.title}
              onChange={(e) => setProject({ ...project, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">{t.clientName}</label>
            <input
              type="text"
              value={project.clientName}
              onChange={(e) => setProject({ ...project, clientName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">{t.clientPhone}</label>
            <input
              type="text"
              value={project.clientPhone}
              onChange={(e) => setProject({ ...project, clientPhone: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono-num focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">{t.quoteDate}</label>
            <input
              type="date"
              value={project.date}
              onChange={(e) => setProject({ ...project, date: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono-num focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Quotation Invoice Document Container (Clean White on Print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 print:bg-white print:text-black print:border-none print:p-0 print:m-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-800 print:border-neutral-300">
          <div>
            <div className="text-xs uppercase tracking-wider text-amber-400 font-bold print:text-amber-700 font-mono-num">
              {printMode === 'workshop' ? t.workshopInstructions : 'ESTIMATE & QUOTATION INVOICE'}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white print:text-neutral-900 mt-1">
              {project.title || t.appTitle}
            </h1>
            <p className="text-xs text-slate-400 print:text-neutral-500 mt-0.5">
              {lang === 'ur'
                ? 'پیشہ ورانہ لکڑی و فرنیچر تیار کنندہ'
                : 'Custom Furniture & Cabinetry Production Studio'}
            </p>
          </div>

          {/* Metadata Block */}
          <div className="text-xs text-slate-300 print:text-neutral-700 space-y-1 sm:text-right font-mono-num">
            <div>
              <span className="text-slate-400 print:text-neutral-500">{t.quoteDate}: </span>
              <strong>{project.date}</strong>
            </div>
            <div>
              <span className="text-slate-400 print:text-neutral-500">{lang === 'ur' ? 'حوالہ نمبر' : 'Ref No'}: </span>
              <strong>QT-{project.id.slice(-6).toUpperCase()}</strong>
            </div>
            <div>
              <span className="text-slate-400 print:text-neutral-500">{t.currency}: </span>
              <strong>{currency}</strong>
            </div>
          </div>
        </div>

        {/* Client & Project Overview Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 print:bg-neutral-50 border border-slate-800/80 print:border-neutral-200 text-xs">
          <div>
            <div className="text-slate-400 print:text-neutral-500 text-[11px] mb-1 font-semibold uppercase">
              {t.clientDetails}
            </div>
            <div className="font-bold text-slate-200 print:text-neutral-900 text-sm">
              {project.clientName || (lang === 'ur' ? 'محترم گاہک' : 'Valued Client')}
            </div>
            <div className="text-slate-400 print:text-neutral-600 font-mono-num mt-0.5">
              {project.clientPhone || '-'}
            </div>
          </div>

          <div>
            <div className="text-slate-400 print:text-neutral-500 text-[11px] mb-1 font-semibold uppercase">
              {lang === 'ur' ? 'میٹریل و تصریحات' : 'Material & Specifications'}
            </div>
            <div className="font-semibold text-slate-200 print:text-neutral-900">
              {material.thickness} - {material.nameUrdu || material.category}
            </div>
            <div className="text-slate-400 print:text-neutral-600 font-mono-num mt-0.5">
              {material.sheetLength} × {material.sheetWidth} {unit} ({sheetsNeeded} {lang === 'ur' ? 'شیٹس درکار' : 'sheets required'})
            </div>
          </div>
        </div>

        {/* Itemized Financial Breakdown Table (Client View) */}
        {printMode === 'client' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white print:text-neutral-900 pb-2 border-b border-slate-800 print:border-neutral-200">
              {t.costBreakdown}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 print:text-neutral-800 font-mono-num">
                <thead className="bg-slate-950/60 print:bg-neutral-100 text-[11px] uppercase text-slate-400 print:text-neutral-600 border-b border-slate-800 print:border-neutral-300">
                  <tr>
                    <th className="py-2.5 px-3">{lang === 'ur' ? 'تفصیل' : 'Description'}</th>
                    <th className="py-2.5 px-3 text-center">{t.qty}</th>
                    <th className="py-2.5 px-3 text-right">{t.rate}</th>
                    <th className="py-2.5 px-3 text-right">{t.total} ({currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-neutral-200">
                  {/* Sheets */}
                  <tr>
                    <td className="py-2.5 px-3 font-sans">
                      <strong className="text-slate-100 print:text-neutral-900">{t.materialCost}</strong> ({material.category})
                    </td>
                    <td className="py-2.5 px-3 text-center">{sheetsNeeded} {lang === 'ur' ? 'شیٹس' : 'sheets'}</td>
                    <td className="py-2.5 px-3 text-right">{material.pricePerSheet.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-100 print:text-neutral-900">
                      {rawMaterialCost.toLocaleString()}
                    </td>
                  </tr>

                  {/* Saw Cutting Fee */}
                  {cuttingCost > 0 && (
                    <tr>
                      <td className="py-2.5 px-3 font-sans">{t.cuttingCharges}</td>
                      <td className="py-2.5 px-3 text-center">{sheetsNeeded}</td>
                      <td className="py-2.5 px-3 text-right">{labor.cuttingCostPerSheet.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{cuttingCost.toLocaleString()}</td>
                    </tr>
                  )}

                  {/* Edge Banding */}
                  {edgeBanding.enabled && edgeCost > 0 && (
                    <tr>
                      <td className="py-2.5 px-3 font-sans">
                        {t.edgeCost} ({edgeFeet} ft)
                      </td>
                      <td className="py-2.5 px-3 text-center">{edgeFeet} ft</td>
                      <td className="py-2.5 px-3 text-right">
                        {(edgeBanding.tapeRatePerUnitLength + edgeBanding.laborRatePerUnitLength).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold">{Math.round(edgeCost).toLocaleString()}</td>
                    </tr>
                  )}

                  {/* Hardware Summary */}
                  {hardwareCost > 0 && (
                    <tr>
                      <td className="py-2.5 px-3 font-sans">
                        {t.hardwareCost} ({hardware.length} {lang === 'ur' ? 'اقسام' : 'items'})
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {hardware.reduce((a, b) => a + b.quantity, 0)} pcs
                      </td>
                      <td className="py-2.5 px-3 text-right">-</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{hardwareCost.toLocaleString()}</td>
                    </tr>
                  )}

                  {/* Carpentry Assembly Labor */}
                  {carpentryCost > 0 && (
                    <tr>
                      <td className="py-2.5 px-3 font-sans">{t.carpentryLabor}</td>
                      <td className="py-2.5 px-3 text-center">1 Job</td>
                      <td className="py-2.5 px-3 text-right">-</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{Math.round(carpentryCost).toLocaleString()}</td>
                    </tr>
                  )}

                  {/* Polishing / Finishing */}
                  {polishingCost > 0 && (
                    <tr>
                      <td className="py-2.5 px-3 font-sans">
                        {t.finishingCost} ({labor.polishingAreaSqft} sq.ft)
                      </td>
                      <td className="py-2.5 px-3 text-center">{labor.polishingAreaSqft} sq.ft</td>
                      <td className="py-2.5 px-3 text-right">{labor.polishingCostPerSqft}</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{Math.round(polishingCost).toLocaleString()}</td>
                    </tr>
                  )}

                  {/* Transport */}
                  {transportCost > 0 && (
                    <tr>
                      <td className="py-2.5 px-3 font-sans">{t.transportCost}</td>
                      <td className="py-2.5 px-3 text-center">-</td>
                      <td className="py-2.5 px-3 text-right">-</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{transportCost.toLocaleString()}</td>
                    </tr>
                  )}

                  {/* Misc */}
                  {miscCost > 0 && (
                    <tr>
                      <td className="py-2.5 px-3 font-sans">{t.miscExpenses}</td>
                      <td className="py-2.5 px-3 text-center">-</td>
                      <td className="py-2.5 px-3 text-right">-</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{miscCost.toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Total Summary Strip */}
            <div className="flex flex-col sm:flex-row justify-end pt-4 border-t border-slate-800 print:border-neutral-300">
              <div className="w-full sm:w-72 space-y-2 text-xs font-mono-num">
                <div className="flex justify-between py-1 text-slate-400 print:text-neutral-600">
                  <span className="font-sans">{t.subtotal}:</span>
                  <span>{Math.round(subtotalCost).toLocaleString()} {currency}</span>
                </div>

                {profitAmount > 0 && (
                  <div className="flex justify-between py-1 text-slate-400 print:text-neutral-600">
                    <span className="font-sans">{t.profitAmount} ({labor.profitMarginPercent}%):</span>
                    <span>{Math.round(profitAmount).toLocaleString()} {currency}</span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-t border-b border-slate-700 print:border-neutral-400 text-sm font-bold text-amber-400 print:text-neutral-900">
                  <span className="font-sans">{t.grandTotal}:</span>
                  <span>{Math.round(grandTotal).toLocaleString()} {currency}</span>
                </div>

                {labor.advancePaid > 0 && (
                  <div className="flex justify-between py-1 text-emerald-400 print:text-emerald-700 font-semibold">
                    <span className="font-sans">{t.advanceAmount}:</span>
                    <span>- {labor.advancePaid.toLocaleString()} {currency}</span>
                  </div>
                )}

                <div className="flex justify-between py-1 text-base font-bold text-white print:text-neutral-900">
                  <span className="font-sans">{t.balanceDue}:</span>
                  <span className="text-amber-400 print:text-neutral-900">{Math.round(balanceDue).toLocaleString()} {currency}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workshop Carpenter Cut-Sheet (Workshop View or Print) */}
        <div className={`space-y-4 ${printMode === 'client' ? 'pt-6 border-t border-slate-800 print:border-neutral-300' : ''}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white print:text-neutral-900">
              {lang === 'ur' ? 'کاریگر کٹنگ لسٹ و ایج بینڈنگ' : 'Carpenter Workshop Cut List'}
            </h3>
            <span className="text-xs text-slate-400 print:text-neutral-500 font-mono-num">
              {optimization.totalPartsCount} {lang === 'ur' ? 'پیسز' : 'pieces'} · {optimization.totalPartsArea} sq.ft
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 print:text-neutral-800 font-mono-num">
              <thead className="bg-slate-950/60 print:bg-neutral-100 text-[11px] uppercase text-slate-400 print:text-neutral-600 border-b border-slate-800 print:border-neutral-300">
                <tr>
                  <th className="py-2 px-2 text-center w-8">#</th>
                  <th className="py-2 px-3">{t.pieceName}</th>
                  <th className="py-2 px-3 text-center">{t.length} ({unit})</th>
                  <th className="py-2 px-3 text-center">{t.width} ({unit})</th>
                  <th className="py-2 px-2 text-center">{t.qty}</th>
                  <th className="py-2 px-3 text-center">{t.edgeBandingTitle} (Top / Bot / Left / Right)</th>
                  <th className="py-2 px-2 text-center">{lang === 'ur' ? 'ریشہ' : 'Grain'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-neutral-200">
                {project.pieces.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="py-2 px-2 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-sans font-medium text-slate-200 print:text-neutral-900">
                      {p.name}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-slate-100 print:text-neutral-900">
                      {p.length}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-slate-100 print:text-neutral-900">
                      {p.width}
                    </td>
                    <td className="py-2 px-2 text-center text-amber-400 print:text-neutral-900 font-bold">
                      {p.quantity}
                    </td>
                    <td className="py-2 px-3 text-center font-sans text-[11px]">
                      {p.edgeBanding.top || p.edgeBanding.bottom || p.edgeBanding.left || p.edgeBanding.right ? (
                        <div className="inline-flex gap-1">
                          {p.edgeBanding.top && <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 print:border print:border-neutral-400 text-[10px]">T</span>}
                          {p.edgeBanding.bottom && <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 print:border print:border-neutral-400 text-[10px]">B</span>}
                          {p.edgeBanding.left && <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 print:border print:border-neutral-400 text-[10px]">L</span>}
                          {p.edgeBanding.right && <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 print:border print:border-neutral-400 text-[10px]">R</span>}
                        </div>
                      ) : (
                        <span className="text-slate-600 print:text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-center font-sans text-[10px]">
                      {p.allowRotation ? (
                        <span className="text-slate-500 print:text-neutral-400">↻ 90°</span>
                      ) : (
                        <span className="text-amber-400 print:text-neutral-900">॥ {lang === 'ur' ? 'سیدھا' : 'Lock'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Terms & Signatures Block */}
        <div className="pt-6 border-t border-slate-800 print:border-neutral-300 space-y-6">
          <div className="text-[11px] text-slate-400 print:text-neutral-500 space-y-1">
            <div className="font-semibold text-slate-300 print:text-neutral-700">{t.terms}:</div>
            <div>• {t.term1}</div>
            <div>• {t.term2}</div>
            <div>• {t.term3}</div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8">
            <div className="border-t border-slate-700 print:border-neutral-400 pt-2 text-center text-xs text-slate-400 print:text-neutral-600">
              {t.signatureClient}
            </div>
            <div className="border-t border-slate-700 print:border-neutral-400 pt-2 text-center text-xs text-slate-400 print:text-neutral-600">
              {t.signatureWorkshop}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
