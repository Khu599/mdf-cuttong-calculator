import React, { useState } from "react";

// ٹائپس کی تعریف (TypeScript Types)
type Part = {
  id: number;
  length: number;
  width: number;
  qty: number;
};

type Sheet = {
  length: number;
  width: number;
  kerf: number;
};

export default function App() {
  // شیٹ کا سائز (MDF Sheet Default Size: 2440mm x 1220mm)
  const [sheet, setSheet] = useState<Sheet>({
    length: 2440,
    width: 1220,
    kerf: 4, // بلیڈ کی کٹائی (Kerf)
  });

  // پارٹس کی لسٹ (MDF Parts List)
  const [parts, setParts] = useState<Part[]>([
    { id: 1, length: 1800, width: 900, qty: 1 }, // مثال: بیڈ بیس (Bed Base)
  ]);

  // پارٹ کی ویلیو تبدیل کرنے کا درست طریقہ
  const handlePartChange = (index: number, field: keyof Part, value: number) => {
    const updated = [...parts…
