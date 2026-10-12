import React from 'react';
import { FurniturePreset, FURNITURE_PRESETS } from '../utils/presets';
import { Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { X, Sparkles, Check, ArrowRight, Layers } from 'lucide-react';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: FurniturePreset) => void;
  lang: Language;
}

export const PresetModal: React.FC<PresetModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              {t.presets}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-400">
            {lang === 'ur'
              ? 'درج ذیل معیاری فرنیچر ڈیزائنز میں سے کسی ایک کا انتخاب کریں تاکہ کٹنگ لسٹ اور تمام متعلقہ ہارڈ ویئر خودکار لوڈ ہو جائے۔'
              : 'Select a verified furniture template to automatically populate all cut pieces and hardware fittings.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FURNITURE_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                      {lang === 'ur' ? preset.nameUrdu : preset.nameEn}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono-num">
                      {preset.pieces.length} {lang === 'ur' ? 'پیسز' : 'parts'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {lang === 'ur' ? preset.descriptionUrdu : preset.descriptionEn}
                  </p>

                  {/* Summary tags */}
                  <div className="text-[11px] text-slate-500 space-y-1 mb-4 font-mono-num">
                    <div>
                      {lang === 'ur' ? 'ہارڈ ویئر فٹنگز' : 'Hardware'}: {preset.hardware.length} {lang === 'ur' ? 'آئٹمز' : 'items'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectPreset(preset);
                    onClose();
                  }}
                  className="w-full py-2 px-3 text-xs font-bold rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'ur' ? 'یہ ٹیمپلیٹ لوڈ کریں' : 'Load This Preset'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
