import React, { useState } from 'react';

export default function App() {
  const [sheetLength, setSheetLength] = useState(96);
  const [sheetWidth, setSheetWidth] = useState(48);
  const [sheetCost, setSheetCost] = useState(5500);
  const [kerf, setKerf] = useState(0.125);

  const [cncRate, setCncRate] = useState(1500);
  const [cncHours, setCncHours] = useState(2);
  const [laborCost, setLaborCost] = useState(3000);

  const [parts, setParts] = useState([{ length: 0, width: 0, qty: 1 }]);
  const [results, setResults] = useState<any>(null);

  const handlePartChange = (index: number, field: string, value: number) => {
    const updated = [...parts];
    (updated[index] as any)[field] = value;
    setParts(updated);
  };

  const addPartRow = () => {
    s…
