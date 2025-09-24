
type Sheet = Record<string, string>;
type Computed = Record<string, number>;

self.onmessage = (e) => {
  const sheet = e.data.sheet as Sheet;
  const computed: Computed = {};
  const visiting: Set<string> = new Set();

  function evalCell(cell: string): number {
    if (computed[cell] !== undefined) return computed[cell];
    if (visiting.has(cell)) {
      computed[cell] = NaN;
      return NaN;
    }
    visiting.add(cell);

    const str = sheet[cell] ?? '';
    if (!str.startsWith('=')) {
      const val = Number(str);
      computed[cell] = isNaN(val) ? 0 : val;
      visiting.delete(cell);
      return computed[cell];
    }

    const expr = str
      .substring(1)
      .replace(/([A-Za-z]+\d+)/gi, (ref) => {
        const value = evalCell(ref.toUpperCase());
        return String(isNaN(value) ? 0 : value);
      });

    let result: number;
    try {
      result = eval(expr);
    } catch {
      result = NaN;
    }
    computed[cell] = result;
    visiting.delete(cell);
    return result;
  }
  for (const cell in sheet) {
    evalCell(cell);
  }
  self.postMessage({ computed });
};
