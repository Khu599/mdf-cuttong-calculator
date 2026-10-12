import { CutPiece, DimensionUnit, OptimizationResult, PlacedPiece, SheetLayout, SheetMaterial } from '../types';

interface FreeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PIECE_COLORS = [
  '#38bdf8', // sky
  '#f59e0b', // amber
  '#10b981', // emerald
  '#a855f7', // purple
  '#ec4899', // pink
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#eab308', // yellow
  '#d946ef', // fuchsia
];

export function convertToInches(val: number, unit: DimensionUnit): number {
  if (unit === 'ft') return val * 12;
  if (unit === 'mm') return val / 25.4;
  return val; // in
}

export function convertFromInches(val: number, unit: DimensionUnit): number {
  if (unit === 'ft') return val / 12;
  if (unit === 'mm') return val * 25.4;
  return val;
}

export function optimizeCuttingStock(
  material: SheetMaterial,
  pieces: CutPiece[],
  unit: DimensionUnit
): OptimizationResult {
  // Convert everything to a standard internal unit (inches) for consistent packing math
  const rawSheetL = convertToInches(material.sheetLength, unit);
  const rawSheetW = convertToInches(material.sheetWidth, unit);
  const sawKerf = convertToInches(material.sawKerf, unit);
  const trimMargin = convertToInches(material.trimMargin, unit);

  const usableL = Math.max(0, rawSheetL - trimMargin * 2);
  const usableW = Math.max(0, rawSheetW - trimMargin * 2);

  if (usableL <= 0 || usableW <= 0 || pieces.length === 0) {
    return {
      totalSheetsRequired: 0,
      sheets: [],
      totalPartsCount: 0,
      unplacedCount: 0,
      unplacedPieces: [],
      totalPartsArea: 0,
      totalSheetsArea: 0,
      totalWasteArea: 0,
      overallEfficiency: 0,
      totalLinearCutLength: 0,
      totalEdgeBandingLength: 0,
    };
  }

  // Expand pieces by quantity and assign distinct colors
  interface ItemToPlace {
    pieceId: string;
    name: string;
    length: number; // in inches
    width: number;  // in inches
    originalLength: number; // in user unit
    originalWidth: number;  // in user unit
    allowRotation: boolean;
    edgeBanding: CutPiece['edgeBanding'];
    color: string;
  }

  const items: ItemToPlace[] = [];
  let totalEdgeBandingInches = 0;
  let totalPartsCount = 0;
  let totalPartsAreaInches = 0;

  pieces.forEach((p, idx) => {
    const itemColor = p.color || PIECE_COLORS[idx % PIECE_COLORS.length];
    const lenIn = convertToInches(p.length, unit);
    const widIn = convertToInches(p.width, unit);

    if (lenIn <= 0 || widIn <= 0 || p.quantity <= 0) return;

    // Calculate edge banding for this piece
    const edgeLengthPerPiece =
      (p.edgeBanding.top ? widIn : 0) +
      (p.edgeBanding.bottom ? widIn : 0) +
      (p.edgeBanding.left ? lenIn : 0) +
      (p.edgeBanding.right ? lenIn : 0);

    totalEdgeBandingInches += edgeLengthPerPiece * p.quantity;
    totalPartsAreaInches += lenIn * widIn * p.quantity;
    totalPartsCount += p.quantity;

    for (let q = 0; q < p.quantity; q++) {
      items.push({
        pieceId: p.id,
        name: p.name || `Piece ${idx + 1}`,
        length: lenIn,
        width: widIn,
        originalLength: p.length,
        originalWidth: p.width,
        allowRotation: p.allowRotation,
        edgeBanding: p.edgeBanding,
        color: itemColor,
      });
    }
  });

  // Sort items descending by max dimension, then area (Best-Fit Decreasing heuristic)
  items.sort((a, b) => {
    const maxA = Math.max(a.length, a.width);
    const maxB = Math.max(b.length, b.width);
    if (maxB !== maxA) return maxB - maxA;
    return b.length * b.width - a.length * a.width;
  });

  const sheets: SheetLayout[] = [];
  const unplacedItems: ItemToPlace[] = [];
  let totalLinearCutInches = 0;

  // Function to create a fresh sheet
  function createNewSheet(sheetIdx: number): { sheet: SheetLayout; freeRects: FreeRect[] } {
    const sheet: SheetLayout = {
      sheetIndex: sheetIdx,
      width: material.sheetWidth,
      height: material.sheetLength,
      placedPieces: [],
      usedArea: 0,
      wasteArea: 0,
      utilizationRate: 0,
      offcuts: [],
    };
    // Starting free rect is the usable area inside the trim margin
    const freeRects: FreeRect[] = [
      {
        x: trimMargin,
        y: trimMargin,
        width: usableW,
        height: usableL,
      },
    ];
    return { sheet, freeRects };
  }

  // Pack items using Guillotine Best Area Fit heuristic
  let currentSheetData = createNewSheet(1);

  for (const item of items) {
    let placed = false;

    // Try to fit into current active sheet, or if full, try previous sheets that may have remnant holes
    const allSheetContexts = [...sheets.map((s, idx) => ({ sheet: s, index: idx })), { sheet: currentSheetData.sheet, index: sheets.length }];

    // We search current sheet first
    let candidateSheet = currentSheetData.sheet;
    let candidateFreeRects = currentSheetData.freeRects;

    let bestRectIdx = -1;
    let bestRotated = false;
    let minWastedArea = Infinity;

    // Check orientations
    for (let i = 0; i < candidateFreeRects.length; i++) {
      const fr = candidateFreeRects[i];

      // Orientation 1: as-is (width = item.width, height = item.length)
      if (item.width <= fr.width && item.length <= fr.height) {
        const waste = fr.width * fr.height - item.width * item.length;
        if (waste < minWastedArea) {
          minWastedArea = waste;
          bestRectIdx = i;
          bestRotated = false;
        }
      }

      // Orientation 2: rotated 90 deg (if allowed)
      if (item.allowRotation && item.length <= fr.width && item.width <= fr.height) {
        const waste = fr.width * fr.height - item.length * item.width;
        if (waste < minWastedArea) {
          minWastedArea = waste;
          bestRectIdx = i;
          bestRotated = true;
        }
      }
    }

    if (bestRectIdx !== -1) {
      // Place into current active sheet
      const targetRect = candidateFreeRects[bestRectIdx];
      candidateFreeRects.splice(bestRectIdx, 1);

      const placedW = bestRotated ? item.length : item.width;
      const placedH = bestRotated ? item.width : item.length;

      // User unit coordinates for visual display
      const placedPiece: PlacedPiece = {
        pieceId: item.pieceId,
        name: item.name,
        x: convertFromInches(targetRect.x, unit),
        y: convertFromInches(targetRect.y, unit),
        width: convertFromInches(placedW, unit),
        height: convertFromInches(placedH, unit),
        originalWidth: item.originalWidth,
        originalHeight: item.originalLength,
        rotated: bestRotated,
        color: item.color,
        edgeBanding: item.edgeBanding,
      };

      candidateSheet.placedPieces.push(placedPiece);
      totalLinearCutInches += placedW + placedH; // saw passes

      // Guillotine split of remaining free space:
      // Space 1: to the right of placed piece
      // Space 2: below the placed piece
      const remW = targetRect.width - placedW - sawKerf;
      const remH = targetRect.height - placedH - sawKerf;

      if (remW > 0 && placedH > 0) {
        candidateFreeRects.push({
          x: targetRect.x + placedW + sawKerf,
          y: targetRect.y,
          width: remW,
          height: placedH,
        });
      }

      if (targetRect.width > 0 && remH > 0) {
        candidateFreeRects.push({
          x: targetRect.x,
          y: targetRect.y + placedH + sawKerf,
          width: targetRect.width,
          height: remH,
        });
      }

      placed = true;
    } else {
      // Piece doesn't fit in current sheet, save current sheet and open a new one
      if (candidateSheet.placedPieces.length > 0) {
        sheets.push(candidateSheet);
      }
      currentSheetData = createNewSheet(sheets.length + 1);

      // Try placing in new sheet
      const fr = currentSheetData.freeRects[0];
      const fitsNormal = item.width <= fr.width && item.length <= fr.height;
      const fitsRotated = item.allowRotation && item.length <= fr.width && item.width <= fr.height;

      if (fitsNormal || fitsRotated) {
        const rotate = !fitsNormal && fitsRotated;
        const placedW = rotate ? item.length : item.width;
        const placedH = rotate ? item.width : item.length;

        currentSheetData.freeRects.splice(0, 1);

        currentSheetData.sheet.placedPieces.push({
          pieceId: item.pieceId,
          name: item.name,
          x: convertFromInches(fr.x, unit),
          y: convertFromInches(fr.y, unit),
          width: convertFromInches(placedW, unit),
          height: convertFromInches(placedH, unit),
          originalWidth: item.originalWidth,
          originalHeight: item.originalLength,
          rotated: rotate,
          color: item.color,
          edgeBanding: item.edgeBanding,
        });

        totalLinearCutInches += placedW + placedH;

        const remW = fr.width - placedW - sawKerf;
        const remH = fr.height - placedH - sawKerf;

        if (remW > 0) {
          currentSheetData.freeRects.push({
            x: fr.x + placedW + sawKerf,
            y: fr.y,
            width: remW,
            height: placedH,
          });
        }
        if (remH > 0) {
          currentSheetData.freeRects.push({
            x: fr.x,
            y: fr.y + placedH + sawKerf,
            width: fr.width,
            height: remH,
          });
        }
        placed = true;
      } else {
        // Doesn't even fit on a fresh blank sheet (larger than sheet size!)
        unplacedItems.push(item);
      }
    }
  }

  // Push last sheet if it has pieces
  if (currentSheetData.sheet.placedPieces.length > 0 && !sheets.includes(currentSheetData.sheet)) {
    sheets.push(currentSheetData.sheet);
  }

  // Calculate offcuts and stats for each sheet
  const rawSheetAreaInches = rawSheetL * rawSheetW;
  const rawSheetAreaUserUnit = material.sheetLength * material.sheetWidth;

  sheets.forEach((sheet, idx) => {
    let sheetPlacedAreaInches = 0;
    sheet.placedPieces.forEach((p) => {
      const pWin = convertToInches(p.width, unit);
      const pHin = convertToInches(p.height, unit);
      sheetPlacedAreaInches += pWin * pHin;
    });

    const usedAreaUser = convertFromInches(Math.sqrt(sheetPlacedAreaInches), unit) ** 2;
    sheet.usedArea = Number(usedAreaUser.toFixed(2));
    sheet.wasteArea = Number(Math.max(0, rawSheetAreaUserUnit - usedAreaUser).toFixed(2));
    sheet.utilizationRate = Number(((sheetPlacedAreaInches / rawSheetAreaInches) * 100).toFixed(1));

    // Calculate offcuts from remaining free rectangles
    // Free rects from current sheet or estimated
    // An offcut is "usable" if both dimensions >= 10 inches and area >= 144 sq in (1 sq ft)
    const minUsableSideIn = 10;
    const minUsableAreaIn = 144;

    // Approximate major offcut space
    const offcuts = [];
    if (sheet.placedPieces.length > 0) {
      const maxX = Math.max(...sheet.placedPieces.map((p) => convertToInches(p.x + p.width, unit)));
      const maxY = Math.max(...sheet.placedPieces.map((p) => convertToInches(p.y + p.height, unit)));

      const remRightW = rawSheetW - maxX - trimMargin;
      if (remRightW > 2) {
        const areaIn = remRightW * rawSheetL;
        offcuts.push({
          x: convertFromInches(maxX, unit),
          y: 0,
          width: convertFromInches(remRightW, unit),
          height: convertFromInches(rawSheetL, unit),
          area: convertFromInches(Math.sqrt(areaIn), unit) ** 2,
          isUsable: remRightW >= minUsableSideIn && areaIn >= minUsableAreaIn,
        });
      }

      const remBottomH = rawSheetL - maxY - trimMargin;
      if (remBottomH > 2) {
        const areaIn = maxX * remBottomH;
        offcuts.push({
          x: 0,
          y: convertFromInches(maxY, unit),
          width: convertFromInches(maxX, unit),
          height: convertFromInches(remBottomH, unit),
          area: convertFromInches(Math.sqrt(areaIn), unit) ** 2,
          isUsable: remBottomH >= minUsableSideIn && areaIn >= minUsableAreaIn,
        });
      }
    }
    sheet.offcuts = offcuts;
  });

  const totalSheetsRequired = sheets.length;
  const totalSheetsArea = totalSheetsRequired * rawSheetAreaUserUnit;
  const totalPartsArea = convertFromInches(Math.sqrt(totalPartsAreaInches), unit) ** 2;
  const totalWasteArea = Math.max(0, totalSheetsArea - totalPartsArea);
  const overallEfficiency = totalSheetsArea > 0 ? (totalPartsArea / totalSheetsArea) * 100 : 0;

  // Aggregate unplaced
  const unplacedMap = new Map<string, { piece: CutPiece; count: number }>();
  unplacedItems.forEach((u) => {
    const orig = pieces.find((p) => p.id === u.pieceId);
    if (orig) {
      const existing = unplacedMap.get(orig.id) || { piece: orig, count: 0 };
      existing.count += 1;
      unplacedMap.set(orig.id, existing);
    }
  });

  return {
    totalSheetsRequired,
    sheets,
    totalPartsCount,
    unplacedCount: unplacedItems.length,
    unplacedPieces: Array.from(unplacedMap.values()),
    totalPartsArea: Number(totalPartsArea.toFixed(2)),
    totalSheetsArea: Number(totalSheetsArea.toFixed(2)),
    totalWasteArea: Number(totalWasteArea.toFixed(2)),
    overallEfficiency: Number(overallEfficiency.toFixed(1)),
    totalLinearCutLength: Number(convertFromInches(totalLinearCutInches, unit).toFixed(1)),
    totalEdgeBandingLength: Number(convertFromInches(totalEdgeBandingInches, unit).toFixed(1)),
  };
}
