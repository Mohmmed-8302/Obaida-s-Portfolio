"use client";

import { useState, useCallback } from "react";
import { useDocFile } from "./useDocFile";
import EditorMenuBar from "./EditorMenuBar";
import SaveAsDialog from "./SaveAsDialog";

const COLS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const ROWS = 24;
const MENUS = ["File", "Edit", "View", "Insert", "Format", "Tools", "Data", "Help"];

const SEED: Record<string, string> = {
  A1: "Item", B1: "Qty", C1: "Price", D1: "Total",
  A2: "Showreel edit", B2: "3", C2: "120", D2: "=B2*C2",
  A3: "Logo animation", B3: "2", C3: "200", D3: "=B3*C3",
  A4: "Title sequence", B4: "1", C4: "450", D4: "=B4*C4",
  A6: "Grand total", D6: "=SUM(D2:D4)",
};

function cellNumeric(ref: string, cells: Record<string, string>, seen: Set<string>): number {
  if (seen.has(ref)) return NaN; // cycle guard
  const raw = (cells[ref] ?? "").trim();
  if (raw === "") return 0;
  if (raw.startsWith("=")) {
    const next = new Set(seen); next.add(ref);
    return evalFormula(raw.slice(1), cells, next);
  }
  const n = parseFloat(raw);
  return raw !== "" && !isNaN(n) && /^-?\d*\.?\d+$/.test(raw) ? n : NaN;
}

function evalFormula(expr: string, cells: Record<string, string>, seen: Set<string>): number {
  let bad = false;
  // SUM / AVERAGE over a rectangular range
  expr = expr.replace(/\b(SUM|AVERAGE)\(([A-J])(\d+):([A-J])(\d+)\)/gi, (_m, fn, c1, r1, c2, r2) => {
    const ci1 = COLS.indexOf(c1.toUpperCase()), ci2 = COLS.indexOf(c2.toUpperCase());
    const ra = Math.min(+r1, +r2), rb = Math.max(+r1, +r2);
    const ca = Math.min(ci1, ci2), cb = Math.max(ci1, ci2);
    const vals: number[] = [];
    for (let c = ca; c <= cb; c++) for (let r = ra; r <= rb; r++) {
      const v = cellNumeric(`${COLS[c]}${r}`, cells, seen);
      if (!isNaN(v)) vals.push(v);
    }
    const sum = vals.reduce((a, b) => a + b, 0);
    return String(fn.toUpperCase() === "AVERAGE" ? (vals.length ? sum / vals.length : 0) : sum);
  });
  // single cell references
  expr = expr.replace(/([A-J])(\d+)/gi, (m) => {
    const v = cellNumeric(m.toUpperCase(), cells, seen);
    if (isNaN(v)) { bad = true; return "0"; }
    return String(v);
  });
  if (bad) return NaN;
  if (/[^0-9+\-*/(). ]/.test(expr)) return NaN;
  try {
    // eslint-disable-next-line no-new-func
    const r = Function(`"use strict";return (${expr})`)();
    return typeof r === "number" && isFinite(r) ? r : NaN;
  } catch {
    return NaN;
  }
}

function display(ref: string, cells: Record<string, string>): string {
  const raw = cells[ref] ?? "";
  if (!raw.startsWith("=")) return raw;
  const v = evalFormula(raw.slice(1), cells, new Set([ref]));
  if (isNaN(v)) return "#ERROR";
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}

