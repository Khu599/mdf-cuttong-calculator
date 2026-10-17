const [parts, setParts] = useState([{ length: 0, width: 0, qty: 1 }]);
  const [results, setResults] = useState(null);

  // حصوں (Parts) کی ویلیو تبدیل کرنے کا درست طریقہ
  const handlePartChange = (index, field, value) => {
    const updated = [...parts];
    updated[index] = { ...updated[index], [field]: Number(value) };
    setParts(updated);
  };

  // نئی قطار (Row) شامل کرنے کا فنکشن
  const addPartRow = () => {
    setParts([...parts, { length: 0, width: 0, qty: 1 }]);
  };

  // کسی قطار کو ڈیلیٹ کرنے کا فنکشن
  const removePartRow = (index) => {
    const updated = parts.filter((_, i) => i !== index);
    setParts(updated);
  };
