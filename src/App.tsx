import { AgGridReact } from 'ag-grid-react';
import './App.css'
import { ModuleRegistry, AllCommunityModule, type CellValueChangedEvent } from 'ag-grid-community';
import { RowNumbersModule, CellSelectionModule } from 'ag-grid-enterprise';
import { useEffect, useState } from 'react';

ModuleRegistry.registerModules([AllCommunityModule, RowNumbersModule, CellSelectionModule]);

const cols = ["A", "B", "C"];
const rows = [1, 2, 3, 4, 5];

function makeEmptySheet() {
  const sheet: Record<string, string> = {};
  cols.forEach(
    c => rows.forEach(
      r => (
        sheet[`${c}${r}`] = "")
    )
  );
  return sheet;
}

const worker = new Worker(new URL('./SpreadsheetWorker', import.meta.url), { type: 'module' });

function App() {
  const [sheet, setSheet] = useState<Record<string, string>>(makeEmptySheet());
  const [computed, setComputed] = useState<Record<string, number>>({});
  const [flashRows, setFlashRows] = useState<Record<number, boolean>>({});

  useEffect(() => {
    worker.onmessage = (e) => setComputed(e.data.computed);
    worker.postMessage({ sheet });
  }, [sheet]);

  useEffect(() => {
    rows.forEach((row) => {
      if (cols.some(col => computed[`${col}${row}`] < 0)) {
        setFlashRows(fr => ({ ...fr, [row]: true }));
        setTimeout(() => setFlashRows(fr => ({ ...fr, [row]: false })), 500);
      }
    });
  }, [computed]);

  function onCellChange(params: CellValueChangedEvent) {
    console.log('onCellChange', params);
    setSheet(s => {
      const key = `${params.colDef.field}${(params.rowIndex ?? 0) + 1}`;
      const next = { ...s, [key]: params.newValue };
      return next;
    });
  }

  type RowData = { id: number } & Record<string, string | number | undefined>;

  const rowData: RowData[] = rows.map(row => {
    const obj: RowData = { id: row };
    cols.forEach(col => {
      obj[col] = computed[`${col}${row}`] ?? sheet[`${col}${row}`];
    });
    return obj;
  });

  const columnDefs = cols.map(col => ({
    field: col,
    width: 90,
    editable: true,
    cellDataType: false,
  }));

  return (
    <>
      <div className="wrapper">
        <h1>Live Spreadsheet</h1>
        <AgGridReact
          rowNumbers
          singleClickEdit
          rowData={rowData}
          columnDefs={columnDefs}
          onCellValueChanged={onCellChange}
          getRowClass={(params) => {
            const id = params?.data?.id;
            return id !== undefined && flashRows[id] ? "flash-row" : "";
          }}
        />
      </div>
    </>
  )
}

export default App