export default function Excel() {
  const [cells, setCells] = useState<Record<string, string>>(SEED);
  const [active, setActive] = useState("A1");

  const doc = useDocFile({
    docType: "excel",
    defaultContent: JSON.stringify(SEED),
    untitled: "Book1",
    applyContent: (c) => { try { setCells(JSON.parse(c) || {}); } catch { setCells({}); } },
    getContent: () => JSON.stringify(cells),
  });

  const setActiveValue = useCallback((val: string) => {
    setCells((c) => ({ ...c, [active]: val }));
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); doc.requestSave(); }
  };

  const move = useCallback((dr: number, dc: number) => {
    const col = COLS.indexOf(active[0]);
    const row = parseInt(active.slice(1), 10);
    const nc = Math.max(0, Math.min(COLS.length - 1, col + dc));
    const nr = Math.max(1, Math.min(ROWS, row + dr));
    setActive(`${COLS[nc]}${nr}`);
  }, [active]);

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#fff", fontFamily: "Tahoma, 'Segoe UI', sans-serif" }} onKeyDown={onKeyDown}>
      {/* Menu bar */}
      <EditorMenuBar menus={MENUS} onNew={doc.onNew} onSave={doc.requestSave} onSaveAs={doc.onSaveAs} />

      {/* Formula bar */}
      <div className="flex items-center gap-1 shrink-0" style={{ height: 24, padding: "0 4px", background: "#f3f1e7", borderBottom: "1px solid #cfc9b4" }}>
        <button title="Save" onClick={doc.requestSave} style={{ width: 22, height: 18, fontSize: 13, border: "1px solid #b8b29c", borderRadius: 3, background: "linear-gradient(to bottom,#fff,#e7e2d2)", cursor: "pointer" }}>💾</button>
        <div className="flex items-center justify-center" style={{ width: 46, height: 18, background: "#fff", border: "1px solid #9a958a", fontSize: 11, fontWeight: 700, color: "#1d7045" }}>{active}</div>
        <span style={{ color: "#1d7045", fontStyle: "italic", fontWeight: 700, padding: "0 4px" }}>fx</span>
        <input
          value={cells[active] ?? ""}
          onChange={(e) => setActiveValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") move(1, 0); }}
          className="flex-1"
          style={{ height: 18, border: "1px solid #9a958a", fontSize: 12, padding: "0 4px", outline: "none" }}
        />
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto" style={{ background: "#fff" }}>
        <table style={{ borderCollapse: "collapse", tableLayout: "fixed", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ ...hdr, width: 30, left: 0, position: "sticky", zIndex: 3 }} />
              {COLS.map((c) => (
                <th key={c} style={{ ...hdr, width: 70, background: active[0] === c ? "#b6caec" : hdr.background }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, i) => i + 1).map((r) => (
              <tr key={r}>
                <td style={{ ...rowHdr, background: +active.slice(1) === r ? "#b6caec" : rowHdr.background }}>{r}</td>
                {COLS.map((c) => {
                  const ref = `${c}${r}`;
                  const isActive = ref === active;
                  return (
                    <td
                      key={ref}
                      onClick={() => setActive(ref)}
                      style={{
                        border: "1px solid #d4d0c0", height: 19, padding: 0,
                        outline: isActive ? "2px solid #217346" : "none", outlineOffset: -2,
                        background: "#fff",
                      }}
                    >
                      {isActive ? (
                        <input
                          autoFocus
                          value={cells[ref] ?? ""}
                          onChange={(e) => setCells((cc) => ({ ...cc, [ref]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); move(1, 0); }
                            else if (e.key === "Tab") { e.preventDefault(); move(0, 1); }
                          }}
                          style={{ width: "100%", height: 17, border: "none", outline: "none", fontSize: 12, padding: "0 3px", background: "transparent" }}
                        />
                      ) : (
                        <div className="truncate" style={{ padding: "0 3px", lineHeight: "19px", color: "#000", textAlign: /^-?\d/.test(display(ref, cells)) ? "right" : "left" }}>
                          {display(ref, cells)}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet tab + status */}
      <div className="shrink-0 flex items-center gap-2" style={{ height: 20, padding: "0 8px", background: "#ece9d8", borderTop: "1px solid #d6d2c2", fontSize: 11, color: "#444" }}>
        <span style={{ padding: "1px 10px", background: "#fff", border: "1px solid #b8b29c", borderBottom: "none", fontWeight: 700 }}>Sheet1</span>
        <span style={{ opacity: 0.7 }}>Sheet2</span>
        <span style={{ opacity: 0.7 }}>Sheet3</span>
        <span className="ml-auto" style={{ opacity: 0.7 }}>Ready</span>
      </div>

      {doc.saveAsOpen && <SaveAsDialog initialName={doc.suggestedName.endsWith(".xls") ? doc.suggestedName : `${doc.suggestedName}.xls`} onSave={doc.commitSaveAs} onClose={doc.closeSaveAs} />}
    </div>
  );
}

const hdr: React.CSSProperties = {
  border: "1px solid #b8b29c", background: "linear-gradient(to bottom,#fbfbf8,#dfdbc9)",
  height: 18, fontSize: 11, fontWeight: 400, color: "#333", textAlign: "center", position: "sticky", top: 0, zIndex: 2,
};
const rowHdr: React.CSSProperties = {
  border: "1px solid #b8b29c", background: "linear-gradient(to right,#fbfbf8,#dfdbc9)",
  width: 30, fontSize: 11, color: "#333", textAlign: "center", position: "sticky", left: 0, zIndex: 1,
};
