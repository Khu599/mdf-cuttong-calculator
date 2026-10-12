import React, { useState, useRef } from 'react';
import { DimensionUnit, Language, OptimizationResult, SheetMaterial } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  Download,
  AlertTriangle,
  Scissors,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Compass,
} from 'lucide-react';

interface CutVisualizerProps {
  optimization: OptimizationResult;
  material: SheetMaterial;
  unit: DimensionUnit;
  lang: Language;
  onGoToPieces: () => void;
}

export const CutVisualizer: React.FC<CutVisualizerProps> = ({
  optimization,
  material,
  unit,
  lang,
  onGoToPieces,
}) => {
  const t = TRANSLATIONS[lang];
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showEdgeBanding, setShowEdgeBanding] = useState<boolean>(true);
  const [showOffcuts, setShowOffcuts] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const sheets = optimization.sheets;
  const currentSheet = sheets[activeSheetIndex];

  // If no sheets calculated or no pieces
  if (!sheets || sheets.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <Scissors className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">
          {lang === 'ur' ? 'ابھی کوئی کٹنگ لے آؤٹ دستیاب نہیں ہے' : 'No Cutting Layout Available'}
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {lang === 'ur'
            ? 'کٹنگ ڈایاگرام دیکھنے کے لیے "کٹنگ لسٹ" میں پیسز درج کریں اور "کٹنگ آپٹیمائز کریں" پر کلک کریں۔'
            : 'Add cut pieces in the Cut List tab to generate optimized 2D guillotine cutting diagrams.'}
        </p>
        <button
          onClick={onGoToPieces}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 inline-flex items-center gap-2 transition-colors"
        >
          <span>{lang === 'ur' ? 'کٹنگ لسٹ پر جائیں' : 'Go to Cut Pieces List'}</span>
        </button>
      </div>
    );
  }

  // Export current SVG
  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `sheet_${activeSheetIndex + 1}_cut_layout.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Dimensions of sheet for SVG viewBox
  const sheetW = material.sheetWidth;
  const sheetH = material.sheetLength;
  const trim = material.trimMargin;

  return (
    <div className="space-y-6">
      {/* Visualizer Top Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            {t.layoutTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ur'
              ? 'شیٹس پر کٹنگ پینلز کی دو جہتی (2D) تفصیلی ترتیب، ضائع شدہ رقبہ اور بچ جانے والے مفید ٹکڑے'
              : 'Interactive 2D cutting plan, saw kerfs, grain orientation, and reusable offcuts.'}
          </p>
        </div>

        {/* Global Summary Stats */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400">{t.sheetsNeeded}: </span>
            <strong className="text-amber-400 font-mono-num font-bold text-sm">
              {optimization.totalSheetsRequired}
            </strong>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400">{t.efficiency}: </span>
            <strong
              className={`font-mono-num font-bold text-sm ${
                optimization.overallEfficiency >= 80 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {optimization.overallEfficiency}%
            </strong>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400">{lang === 'ur' ? 'کل کٹس' : 'Saw Cut Passes'}: </span>
            <strong className="text-sky-400 font-mono-num font-bold text-sm">
              {optimization.totalLinearCutLength} {unit}
            </strong>
          </div>

          <button
            onClick={handleExportSvg}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.downloadLayoutSvg}</span>
          </button>
        </div>
      </div>

      {/* Warning for unplaced pieces if any */}
      {optimization.unplacedCount > 0 && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <div>
            <strong>{t.unplacedPieces}:</strong> {optimization.unplacedCount} {lang === 'ur' ? 'پیسز شیٹ کی پیمائش سے بڑے ہیں اور شیٹ پر نہیں سمائے۔' : 'pieces exceeded raw sheet dimensions.'}
          </div>
        </div>
      )}

      {/* Sheet Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {sheets.map((sheet, index) => (
            <button
              key={sheet.sheetIndex}
              onClick={() => setActiveSheetIndex(index)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors font-mono-num flex items-center gap-2 ${
                activeSheetIndex === index
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>
                {lang === 'ur' ? `شیٹ #${sheet.sheetIndex}` : `Sheet #${sheet.sheetIndex}`}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded ${
                  activeSheetIndex === index
                    ? 'bg-slate-950/20 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {sheet.utilizationRate}%
              </span>
            </button>
          ))}
        </div>

        {/* View Options Toggles */}
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showDimensions}
              onChange={(e) => setShowDimensions(e.target.checked)}
              className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-950"
            />
            <span>{lang === 'ur' ? 'سائز دکھائیں' : 'Dimensions'}</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showEdgeBanding}
              onChange={(e) => setShowEdgeBanding(e.target.checked)}
              className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-950"
            />
            <span>{lang === 'ur' ? 'ایج پٹی نمایاں' : 'Edge Banding'}</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showOffcuts}
              onChange={(e) => setShowOffcuts(e.target.checked)}
              className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-950"
            />
            <span>{lang === 'ur' ? 'بچے مفید ٹکڑے' : 'Remnants'}</span>
          </label>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono-num px-1 text-slate-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Sheet Visual Canvas Container */}
      <div className="p-4 sm:p-6 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
        {currentSheet && (
          <div
            className="mx-auto transition-transform duration-200"
            style={{
              maxWidth: '900px',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
            }}
          >
            {/* SVG Diagram */}
            <svg
              ref={svgRef}
              viewBox={`0 0 ${sheetW} ${sheetH}`}
              className="w-full h-auto rounded-lg shadow-2xl bg-slate-950 border-2 border-slate-700 font-sans select-none"
              style={{
                aspectRatio: `${sheetW} / ${sheetH}`,
              }}
            >
              <defs>
                {/* Diagonal stripe pattern for waste areas */}
                <pattern
                  id="waste-pattern"
                  width="10"
                  height="10"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line x1="0" y1="0" x2="0" y2="10" stroke="#334155" strokeWidth="2" />
                </pattern>
                {/* Remnant pattern */}
                <pattern
                  id="remnant-pattern"
                  width="8"
                  height="8"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#065f46" strokeWidth="1.5" />
                </pattern>
              </defs>

              {/* Sheet Background (Raw sheet) */}
              <rect
                x="0"
                y="0"
                width={sheetW}
                height={sheetH}
                fill="#0f172a"
                stroke="#475569"
                strokeWidth="1"
              />

              {/* Trim Border Line */}
              {trim > 0 && (
                <rect
                  x={trim}
                  y={trim}
                  width={sheetW - trim * 2}
                  height={sheetH - trim * 2}
                  fill="url(#waste-pattern)"
                  stroke="#64748b"
                  strokeWidth="0.8"
                  strokeDasharray="4 3"
                />
              )}

              {/* Offcuts / Usable Remnants */}
              {showOffcuts &&
                currentSheet.offcuts.map((rem, rIdx) => {
                  if (rem.width <= 1 || rem.height <= 1) return null;
                  return (
                    <g key={`offcut_${rIdx}`}>
                      <rect
                        x={rem.x}
                        y={rem.y}
                        width={rem.width}
                        height={rem.height}
                        fill={rem.isUsable ? 'url(#remnant-pattern)' : 'url(#waste-pattern)'}
                        stroke={rem.isUsable ? '#10b981' : '#475569'}
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      {rem.isUsable && rem.width > 12 && rem.height > 12 && (
                        <text
                          x={rem.x + rem.width / 2}
                          y={rem.y + rem.height / 2}
                          fill="#34d399"
                          fontSize={Math.min(rem.width, rem.height) * 0.12}
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          {lang === 'ur' ? 'مفید ٹکڑا (Remnant)' : 'Usable Remnant'}
                          <tspan
                            x={rem.x + rem.width / 2}
                            dy="1.3em"
                            fontSize="0.85em"
                            fill="#6ee7b7"
                          >
                            {rem.width.toFixed(1)} × {rem.height.toFixed(1)} {unit}
                          </tspan>
                        </text>
                      )}
                    </g>
                  );
                })}

              {/* Placed Pieces */}
              {currentSheet.placedPieces.map((p, pIdx) => {
                // Dimensions in SVG units
                const px = p.x;
                const py = p.y;
                const pw = p.width;
                const ph = p.height;

                const minDim = Math.min(pw, ph);
                const titleFontSize = Math.max(2, Math.min(5, minDim * 0.16));
                const dimFontSize = Math.max(1.8, titleFontSize * 0.78);

                return (
                  <g key={`piece_${pIdx}`} className="cursor-pointer group">
                    {/* Piece Base Rect */}
                    <rect
                      x={px}
                      y={py}
                      width={pw}
                      height={ph}
                      fill={p.color}
                      fillOpacity="0.88"
                      stroke="#0f172a"
                      strokeWidth="1.2"
                      rx="1"
                    />

                    {/* Edge Banding Highlight Lines (Bright Neon Gold borders) */}
                    {showEdgeBanding && (
                      <>
                        {/* Top Edge */}
                        {p.edgeBanding.top && (
                          <line
                            x1={px}
                            y1={py + 0.6}
                            x2={px + pw}
                            y2={py + 0.6}
                            stroke="#f59e0b"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        )}
                        {/* Bottom Edge */}
                        {p.edgeBanding.bottom && (
                          <line
                            x1={px}
                            y1={py + ph - 0.6}
                            x2={px + pw}
                            y2={py + ph - 0.6}
                            stroke="#f59e0b"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        )}
                        {/* Left Edge */}
                        {p.edgeBanding.left && (
                          <line
                            x1={px + 0.6}
                            y1={py}
                            x2={px + 0.6}
                            y2={py + ph}
                            stroke="#f59e0b"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        )}
                        {/* Right Edge */}
                        {p.edgeBanding.right && (
                          <line
                            x1={px + pw - 0.6}
                            y1={py}
                            x2={px + pw - 0.6}
                            y2={py + ph}
                            stroke="#f59e0b"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        )}
                      </>
                    )}

                    {/* Piece Labels & Text */}
                    {pw > 8 && ph > 6 && (
                      <g>
                        {/* Piece Name */}
                        <text
                          x={px + pw / 2}
                          y={py + ph / 2 - (showDimensions ? dimFontSize * 0.7 : 0)}
                          fill="#0f172a"
                          fontSize={titleFontSize}
                          fontWeight="700"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="font-bold"
                        >
                          {p.name.length > 18 ? `${p.name.substring(0, 16)}...` : p.name}
                        </text>

                        {/* Dimensions label */}
                        {showDimensions && (
                          <text
                            x={px + pw / 2}
                            y={py + ph / 2 + titleFontSize * 0.8}
                            fill="#1e293b"
                            fontSize={dimFontSize}
                            fontWeight="600"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="font-mono-num font-semibold"
                          >
                            {p.originalHeight} × {p.originalWidth} {unit}
                            {p.rotated && (
                              <tspan fill="#312e81" fontSize="0.85em">
                                {' '}
                                ↻ 90°
                              </tspan>
                            )}
                          </text>
                        )}
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Sheet Summary Strip & Carpenter Saw Guidelines */}
      {currentSheet && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Active Sheet Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>
                {lang === 'ur'
                  ? `شیٹ #${currentSheet.sheetIndex} کی تفصیلات`
                  : `Sheet #${currentSheet.sheetIndex} Breakdown`}
              </span>
              <span className="text-amber-400 font-mono-num font-bold">
                {currentSheet.placedPieces.length} {lang === 'ur' ? 'پیسز' : 'pieces'}
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-400 font-mono-num pt-1">
              <div className="flex justify-between">
                <span>{t.usedAreaLabel}:</span>
                <span className="text-emerald-400 font-semibold">{currentSheet.usedArea} sq.ft</span>
              </div>
              <div className="flex justify-between">
                <span>{t.wasteAreaLabel}:</span>
                <span className="text-rose-400 font-semibold">{currentSheet.wasteArea} sq.ft</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-200 font-sans">{t.efficiency}:</span>
                <span className="text-amber-400 font-bold text-sm">
                  {currentSheet.utilizationRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Edge Banding Visual Legend */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="text-xs font-bold text-slate-200">
              {lang === 'ur' ? 'نقشہ اشاریہ (Legend)' : 'Visual Legend'}
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-amber-500 rounded"></div>
                <span className="text-[11px]">
                  {lang === 'ur'
                    ? 'پیلی لکیر: ایج بینڈنگ (PVC پٹی) لازمی ہے'
                    : 'Golden Edge: PVC Edge Banding Required'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500 border-dashed"></div>
                <span className="text-[11px]">
                  {lang === 'ur'
                    ? 'سبز خانہ: کارآمد بچا ہوا ٹکڑا (قابل استعمال)'
                    : 'Green Zone: Usable Remnant / Offcut'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700"></div>
                <span className="text-[11px]">
                  {lang === 'ur' ? 'سلیٹی خانہ: ضائع شدہ اسکریپ' : 'Dark Zone: Scrap / Sawdust'}
                </span>
              </div>
            </div>
          </div>

          {/* Workshop Sawing Advice */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{t.cuttingInstructions}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {lang === 'ur'
                ? '1. ہمیشہ پہلے شیٹ کے چاروں کناروں کو گونیہ (90°) میں ٹرم کریں۔ 2. بڑے پینلز پہلے کاٹیں تاکہ چھوٹے پیسز اور درازیں بچی ہوئی اسٹرپ سے آسانی سے نکل سکیں۔'
                : '1. Always square raw sheet edges first. 2. Cut primary rip cuts along longest dimension to preserve large continuous offcut strips.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
