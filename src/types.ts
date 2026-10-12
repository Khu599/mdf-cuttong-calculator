export type DimensionUnit = 'in' | 'ft' | 'mm';
export type CurrencyCode = 'PKR' | 'INR' | 'USD' | 'AED' | 'SAR';
export type Language = 'ur' | 'en';

export interface SheetMaterial {
  id: string;
  nameUrdu: string;
  nameEn: string;
  category: 'mdf' | 'plywood' | 'lasani' | 'uv_high_gloss' | 'acrylic' | 'chipboard' | 'veneer' | 'solid_wood';
  sheetLength: number; // in current unit (e.g., 96 in for 8ft)
  sheetWidth: number;  // in current unit (e.g., 48 in for 4ft)
  thickness: string;   // e.g. "16mm", "18mm", "12mm"
  pricePerSheet: number;
  sawKerf: number;     // saw blade allowance, e.g. 0.125 in (3mm)
  trimMargin: number;  // edge cleanup border, e.g. 0.5 in (12mm)
}

export interface EdgeBandingSettings {
  enabled: boolean;
  tapeRatePerUnitLength: number; // cost per foot / meter
  laborRatePerUnitLength: number; // pasting / pressing labor
  tapeThickness: string; // e.g. "1mm", "2mm"
  unitLength: 'ft' | 'm';
}

export interface CutPiece {
  id: string;
  name: string;
  length: number;
  width: number;
  quantity: number;
  allowRotation: boolean; // false if wood grain / texture must stay aligned
  edgeBanding: {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  };
  notes?: string;
  color?: string;
}

export interface PlacedPiece {
  pieceId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  rotated: boolean;
  color: string;
  edgeBanding: {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  };
}

export interface SheetLayout {
  sheetIndex: number;
  width: number;
  height: number;
  placedPieces: PlacedPiece[];
  usedArea: number;
  wasteArea: number;
  utilizationRate: number; // percentage
  offcuts: {
    x: number;
    y: number;
    width: number;
    height: number;
    area: number;
    isUsable: boolean;
  }[];
}

export interface OptimizationResult {
  totalSheetsRequired: number;
  sheets: SheetLayout[];
  totalPartsCount: number;
  unplacedCount: number;
  unplacedPieces: { piece: CutPiece; count: number }[];
  totalPartsArea: number;
  totalSheetsArea: number;
  totalWasteArea: number;
  overallEfficiency: number; // %
  totalLinearCutLength: number;
  totalEdgeBandingLength: number; // in current linear unit
}

export interface HardwareItem {
  id: string;
  nameUrdu: string;
  nameEn: string;
  category: 'hinges' | 'channels' | 'handles' | 'screws' | 'adhesive' | 'locks' | 'legs' | 'other';
  quantity: number;
  unit: string; // "عدد" / "pcs", "جوڑی" / "pair", "ڈبہ" / "box"
  unitPrice: number;
}

export interface LaborAndExtraCosts {
  cuttingCostPerSheet: number;
  carpentryLaborType: 'fixed' | 'per_sqft' | 'percent_material';
  carpentryLaborValue: number;
  polishingCostPerSqft: number;
  polishingAreaSqft: number;
  transportationCost: number;
  miscHardwareCost: number;
  profitMarginPercent: number;
  taxOrDiscountPercent: number; // positive for tax, negative for discount
  advancePaid: number;
}

export interface ProjectData {
  id: string;
  title: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  date: string;
  unit: DimensionUnit;
  currency: CurrencyCode;
  material: SheetMaterial;
  edgeBanding: EdgeBandingSettings;
  pieces: CutPiece[];
  hardware: HardwareItem[];
  laborAndExtras: LaborAndExtraCosts;
  notes: string;
}
