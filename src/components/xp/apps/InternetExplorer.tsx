"use client";

import { useState, useEffect, useRef } from "react";
import Portfolio from "../../Portfolio";
import { useDesktop } from "../DesktopContext";
import type { SitePayload } from "../types";
import { addPin, hasPinForUrl } from "../storage/pinsStore";

const HOME = "portfolio";
const isPortfolio = (url: string) => url === HOME || url === "" || url === "https://obaida.portfolio/home";

/* Internet Explorer: a working address bar that renders either the real
   Portfolio (the home page) or an external site in an iframe, with a graceful
   fallback for sites that refuse to be framed, plus a "pin to taskbar" button. */
export default function InternetExplorer() {
  const { payloads, notify } = useDesktop();
  const payload = payloads.ie as SitePayload | undefined;

  const initial = payload?.url ?? HOME;
  const [history, setHistory] = useState<string[]>([initial]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState(initial === HOME ? "https://obaida.portfolio/home" : initial);
  const lastPayload = useRef<SitePayload | undefined>(payload);

  // React to a new site arriving via openApp (e.g. clicking a different pin).
  if (payload && payload !== lastPayload.current) {
    lastPayload.current = payload;
    const u = payload.url;
    setHistory((h) => [...h.slice(0, idx + 1), u]);
    setIdx((i) => i + 1);
    setInput(isPortfolio(u) ? "https://obaida.portfolio/home" : u);
  }

  const current = history[idx] ?? HOME;
  const onPortfolio = isPortfolio(current);

  const navigate = (raw: string) => {
    let u = raw.trim();
    if (!u) return;
    if (u === "https://obaida.portfolio/home") u = HOME;
    else if (!isPortfolio(u) && !/^https?:\/\//i.test(u)) u = `https://${u}`;
    setHistory((h) => [...h.slice(0, idx + 1), u]);
    setIdx((i) => i + 1);
    setInput(isPortfolio(u) ? "https://obaida.portfolio/home" : u);
  };

  const back = () => { if (idx > 0) { const i = idx - 1; setIdx(i); setInput(isPortfolio(history[i]) ? "https://obaida.portfolio/home" : history[i]); } };
  const forward = () => { if (idx < history.length - 1) { const i = idx + 1; setIdx(i); setInput(isPortfolio(history[i]) ? "https://obaida.portfolio/home" : history[i]); } };

  const pinCurrent = () => {
    const url = onPortfolio ? HOME : current;
    const name = onPortfolio ? "Obaida Portfolio" : hostName(current);
    addPin(name, url);
    notify("Pinned to taskbar", `${name} was added to the Quick Launch bar.`);
  };

  const pinned = hasPinForUrl(onPortfolio ? HOME : current);

  return (
    <div className="absolute inset-0 flex flex-col" style={{ fontFamily: "Tahoma, 'Segoe UI', sans-serif" }}>
      {/* Menu bar */}
      <div className="flex items-center gap-3 shrink-0 px-2" style={{ height: 20, background: "#ece9d8", fontSize: 11, color: "#333", borderBottom: "1px solid #d6d2c2" }}>
        {["File", "Edit", "View", "Favorites", "Tools", "Help"].map((m) => (
          <span key={m} className="px-1 cursor-default" style={{ borderRadius: 2 }}>{m}</span>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 shrink-0 px-2" style={{ height: 30, background: "linear-gradient(to bottom,#f5f4ec,#e3ddc9)", borderBottom: "1px solid #b8b29c" }}>
        <NavBtn label="Back" enabled={idx > 0} onClick={back}>◀</NavBtn>
        <NavBtn label="Forward" enabled={idx < history.length - 1} onClick={forward}>▶</NavBtn>
        <NavBtn label="Home" onClick={() => navigate("https://obaida.portfolio/home")}>⌂</NavBtn>
        <div style={{ width: 1, height: 20, background: "#c9c3ad", margin: "0 3px" }} />
        <NavBtn label={pinned ? "Pinned" : "Pin to taskbar"} onClick={pinCurrent}>★</NavBtn>
      </div>

      {/* Address bar */}
      <div className="flex items-center gap-2 shrink-0 px-2" style={{ height: 26, background: "#ece9d8", borderBottom: "1px solid #b8b29c" }}>
        <span style={{ fontSize: 11, color: "#777" }}>Address</span>
        <div className="flex-1 flex items-center gap-2 h-[19px] px-1.5" style={{ background: "#fff", border: "1px solid #7f9db9", fontSize: 12 }}>
          <span style={{ width: 13, height: 13, display: "inline-block", flexShrink: 0 }}>
            <svg viewBox="0 0 16 16" width="13" height="13"><circle cx="8" cy="8" r="7" fill="#3aa0e8" /><text x="8" y="12" textAnchor="middle" fontStyle="italic" fontWeight="700" fontSize="10" fill="#fff" fontFamily="Georgia">e</text></svg>
          </span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") navigate(input); }}
            className="flex-1"
            style={{ border: "none", outline: "none", fontSize: 12, background: "transparent" }}
          />
        </div>
        <button onClick={() => navigate(input)} className="px-2 h-[19px]" style={{ fontSize: 11, background: "linear-gradient(to bottom,#fff,#e3ddc9)", border: "1px solid #aaa", borderRadius: 2, cursor: "pointer", color: "#46a85a", fontWeight: 700 }}>Go</button>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-auto relative" style={{ background: onPortfolio ? "var(--color-blue-slate)" : "#fff" }}>
        {onPortfolio ? <PortfolioPage /> : <ExternalSite url={current} />}
      </div>

      {/* Status bar */}
      <div className="shrink-0 flex items-center gap-2 px-2" style={{ height: 20, background: "#ece9d8", borderTop: "1px solid #b8b29c", fontSize: 11, color: "#444" }}>
        <span>Done</span>
        <span className="ml-auto flex items-center gap-1" style={{ color: "#666" }}>
          <span style={{ width: 11, height: 11, display: "inline-block" }}>
            <svg viewBox="0 0 16 16" width="11" height="11"><circle cx="8" cy="8" r="6" fill="#e8a33b" /><path d="M5 8 L8 5 L11 8 L8 11 Z" fill="#fff" /></svg>
          </span>
          Internet
        </span>
      </div>
    </div>
  );
}

/** The home page with its original "connecting…" intro + CRT overlay. */
function PortfolioPage() {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let p = 0;
    const id = setInterval(() => {
      p += Math.random() * 16 + 6;
      if (p >= 100) { p = 100; clearInterval(id); setTimeout(() => setLoaded(true), 280); }
      setProgress(p);
    }, 190);
    return () => clearInterval(id);
  }, []);
  if (!loaded) {
    return (
      <>
        <div className="shrink-0" style={{ height: 3, background: "#ddd" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(to right,#0054e3,#4aade8)", transition: "width .19s" }} />
        </div>
        <div className="flex items-center justify-center h-full" style={{ fontSize: 13, color: "#888" }}>Connecting to obaida.portfolio…</div>
      </>
    );
  }
  return (
    <>
      <Portfolio />
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 40 }}>
        <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(180deg, transparent 0px, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)", animation: "crtFlicker 9s step-end infinite" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 48%, rgba(0,0,0,0.5) 100%)" }} />
        <div className="absolute left-0 right-0" style={{ height: "20%", background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.025) 50%, transparent)", animation: "crtScanMove 10s linear infinite" }} />
      </div>
    </>
  );
}

/** External site in an iframe, with a fallback for sites that block framing. */
function ExternalSite({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);
  // Reset the loaded flag when navigating to a different URL.
  const lastUrl = useRef(url);
  if (lastUrl.current !== url) { lastUrl.current = url; if (loaded) setLoaded(false); }
  return (
    <div className="absolute inset-0">
      <iframe
        key={url}
        src={url}
        title={url}
        onLoad={() => setLoaded(true)}
        style={{ width: "100%", height: "100%", border: "none", background: "#fff" }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
      {!loaded && (
        <div className="absolute left-0 right-0 bottom-0 flex items-center gap-2" style={{ padding: "6px 10px", background: "#fffbe6", borderTop: "1px solid #e3c869", fontSize: 11, color: "#665100" }}>
          <span>If this page stays blank, the site blocks being shown inside a frame.</span>
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "auto", color: "#0a5", fontWeight: 700 }}>Open in new tab ↗</a>
        </div>
      )}
    </div>
  );
}

function hostName(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

function NavBtn({ children, label, enabled = true, onClick }: { children: React.ReactNode; label: string; enabled?: boolean; onClick?: () => void }) {
  return (
    <button
      title={label}
      disabled={!enabled}
      onClick={onClick}
      className="flex items-center gap-1 px-1.5 h-[22px]"
      style={{
        fontSize: 12, color: enabled ? "#333" : "#aaa",
        background: "transparent", border: "1px solid transparent", borderRadius: 3,
        cursor: enabled ? "pointer" : "default", whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => { if (enabled) { e.currentTarget.style.background = "#fce9b0"; e.currentTarget.style.border = "1px solid #e3b94e"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.border = "1px solid transparent"; }}
    >
      <span style={{ fontSize: 13 }}>{children}</span>
      <span style={{ fontSize: 11 }}>{label}</span>
    </button>
  );
}
