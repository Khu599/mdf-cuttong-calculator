import { useState } from "react";

type Part = { length: number; width: number; qty: number };
type Placed = { x: number; y: number; w: number; h: number; id: number };
type Result = {
  sheets: Placed[][];
  wastePercent: number;
  error: string;
};

function packParts(
  parts: Part[],
  sheetLength: number,
  sheetWidth: number,
  kerf: number
): Result {
  const W = Math.max(sheetLength, sheetWidth);
  const H = Math.min(sheetLength, sheetWidth);

  const items: { id: number; a: number; b: number }[] = [];
  parts.forEach((p, i) => {
    if (p.length > 0 && p.width > 0) {
      for (let q = 0; q < p.qty; q++) {
        items.push({
          id: i + 1,
          a: Math.max(p.length, p.width),
          b: Math.min(p.length, p.width),
        });
      }…
