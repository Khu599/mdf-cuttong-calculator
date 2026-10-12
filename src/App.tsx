import React, { useState, useEffect, useMemo } from 'react';
import {
  CurrencyCode,
  DimensionUnit,
  EdgeBandingSettings,
  HardwareItem,
  LaborAndExtraCosts,
  Language,
  ProjectData,
  SheetMaterial,
} from './types';
import { TRANSLATIONS } from './utils/translations';
import { FURNITURE_PRESETS, FurniturePreset } from './utils/presets';
import { optimizeCuttingStock } from './utils/optimizer';
import { Navbar } from './components/Navbar';
import { SheetSetup } from './components/SheetSetup';
import { PieceList } from './components/PieceList';
import { CutVisualizer } from './components/CutVisualizer';
import { HardwareList } from './components/HardwareList';
import { LaborAndExtras } from './components/LaborAndExtras';
import { QuotationInvoice } from './components/QuotationInvoice';
import { PresetModal } from './components/PresetModal';
import { ProjectStorageModal } from './components/ProjectStorageModal';

const DEFAULT_MATERIAL: SheetMaterial = {
  id: 'mat_default',
  nameUrdu: 'لسانی شیٹ (Lasani Board)',
  nameEn: 'Lasani Laminated Board',
  category: 'lasani',
  sheetLength: 96, // 8 ft in inches
  sheetWidth: 48,  // 4 ft in inches
  thickness: '16mm',
  pricePerSheet: 4800,
  sawKerf: 0.125,  // 1/8 inch
  trimMargin: 0.5, // 1/2 inch
};

const DEFAULT_EDGE_BANDING: EdgeBandingSettings = {
  enabled: true,
  tapeRatePerUnitLength: 18,
  laborRatePerUnitLength: 12,
  tapeThickness: '1mm',
  unitLength: 'ft',
};

const DEFAULT_LABOR: LaborAndExtraCosts = {
  cuttingCostPerSheet: 350,
  carpentryLaborType: 'fixed',
  carpentryLaborValue: 6500,
  polishingCostPerSqft: 45,
  polishingAreaSqft: 0,
  transportationCost: 2000,
  miscHardwareCost: 800,
  profitMarginPercent: 15,
  taxOrDiscountPercent: 0,
  advancePaid: 8000,
};

