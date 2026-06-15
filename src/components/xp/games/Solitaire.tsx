"use client";

import { useState, useCallback, useEffect, useRef } from "react";

type Suit = "♠" | "♥" | "♦" | "♣";
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const isRed = (s: Suit) => s === "♥" || s === "♦";

interface Card { id: string; suit: Suit; rank: number; faceUp: boolean; } // rank 1..13
interface Piles { stock: Card[]; waste: Card[]; foundations: Card[][]; tableau: Card[][]; }
type Source = { type: "waste" } | { type: "foundation"; i: number } | { type: "tableau"; i: number };

const CARD_W = 62, CARD_H = 88, FAN_UP = 24, FAN_DOWN = 9;

function freshDeck(): Card[] {
  const d: Card[] = [];
  for (const s of SUITS) for (let r = 1; r <= 13; r++) d.push({ id: `${s}${r}`, suit: s, rank: r, faceUp: false });
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
  return d;
}
function deal(): Piles {
  const deck = freshDeck();
  const tableau: Card[][] = Array.from({ length: 7 }, () => []);
  for (let col = 0; col < 7; col++) for (let n = 0; n <= col; n++) { const card = deck.pop()!; card.faceUp = n === col; tableau[col].push(card); }
  return { stock: deck, waste: [], foundations: [[], [], [], []], tableau };
}

