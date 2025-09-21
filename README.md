# Live Spreadsheet by Piotr Lipski

## Run & Test
1. Clone repo, `npm i`, `npm run dev`
2. Open `localhost:...` pointed by vite (eg. http://localhost:5173/) in multiple browser tabs/windows—changes sync in real time.
3. You can enter any values into cells, but only valid numbers will be correctly evaluated.
4. Enter formulas like `=A1+B2*c1` (case insensitive). Cells cant evaluate if the point to themselfs.
5. Row with at least one negative value will flash red.

## Tech Decisions
- Formula parsing and calculation are performed in WebWorker. I used eval to calcuate the result.
- Use BroadcastChannel is used for syncing. Updates synchronize after a cell value is edited in one of the windows/tabs.