export default function App() {
  const [lang, setLang] = useState<Language>('ur');
  const [unit, setUnit] = useState<DimensionUnit>('in');
  const [currency, setCurrency] = useState<CurrencyCode>('PKR');
  const [activeTab, setActiveTab] = useState<string>('sheet');

  // Modals
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);

  // Core Data
  const [material, setMaterial] = useState<SheetMaterial>(DEFAULT_MATERIAL);
  const [edgeBanding, setEdgeBanding] = useState<EdgeBandingSettings>(DEFAULT_EDGE_BANDING);
  const [labor, setLabor] = useState<LaborAndExtraCosts>(DEFAULT_LABOR);

  // Initialize with the standard Wardrobe preset so the user sees a rich working cut plan immediately
  const initialPreset = FURNITURE_PRESETS[0];
  const [pieces, setPieces] = useState(initialPreset.pieces);
  const [hardware, setHardware] = useState<HardwareItem[]>(initialPreset.hardware);

  const [project, setProject] = useState<ProjectData>({
    id: `proj_${Date.now()}`,
    title: 'بیڈ روم وارڈروب الماری پروجیکٹ (Bedroom Wardrobe)',
    clientName: 'محمد ارشد خان',
    clientPhone: '0300-1234567',
    clientAddress: 'ڈی ایچ اے فیز 5، لاہور',
    date: new Date().toISOString().split('T')[0],
    unit: 'in',
    currency: 'PKR',
    material: DEFAULT_MATERIAL,
    edgeBanding: DEFAULT_EDGE_BANDING,
    pieces: initialPreset.pieces,
    hardware: initialPreset.hardware,
    laborAndExtras: DEFAULT_LABOR,
    notes: 'تمام کٹنگ سے قبل سائٹ وزٹ اور گونیہ چیک کر لیا گیا ہے۔',
  });

  // Sync dir and lang attributes on document
  useEffect(() => {
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Keep project in sync with pieces and hardware
  useEffect(() => {
    setProject((prev) => ({
      ...prev,
      material,
      edgeBanding,
      pieces,
      hardware,
      laborAndExtras: labor,
      unit,
      currency,
    }));
  }, [material, edgeBanding, pieces, hardware, labor, unit, currency]);

  // Real-time 2D Cutting Optimization computation
  const optimization = useMemo(() => {
    return optimizeCuttingStock(material, pieces, unit);
  }, [material, pieces, unit]);

  // Handle Preset selection
  const handleSelectPreset = (preset: FurniturePreset) => {
    setPieces(preset.pieces);
    setHardware(preset.hardware);
    setProject((prev) => ({
      ...prev,
      title: lang === 'ur' ? preset.nameUrdu : preset.nameEn,
      pieces: preset.pieces,
      hardware: preset.hardware,
    }));
    setActiveTab('pieces');
  };

  // Handle loading project from storage
  const handleLoadProject = (loaded: ProjectData) => {
    setProject(loaded);
    if (loaded.material) setMaterial(loaded.material);
    if (loaded.edgeBanding) setEdgeBanding(loaded.edgeBanding);
    if (loaded.pieces) setPieces(loaded.pieces);
    if (loaded.hardware) setHardware(loaded.hardware);
    if (loaded.laborAndExtras) setLabor(loaded.laborAndExtras);
    if (loaded.unit) setUnit(loaded.unit);
    if (loaded.currency) setCurrency(loaded.currency);
  };

  // Reset to empty
  const handleReset = () => {
    if (window.confirm(lang === 'ur' ? 'کیا آپ تمام ڈیٹا صاف کرنا چاہتے ہیں؟' : 'Reset all inputs?')) {
      setPieces([]);
      setHardware([]);
      setMaterial(DEFAULT_MATERIAL);
      setLabor(DEFAULT_LABOR);
    }
  };

  const t = TRANSLATIONS[lang];

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${lang === 'ur' ? 'font-nastaliq' : ''}`}>
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        unit={unit}
        setUnit={setUnit}
        currency={currency}
        setCurrency={setCurrency}
        onOpenPresets={() => setIsPresetModalOpen(true)}
        onOpenProjects={() => setIsProjectModalOpen(true)}
        onPrint={() => setActiveTab('summary')}
        onReset={handleReset}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'sheet' && (
          <SheetSetup
            material={material}
            setMaterial={setMaterial}
            unit={unit}
            currency={currency}
            lang={lang}
          />
        )}

        {activeTab === 'pieces' && (
          <PieceList
            pieces={pieces}
            setPieces={setPieces}
            unit={unit}
            lang={lang}
            onOpenPresets={() => setIsPresetModalOpen(true)}
            onOptimize={() => setActiveTab('layout')}
          />
        )}

        {activeTab === 'layout' && (
          <CutVisualizer
            optimization={optimization}
            material={material}
            unit={unit}
            lang={lang}
            onGoToPieces={() => setActiveTab('pieces')}
          />
        )}

        {activeTab === 'hardware' && (
          <HardwareList
            hardware={hardware}
            setHardware={setHardware}
            currency={currency}
            lang={lang}
          />
        )}

        {activeTab === 'labor' && (
          <LaborAndExtras
            labor={labor}
            setLabor={setLabor}
            edgeBanding={edgeBanding}
            setEdgeBanding={setEdgeBanding}
            optimization={optimization}
            material={material}
            unit={unit}
            currency={currency}
            lang={lang}
          />
        )}

        {activeTab === 'summary' && (
          <QuotationInvoice
            project={project}
            setProject={setProject}
            material={material}
            optimization={optimization}
            edgeBanding={edgeBanding}
            hardware={hardware}
            labor={labor}
            unit={unit}
            currency={currency}
            lang={lang}
          />
        )}
      </main>

      {/* Footer Bar */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 px-4 sm:px-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>{t.appTitle}</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>{lang === 'ur' ? 'لکڑی، پلائی ووڈ و ایم ڈی ایف شیٹ کٹنگ کیلکولیٹر' : 'Woodworking & Sheet Cutting Estimator'}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <button
              onClick={() => setIsPresetModalOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              {t.presets}
            </button>
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              {t.loadProject}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onSelectPreset={handleSelectPreset}
        lang={lang}
      />

      <ProjectStorageModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        currentProject={project}
        onLoadProject={handleLoadProject}
        lang={lang}
      />
    </div>
  );
}
