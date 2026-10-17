interface Part {
  length: number;
  width: number;
  qty: number;
}

export default function App() {
  const [sheetLength, setSheetLength] = useState<number>(96);
  const [sheetWidth, setSheetWidth] = useState<number>(48);
  const [sheetCost, setSheetCost] = useState<number>(5500);
  const [kerf, setKerf] = useState<number>(0.125);

  const [cncRate, setCncRate] = useState<number>(1500);
  const [cncHours, setCncHours] = useState<number>(2);
  const [laborCost, setLaborCost] = useState<number>(3000);

  const [parts, setParts] = useState<Part[]>([{ length: 0, width: 0, qty: 1 }]);
  const [results, setResults] = useState<any>(null);

  const handlePartChange = (index: number, field: keyof Part, value: number) => {
    const updated = [...parts];
    updated[index][field] = value;
    setParts(updated);
  };

  const addPartRow = () => {
    setParts([...parts, { length: 0, width: 0, qty: 1 }]);
  };

  const calculateProject = () => {
    let totalPartArea = 0;
    parts.forEach((p) => {
      const l = p.length + kerf;
      const w = p.width + kerf;
      totalPartArea += l * w * p.qty;
    });

    const singleSheetArea = sheetLength * sheetWidth;
    if (singleSheetArea <= 0 || totalPartArea <= 0) {
      alert('براہ کرم تمام سائز اور تعداد صحیح درج کریں!');
      return;
    }

    const estimatedSheets = Math.ceil((totalPartArea * 1.15) / singleSheetArea);
    const totalSheetCost = estimatedSheets * sheetCost;
    const totalCncCost = cncRate * cncHours;
    const grandTotal = totalSheetCost + totalCncCost + laborCost;

    const wastePercent = (
      (((estimatedSheets * singleSheetArea) - totalPartArea) /
        (estimatedSheets * singleSheetArea)) *
      100
    ).toFixed(1);

    setResults({
      sheets: estimatedSheets,
      sheetCost: totalSheetCost,
      cncCost: totalCncCost,
      waste: wastePercent,
      totalCost: grandTotal,
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', fontFamily: 'sans-serif', direction: 'rtl' }}>
      <h1>🪚 فرنیچر اور CNC شیٹ کٹنگ اسمارٹ کیلکولیٹر</h1>
      <p>کم سے کم ویسٹیج اور درست کاسٹ کا سائنسی حساب</p>

      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
        <h3>1. شیٹ کا سائز اور قیمت</h3>
        <label>شیٹ کی لمبائی (انچ): </label>
        <input type="number" value={sheetLength} onChange={(e) => setSheetLength(Number(e.target.value))} /><br /><br />
        <label>شیٹ کی چوڑائی (انچ): </label>
        <input type="number" value={sheetWidth} onChange={(e) => setSheetWidth(Number(e.target.value))} /><br /><br />
        <label>ایک شیٹ کی قیمت (PKR): </label>
        <input type="number" value={sheetCost} onChange={(e) => setSheetCost(Number(e.target.value))} /><br /><br />
        <label>بلیڈ کٹ موٹائی / Kerf (انچ): </label>
        <input type="number" step="0.01" value={kerf} onChange={(e) => setKerf(Number(e.target.value))} />
      </div>

      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
        <h3>2. مطلوبہ ٹکڑوں کی تفصیل</h3>
        {parts.map((p, i) => (
          <div key={i} style={{ marginBottom: '10px' }}>
            <input type="number" placeholder="لمبائی" value={p.length || ''} onChange={(e) => handlePartChange(i, 'length', Number(e.target.value))} /> {' '}
            <input type="number" placeholder="چوڑائی" value={p.width || ''} onChange={(e) => handlePartChange(i, 'width', Number(e.target.value))} /> {' '}
            <input type="number" placeholder="تعداد" value={p.qty || ''} onChange={(e) => handlePartChange(i, 'qty', Number(e.target.value))} />
          </div>
        ))}
        <button onClick={addPartRow}>+ مزید ٹکڑا شامل کریں</button>
      </div>

      <div style={{ background: …
