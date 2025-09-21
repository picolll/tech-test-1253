import { AgGridReact } from 'ag-grid-react';
import './App.css'
import { ModuleRegistry, AllCommunityModule, type CellValueChangedEvent } from 'ag-grid-community';
import { RowNumbersModule, CellSelectionModule } from 'ag-grid-enterprise';
import { useState } from 'react';

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

function App() {
  const [sheet, setSheet] = useState<Record<string, string>>(makeEmptySheet());

  function onCellChange(params: CellValueChangedEvent) {
    console.log('onCellChange', params);
    setSheet(s => {
      const key = `${params.colDef.field}${(params.rowIndex ?? 0) + 1}`;
      const next = { ...s, [key]: params.newValue };
      return next;
    });
  }

  type RowData = { id: number } & Record<string, string | number | undefined>;

  const rowData: RowData[] = rows.map(r => {
    const obj: RowData = { id: r };
    cols.forEach(c => {
      obj[c] = sheet[`${c}${r}`];
    });
    return obj;
  });

  const columnDefs = cols.map(c => ({
    field: c,
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
        />
      </div>
    </>
  )
}

export default App
