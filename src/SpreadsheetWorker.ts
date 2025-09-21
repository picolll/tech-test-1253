self.onmessage = (e) => {
  const { sheet } = e.data;
  const computed: Record<string, number> = {};

  function calculate(str: string): number {
    if (!str.toString().startsWith('=')) return Number(str) || 0;
    else {
      const expr = str.substring(1)
      return eval(expr);
    }
  }
  for (const cell in sheet) {
    computed[cell] = calculate(sheet[cell]);
  }
  console.log('Computed:', computed);
  self.postMessage({ computed });
};
