import { AgGridReact } from 'ag-grid-react';
import './App.css'
import { ModuleRegistry, AllCommunityModule, type CellValueChangedEvent, type ValueGetterParams } from 'ag-grid-community';
import { RowNumbersModule, CellSelectionModule } from 'ag-grid-enterprise';
import {  useCallback, useEffect, useMemo, useState } from 'react';
import { useSpreadsheetSync } from './useSpreadsheetSync';

ModuleRegistry.registerModules([AllCommunityModule, RowNumbersModule, CellSelectionModule]);

const cols = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function makeEmptySheet() {
  const sheet: Record<string, string> = {};
  cols.forEach(
    col => rows.forEach(
      row => (
        sheet[`${col}${row}`] = "")
    )
  );
  return sheet;
}

const worker = new Worker(new URL('./SpreadsheetWorker', import.meta.url), { type: 'module' });

function App() {
  const [sheet, setSheet] = useState<Record<string, string>>(makeEmptySheet());
  const [computed, setComputed] = useState<Record<string, number>>({});
  const [flashRows, setFlashRows] = useState<Record<number, boolean>>({});
  const { broadcast } = useSpreadsheetSync((s) => setSheet(s));

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

  const onCellChange = useCallback((params: CellValueChangedEvent) => {
    setSheet(s => {
      const key = `${params.colDef.field}${(params.rowIndex ?? 0) + 1}`;
      const next = { ...s, [key]: params.newValue };
      broadcast(next);
      return next;
    });
  }, [broadcast]);

  type RowData = { id: number } & Record<string, string | number | undefined>;

  const rowData: RowData[] = useMemo(() => rows.map(row => {
    const obj: RowData = { id: row };
    cols.forEach(col => {
      obj[col] = computed[`${col}${row}`] ?? sheet[`${col}${row}`];
    });
    return obj;
  }), [sheet, computed]);

  const columnDefs = useMemo(() => cols.map(col => ({
    field: col,
    width: 90,
    editable: true,
    sortable: false,
    filter: false,
    cellDataType: false,
    valueGetter: (params: ValueGetterParams) => {
      return sheet[`${col}${params.data.id}`] !== undefined
        ? sheet[`${col}${params.data.id}`]
        : computed[`${col}${params.data.id}`]
    },
 
    cellRenderer: (params: ValueGetterParams) => {
      return computed[`${col}${params.data.id}`]
        ? computed[`${col}${params.data.id}`]
        : sheet[`${col}${params.data.id}`]
    },
  })), [sheet, computed]);

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
