import { AgGridReact } from 'ag-grid-react';
import './App.css'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { RowNumbersModule, CellSelectionModule } from 'ag-grid-enterprise';
import { useState } from 'react';

ModuleRegistry.registerModules([AllCommunityModule, RowNumbersModule, CellSelectionModule]);

const cols = ["A", "B", "C"];
const rows = [1, 2, 3];

function makeEmptySheet() {
  const sheet: Record<string, string> = {};
  cols.forEach(
    c => rows.forEach(
      r => (
        sheet[`${c}${r}`] = "test")
    )
  );
  return sheet;
}

function App() {
  const [sheet, setSheet] = useState<Record<string, string>>(makeEmptySheet());

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
        />
      </div>
    </>
  )
}

export default App
