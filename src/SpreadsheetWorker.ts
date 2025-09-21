self.onmessage = (e) => {
  const { sheet } = e.data;
  const computed: Record<string, number> = {};
  function calculate(str: string): number {
    if (!str.toString().startsWith('=')) return Number(str) || 0;
    const expr = str
      .substring(1)
      .replace(/([A-Za-z]+\d+)/g, (ref) => String(computed[ref.toUpperCase()] ?? sheet[ref.toUpperCase()]));
    try {
      return eval(expr);
    } catch {
      return NaN;
    }
  }
  for (const cell in sheet) {
    computed[cell] = calculate(sheet[cell]);
  }
  self.postMessage({ computed });
};