export default function Solitaire() {
  const [piles, setPiles] = useState<Piles>(deal);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [drag, setDrag] = useState<{ cards: Card[]; source: Source; dx: number; dy: number } | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const pilesRef = useRef(piles);
  pilesRef.current = piles;

  const newGame = useCallback(() => { setPiles(deal()); setScore(0); setMoves(0); setWon(false); setDrag(null); }, []);

  const canStackTableau = (moving: Card, onto: Card | undefined) =>
    onto ? (isRed(moving.suit) !== isRed(onto.suit) && moving.rank === onto.rank - 1) : moving.rank === 13;
  const canStackFoundation = (moving: Card, pile: Card[]) =>
    pile.length === 0 ? moving.rank === 1 : (pile[pile.length - 1].suit === moving.suit && moving.rank === pile[pile.length - 1].rank + 1);

  /* Draw from stock */
  const drawStock = useCallback(() => {
    setPiles((p) => {
      if (p.stock.length === 0) {
        if (p.waste.length === 0) return p;
        return { ...p, stock: [...p.waste].reverse().map((c) => ({ ...c, faceUp: false })), waste: [] };
      }
      const stock = [...p.stock];
      const card = stock.pop()!;
      return { ...p, stock, waste: [...p.waste, { ...card, faceUp: true }] };
    });
    setMoves((m) => m + 1);
  }, []);

  /* Begin dragging from a pile */
  const startDrag = useCallback((source: Source, cardIdx: number, e: React.MouseEvent) => {
    e.preventDefault();
    // Capture event geometry synchronously (React nulls the event after the handler).
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const dx = e.clientX - r.left, dy = e.clientY - r.top;
    const cx = e.clientX, cy = e.clientY;
    const p = pilesRef.current;
    const np: Piles = { ...p, foundations: p.foundations.map((f) => [...f]), tableau: p.tableau.map((t) => [...t]), waste: [...p.waste] };
    let taken: Card[] = [];
    if (source.type === "waste") { if (np.waste.length) taken = [np.waste.pop()!]; }
    else if (source.type === "foundation") { if (np.foundations[source.i].length) taken = [np.foundations[source.i].pop()!]; }
    else { taken = np.tableau[source.i].splice(cardIdx); }
    if (!taken.length || !taken[0].faceUp) return;
    setPiles(np);
    setDrag({ cards: taken, source, dx, dy });
    setMouse({ x: cx, y: cy });
  }, []);

  /* Drop */
  useEffect(() => {
    if (!drag) return;
    const move = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    const up = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const zone = el?.closest("[data-drop]") as HTMLElement | null;
      const dropId = zone?.getAttribute("data-drop") ?? null;
      setPiles((p) => {
        const np: Piles = { ...p, foundations: p.foundations.map((f) => [...f]), tableau: p.tableau.map((t) => [...t]), waste: [...p.waste], stock: p.stock };
        const moving = drag.cards;
        let placed = false;
        let delta = 0;

        if (dropId?.startsWith("foundation-") && moving.length === 1) {
          const fi = +dropId.split("-")[1];
          if (canStackFoundation(moving[0], np.foundations[fi])) { np.foundations[fi].push(moving[0]); placed = true; delta = drag.source.type === "tableau" || drag.source.type === "waste" ? 10 : 0; }
        } else if (dropId?.startsWith("tableau-")) {
          const ti = +dropId.split("-")[1];
          const onto = np.tableau[ti][np.tableau[ti].length - 1];
          if (canStackTableau(moving[0], onto)) { np.tableau[ti].push(...moving); placed = true; delta = drag.source.type === "waste" ? 5 : drag.source.type === "foundation" ? -15 : 0; }
        }

        if (!placed) {
          // return to source
          if (drag.source.type === "waste") np.waste.push(...moving);
          else if (drag.source.type === "foundation") np.foundations[drag.source.i].push(...moving);
          else np.tableau[drag.source.i].push(...moving);
          return np;
        }
        // flip newly exposed tableau card
        if (drag.source.type === "tableau") {
          const col = np.tableau[drag.source.i];
          if (col.length && !col[col.length - 1].faceUp) { col[col.length - 1] = { ...col[col.length - 1], faceUp: true }; delta += 5; }
        }
        if (delta) setScore((s) => Math.max(0, s + delta));
        setMoves((m) => m + 1);
        if (np.foundations.every((f) => f.length === 13)) setWon(true);
        return np;
      });
      setDrag(null);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [drag]);

  /* Double-click → auto to foundation */
  const autoFoundation = useCallback((source: Source, card: Card) => {
    setPiles((p) => {
      const fi = p.foundations.findIndex((f) => canStackFoundation(card, f));
      if (fi < 0) return p;
      const np: Piles = { ...p, foundations: p.foundations.map((f) => [...f]), tableau: p.tableau.map((t) => [...t]), waste: [...p.waste] };
      if (source.type === "waste") { if (np.waste[np.waste.length - 1]?.id !== card.id) return p; np.waste.pop(); }
      else if (source.type === "tableau") { const col = np.tableau[source.i]; if (col[col.length - 1]?.id !== card.id) return p; col.pop(); if (col.length && !col[col.length - 1].faceUp) { col[col.length - 1] = { ...col[col.length - 1], faceUp: true }; setScore((s) => s + 5); } }
      else return p;
      np.foundations[fi].push(card);
      setScore((s) => s + 10);
      setMoves((m) => m + 1);
      if (np.foundations.every((f) => f.length === 13)) setWon(true);
      return np;
    });
  }, []);

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-auto" style={{ background: "linear-gradient(160deg,#1b7a3d,#0d5a28)", fontFamily: "Tahoma, sans-serif", userSelect: "none" }}>
      {/* top bar */}
      <div className="flex items-center gap-4 px-3" style={{ height: 30, background: "rgba(0,0,0,0.18)", color: "#fff", fontSize: 12 }}>
        <button onClick={newGame} style={{ fontSize: 11, fontWeight: 700, color: "#0d5a28", background: "linear-gradient(to bottom,#fff,#d6e8d8)", border: "1px solid #0d5a28", borderRadius: 3, padding: "2px 10px", cursor: "pointer" }}>Deal</button>
        <span className="ml-auto">Score: <b>{score}</b></span>
        <span>Moves: <b>{moves}</b></span>
      </div>

      <div className="p-3" style={{ minWidth: 7 * (CARD_W + 8) }}>
        {/* top row: stock, waste, foundations */}
        <div className="flex gap-2 mb-3">
          {/* stock */}
          <div onClick={drawStock} style={pileSlot()}>
            {piles.stock.length ? <CardBack /> : <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 22 }}>↻</span>}
          </div>
          {/* waste */}
          <div style={pileSlot()}>
            {piles.waste.length > 0 && (
              <CardFace card={piles.waste[piles.waste.length - 1]}
                onMouseDown={(e) => startDrag({ type: "waste" }, piles.waste.length - 1, e)}
                onDoubleClick={() => autoFoundation({ type: "waste" }, piles.waste[piles.waste.length - 1])}
                hidden={drag?.source.type === "waste"} />
            )}
          </div>
          <div style={{ width: CARD_W }} />
          {/* foundations */}
          {piles.foundations.map((f, i) => (
            <div key={i} data-drop={`foundation-${i}`} style={pileSlot()}>
              {f.length > 0 ? (
                <CardFace card={f[f.length - 1]}
                  onMouseDown={(e) => startDrag({ type: "foundation", i }, f.length - 1, e)} />
              ) : <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 28 }}>{SUITS[i]}</span>}
            </div>
          ))}
        </div>

        {/* tableau */}
        <div className="flex gap-2">
          {piles.tableau.map((col, i) => (
            <div key={i} data-drop={`tableau-${i}`} style={{ width: CARD_W, minHeight: CARD_H, position: "relative" }}>
              {col.length === 0 && <div style={{ ...emptySlot(), position: "absolute", top: 0 }} />}
              {col.map((card, ci) => {
                const top = col.slice(0, ci).reduce((y, c) => y + (c.faceUp ? FAN_UP : FAN_DOWN), 0);
                const draggingFromHere = drag?.source.type === "tableau" && drag.source.i === i;
                // hide cards that are currently in the air
                const hideFrom = draggingFromHere ? col.length - drag!.cards.length : Infinity;
                return (
                  <div key={card.id} style={{ position: "absolute", top, left: 0 }}>
                    {card.faceUp ? (
                      <CardFace card={card} hidden={ci >= hideFrom}
                        onMouseDown={(e) => startDrag({ type: "tableau", i }, ci, e)}
                        onDoubleClick={() => ci === col.length - 1 && autoFoundation({ type: "tableau", i }, card)} />
                    ) : <CardBack />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* floating drag layer */}
      {drag && (
        <div style={{ position: "fixed", left: mouse.x - drag.dx, top: mouse.y - drag.dy, pointerEvents: "none", zIndex: 9999 }}>
          {drag.cards.map((card, i) => (
            <div key={card.id} style={{ position: "absolute", top: i * FAN_UP, left: 0 }}><CardFace card={card} /></div>
          ))}
        </div>
      )}

      {won && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 10000 }}>
          <div className="text-center" style={{ background: "#ece9d8", border: "2px solid #0531a0", borderRadius: 6, padding: "20px 30px", boxShadow: "4px 4px 16px rgba(0,0,0,0.5)" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1b7a3d" }}>You Win! 🎉</div>
            <div style={{ fontSize: 13, color: "#444", margin: "6px 0 12px" }}>Score: {score} · Moves: {moves}</div>
            <button onClick={newGame} style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "linear-gradient(to bottom,#5fa0f4,#1257c4)", border: "1px solid #0d49ad", borderRadius: 4, padding: "6px 18px", cursor: "pointer" }}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

function pileSlot(): React.CSSProperties {
  return { width: CARD_W, height: CARD_H, borderRadius: 6, border: "1px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", cursor: "pointer" };
}
function emptySlot(): React.CSSProperties {
  return { width: CARD_W, height: CARD_H, borderRadius: 6, border: "1px dashed rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.05)" };
}

function CardFace({ card, onMouseDown, onDoubleClick, hidden }: { card: Card; onMouseDown?: (e: React.MouseEvent) => void; onDoubleClick?: () => void; hidden?: boolean }) {
  const red = isRed(card.suit);
  return (
    <div onMouseDown={onMouseDown} onDoubleClick={onDoubleClick}
      style={{ width: CARD_W, height: CARD_H, borderRadius: 6, background: "#fff", border: "1px solid #888", boxShadow: "0 1px 2px rgba(0,0,0,0.3)", position: "relative", cursor: "grab", visibility: hidden ? "hidden" : "visible", color: red ? "#cc2222" : "#1a1a1a", fontFamily: "Georgia, serif" }}>
      <div style={{ position: "absolute", top: 3, left: 5, fontSize: 14, fontWeight: 700, lineHeight: 1 }}>{RANKS[card.rank - 1]}<div style={{ fontSize: 12 }}>{card.suit}</div></div>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>{card.suit}</div>
      <div style={{ position: "absolute", bottom: 3, right: 5, fontSize: 14, fontWeight: 700, lineHeight: 1, transform: "rotate(180deg)" }}>{RANKS[card.rank - 1]}<div style={{ fontSize: 12 }}>{card.suit}</div></div>
    </div>
  );
}

function CardBack() {
  return (
    <div style={{ width: CARD_W, height: CARD_H, borderRadius: 6, border: "1px solid #2a3a8a", background: "repeating-linear-gradient(45deg,#3a5bbf 0 6px,#2c47a0 6px 12px)", boxShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
      <div style={{ position: "absolute", inset: 4, border: "2px solid rgba(255,255,255,0.5)", borderRadius: 4 }} />
    </div>
  );
}
