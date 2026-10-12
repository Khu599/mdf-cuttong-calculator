import React, { useState } from 'react';
import { CutPiece, DimensionUnit, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { convertToInches } from '../utils/optimizer';
import { Plus, Copy, Trash2, RotateCw, Sparkles, Layers, Box } from 'lucide-react';

interface PieceListProps {
  pieces: CutPiece[];
  setPieces: React.Dispatch<React.SetStateAction<CutPiece[]>>;
  unit: DimensionUnit;
  lang: Language;
  onOpenPresets: () => void;
  onOptimize: () => void;
}

export const PieceList: React.FC<PieceListProps> = ({
  pieces,
  setPieces,
  unit,
  lang,
  onOpenPresets,
  onOptimize,
}) => {
  const t = TRANSLATIONS[lang];

  // Local state for adding a new piece
  const [newPiece, setNewPiece] = useState<Partial<CutPiece>>({
    name: '',
    length: 24,
    width: 18,
    quantity: 1,
    allowRotation: true,
    edgeBanding: { top: false, bottom: false, left: false, right: false },
    notes: '',
  });

  const handleAddPiece = () => {
    if (!newPiece.length || !newPiece.width || !newPiece.quantity) return;

    const pieceToAdd: CutPiece = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newPiece.name?.trim() || `${lang === 'ur' ? 'پیس' : 'Piece'} ${pieces.length + 1}`,
      length: Number(newPiece.length),
      width: Number(newPiece.width),
      quantity: Math.max(1, Math.floor(Number(newPiece.quantity))),
      allowRotation: newPiece.allowRotation ?? true,
      edgeBanding: newPiece.edgeBanding || { top: false, bottom: false, left: false, right: false },
      notes: newPiece.notes || '',
    };

    setPieces((prev) => [...prev, pieceToAdd]);
    // Reset form with incremented default name
    setNewPiece({
      name: '',
      length: 24,
      width: 18,
      quantity: 1,
      allowRotation: true,
      edgeBanding: { top: false, bottom: false, left: false, right: false },
      notes: '',
    });
  };

  const handleDuplicate = (piece: CutPiece) => {
    const duplicated: CutPiece = {
      ...piece,
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${piece.name} (${lang === 'ur' ? 'کاپی' : 'Copy'})`,
    };
    setPieces((prev) => [...prev, duplicated]);
  };

  const handleDelete = (id: string) => {
    setPieces((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<CutPiece>) => {
    setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const toggleEdgeBanding = (
    pieceId: string,
    edge: 'top' | 'bottom' | 'left' | 'right'
  ) => {
    setPieces((prev) =>
      prev.map((p) => {
        if (p.id !== pieceId) return p;
        return {
          ...p,
          edgeBanding: {
            ...p.edgeBanding,
            [edge]: !p.edgeBanding[edge],
          },
        };
      })
    );
  };

  // Calculate live statistics
  let totalPartsCount = 0;
  let totalPartsAreaSqFt = 0;
  let totalEdgeBandingInches = 0;

  pieces.forEach((p) => {
    const lenIn = convertToInches(p.length, unit);
    const widIn = convertToInches(p.width, unit);
    const qty = p.quantity;

    totalPartsCount += qty;
    totalPartsAreaSqFt += ((lenIn * widIn) / 144) * qty;

    const edgeLen =
      (p.edgeBanding.top ? widIn : 0) +
      (p.edgeBanding.bottom ? widIn : 0) +
      (p.edgeBanding.left ? lenIn : 0) +
      (p.edgeBanding.right ? lenIn : 0);
    totalEdgeBandingInches += edgeLen * qty;
  });

  const totalEdgeBandingFeet = Number((totalEdgeBandingInches / 12).toFixed(1));

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Box className="w-5 h-5 text-amber-400" />
            {t.piecesListTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ur'
              ? 'فرنیچر کے تمام کٹنگ پینلز، دروازے، شیلفس، لمبائی، چوڑائی اور ایج بینڈنگ کا اندراج کریں۔'
              : 'Add pieces to cut with dimensions, quantities, grain direction, and edge banding.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenPresets}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.quickPresets}</span>
          </button>

          <button
            onClick={onOptimize}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.calculate}</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400">{lang === 'ur' ? 'کل کٹنگ پیسز' : 'Total Parts'}</div>
          <div className="text-lg font-bold text-slate-100 font-mono-num mt-0.5">
            {totalPartsCount} <span className="text-xs text-slate-500 font-normal">{lang === 'ur' ? 'پیسز' : 'pcs'}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400">{lang === 'ur' ? 'خالص کٹنگ رقبہ' : 'Net Cut Area'}</div>
          <div className="text-lg font-bold text-amber-400 font-mono-num mt-0.5">
            {totalPartsAreaSqFt.toFixed(1)} <span className="text-xs text-slate-500 font-normal">sq ft</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400">{lang === 'ur' ? 'ایج بینڈنگ لمبائی' : 'Total Edge Banding'}</div>
          <div className="text-lg font-bold text-sky-400 font-mono-num mt-0.5">
            {totalEdgeBandingFeet} <span className="text-xs text-slate-500 font-normal">{lang === 'ur' ? 'فٹ' : 'ft'}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400">{lang === 'ur' ? 'مختلف آئٹمز' : 'Unique Parts'}</div>
          <div className="text-lg font-bold text-slate-100 font-mono-num mt-0.5">
            {pieces.length} <span className="text-xs text-slate-500 font-normal">{lang === 'ur' ? 'اقسام' : 'types'}</span>
          </div>
        </div>
      </div>

      {/* Quick Add Piece Form Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-amber-400" />
          <span>{lang === 'ur' ? 'فوری نیا پیس شامل کریں' : 'Quick Add New Cut Piece'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Piece Name (4 cols) */}
          <div className="sm:col-span-4">
            <label className="block text-[11px] text-slate-400 mb-1">{t.pieceName}</label>
            <input
              type="text"
              placeholder={lang === 'ur' ? 'مثال: سائیڈ پینل، دراز، شٹر...' : 'e.g., Side Wall, Door Shutter'}
              value={newPiece.name}
              onChange={(e) => setNewPiece({ ...newPiece, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Length (2 cols) */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] text-slate-400 mb-1">
              {t.length} ({unit})
            </label>
            <input
              type="number"
              min="1"
              step="0.1"
              value={newPiece.length}
              onChange={(e) => setNewPiece({ ...newPiece, length: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono-num focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Width (2 cols) */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] text-slate-400 mb-1">
              {t.width} ({unit})
            </label>
            <input
              type="number"
              min="1"
              step="0.1"
              value={newPiece.width}
              onChange={(e) => setNewPiece({ ...newPiece, width: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono-num focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Quantity (1.5 cols) */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] text-slate-400 mb-1">{t.qty}</label>
            <input
              type="number"
              min="1"
              value={newPiece.quantity}
              onChange={(e) => setNewPiece({ ...newPiece, quantity: parseInt(e.target.value, 10) || 1 })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono-num focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Add Button (2 cols) */}
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={handleAddPiece}
              className="w-full py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addPiece}</span>
            </button>
          </div>
        </div>

        {/* Edge Banding Checkboxes for New Piece */}
        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
          <span className="text-[11px] text-slate-400 font-medium">{t.edgeBandingTitle}:</span>
          {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
            <label key={side} className="flex items-center gap-1.5 cursor-pointer text-[11px] hover:text-white">
              <input
                type="checkbox"
                checked={newPiece.edgeBanding?.[side] || false}
                onChange={(e) =>
                  setNewPiece({
                    ...newPiece,
                    edgeBanding: {
                      ...(newPiece.edgeBanding || { top: false, bottom: false, left: false, right: false }),
                      [side]: e.target.checked,
                    },
                  })
                }
                className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-950"
              />
              <span>{t[`edge${side.charAt(0).toUpperCase() + side.slice(1)}` as keyof typeof t]}</span>
            </label>
          ))}

          <span className="text-slate-600">|</span>

          {/* Allow Rotation toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] hover:text-white">
            <input
              type="checkbox"
              checked={newPiece.allowRotation ?? true}
              onChange={(e) => setNewPiece({ ...newPiece, allowRotation: e.target.checked })}
              className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-950"
            />
            <span>{t.rotation}</span>
          </label>
        </div>
      </div>

      {/* Pieces Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-3 w-10 text-center font-mono-num">#</th>
              <th className="py-3 px-3">{t.pieceName}</th>
              <th className="py-3 px-3 font-mono-num">{t.length} ({unit})</th>
              <th className="py-3 px-3 font-mono-num">{t.width} ({unit})</th>
              <th className="py-3 px-3 text-center font-mono-num">{t.qty}</th>
              <th className="py-3 px-3 text-center">{t.rotation}</th>
              <th className="py-3 px-3 text-center">{t.edgeBandingTitle} (T/B/L/R)</th>
              <th className="py-3 px-3 font-mono-num">{t.areaSqFt}</th>
              <th className="py-3 px-3 text-center w-24">{lang === 'ur' ? 'ایکشن' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono-num">
            {pieces.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                  {lang === 'ur'
                    ? 'کوئی پیس شامل نہیں ہے۔ اوپر فارم سے نیا پیس شامل کریں یا ریڈی میڈ فرنیچر ٹیمپلیٹ منتخب کریں۔'
                    : 'No pieces added yet. Use the form above or load a furniture preset.'}
                </td>
              </tr>
            ) : (
              pieces.map((piece, index) => {
                const lenIn = convertToInches(piece.length, unit);
                const widIn = convertToInches(piece.width, unit);
                const pieceSqFt = Number((((lenIn * widIn) / 144) * piece.quantity).toFixed(2));

                return (
                  <tr key={piece.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-500">{index + 1}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-200 font-sans">
                      <input
                        type="text"
                        value={piece.name}
                        onChange={(e) => handleUpdate(piece.id, { name: e.target.value })}
                        className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-amber-500 outline-none w-full text-slate-200"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="1"
                        step="0.1"
                        value={piece.length}
                        onChange={(e) =>
                          handleUpdate(piece.id, { length: parseFloat(e.target.value) || 0 })
                        }
                        className="w-16 bg-slate-950/60 border border-slate-700/60 rounded px-1.5 py-0.5 text-slate-100 text-center outline-none focus:border-amber-500"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="1"
                        step="0.1"
                        value={piece.width}
                        onChange={(e) =>
                          handleUpdate(piece.id, { width: parseFloat(e.target.value) || 0 })
                        }
                        className="w-16 bg-slate-950/60 border border-slate-700/60 rounded px-1.5 py-0.5 text-slate-100 text-center outline-none focus:border-amber-500"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={piece.quantity}
                        onChange={(e) =>
                          handleUpdate(piece.id, { quantity: parseInt(e.target.value, 10) || 1 })
                        }
                        className="w-12 bg-slate-950/60 border border-slate-700/60 rounded px-1.5 py-0.5 text-amber-400 font-bold text-center outline-none focus:border-amber-500"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleUpdate(piece.id, { allowRotation: !piece.allowRotation })}
                        className={`p-1 rounded text-xs transition-colors ${
                          piece.allowRotation
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-slate-500 bg-slate-800'
                        }`}
                        title={piece.allowRotation ? t.rotationYes : t.rotationNo}
                      >
                        <RotateCw className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        {(['top', 'bottom', 'left', 'right'] as const).map((side) => {
                          const active = piece.edgeBanding[side];
                          const label = side.charAt(0).toUpperCase();
                          return (
                            <button
                              key={side}
                              type="button"
                              onClick={() => toggleEdgeBanding(piece.id, side)}
                              className={`w-5 h-5 rounded text-[10px] font-bold transition-colors ${
                                active
                                  ? 'bg-amber-500 text-slate-950 font-bold'
                                  : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                              }`}
                              title={`${t.edgeBandingTitle}: ${t[`edge${side.charAt(0).toUpperCase() + side.slice(1)}` as keyof typeof t]}`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-semibold">{pieceSqFt}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDuplicate(piece)}
                          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                          title={t.copy}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(piece.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title={t.delete}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
