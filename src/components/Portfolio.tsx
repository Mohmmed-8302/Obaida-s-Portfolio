"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   Static data — hoisted to module scope (react: no per-render allocs)
   ═══════════════════════════════════════════════════════════════ */

const HERO_STATS = [
  { value: "2024", label: "First Edit" },
  { value: "2026", label: "Went Viral" },
  { value: "3", label: "Core Niches" },
  { value: "<3min", label: "Sweet Spot" },
];

const MARQUEE_ITEMS = [
  "Gaming Edits", "Motion Graphics", "Portfolio Design",
  "Awareness Content", "Education Content", "Viral Hooks",
];

const YT_CHANNEL = "https://youtube.com/@festeara-24";
const WORK = [
  {
    num: "01", tag: "Gaming", title: "Viral Gaming Edits",
    meta: "FX · Pacing · Hooks", dur: "0:47",
    desc: "High-energy edits engineered to survive the first three seconds.",
    url: YT_CHANNEL,
  },
  {
    num: "02", tag: "Education", title: "Education That Lands",
    meta: "Clarity · Retention · Story", dur: "1:23",
    desc: "Complex ideas cut down to the moments people actually remember.",
    url: YT_CHANNEL,
  },
  {
    num: "03", tag: "Awareness", title: "Awareness Clips",
    meta: "Emotion · Message · Impact", dur: "2:15",
    desc: "Message-first storytelling with not a single wasted second.",
    url: YT_CHANNEL,
  },
];

const VIDEOS = [
  { src: "/videos/lost-hadiths.mp4", title: "أحاديث ضيعة", tag: "Awareness" },
  { src: "/videos/rich-buy-poor-sell.mp4", title: "حاجة بيشتريها الأغنياء", tag: "Education" },
  { src: "/videos/major-minor-sins.mp4", title: "الكبائر و الصغائر", tag: "Awareness" },
  { src: "/videos/spiderman-yemen.mp4", title: "سبيدرمان اليمن", tag: "Entertainment" },
];

const CAPABILITIES = [
  { label: "Video Editing", value: 90 },
  { label: "Motion Graphics", value: 82 },
  { label: "Portfolio Design", value: 88 },
  { label: "Social Strategy", value: 70 },
];

const SERVICES = [
  { n: "01", label: "Short-Form Editing", note: "Reels · Shorts · TikTok" },
  { n: "02", label: "Motion Graphics & VFX", note: "Titles · Transitions · FX" },
  { n: "03", label: "Portfolio & Web Design", note: "Brand · Layout · Polish" },
  { n: "04", label: "Hook & Thumbnail Design", note: "Stop-the-scroll first frames" },
];

const JOURNEY = [
  { year: "2022", title: "Started Learning", desc: "Self-taught editing journey begins. Discovered the power of short-form." },
  { year: "2024", title: "First Publish", desc: "Released first professional edits. Built a growing reel of viral-ready clips." },
  { year: "2026", title: "The Breakthrough", desc: "Content went viral. Portfolio design services launched. No looking back." },
];

const CONTACT_DETAILS = [
  { label: "Email", value: "technecal23@gmail.com", href: "mailto:technecal23@gmail.com" },
  { label: "Phone", value: "+966 56 620 7480", href: "tel:+966566207480" },
  { label: "YouTube", value: "@festeara-24 / Obaida", href: "https://youtube.com/@festeara-24", external: true },
];

const EMAIL = "technecal23@gmail.com";

/* ═══════════════════════════════════════════════════════════════
   Reveal manager — ONE shared, rAF-throttled, capture-phase scroll
   listener for all reveals (react: client-event-listeners — dedup
   global listeners; rendering-perf — rAF batch). Uses
   getBoundingClientRect so it works inside nested scroll containers
   where a viewport IntersectionObserver would not fire.
   ═══════════════════════════════════════════════════════════════ */

type RevealEntry = { el: Element; cb: () => void };
const revealRegistry = new Set<RevealEntry>();
let revealListening = false;
let revealThrottle = 0;

function checkEntry(entry: RevealEntry, vh: number) {
  const r = entry.el.getBoundingClientRect();
  if (r.top < vh * 0.92 && r.bottom > 0) {
    entry.cb();
    revealRegistry.delete(entry);
    return true;
  }
  return false;
}

function processReveals() {
  const vh = window.innerHeight || 800;
  for (const entry of [...revealRegistry]) checkEntry(entry, vh);
  if (revealRegistry.size === 0) stopRevealListening();
}

// Find the nearest scrollable ancestor of `el`. The portfolio renders inside
// a nested scroll container (the IE window's CRT viewport), so a window-level
// scroll listener never sees its scroll events — we must bind the real one.
function getScrollParent(el: Element | null): HTMLElement | Window {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const oy = getComputedStyle(node).overflowY;
    if (node.scrollHeight - node.clientHeight > 4 && (oy === "auto" || oy === "scroll")) {
      return node;
    }
    node = node.parentElement;
  }
  return window;
}

// Leading + trailing throttle via setTimeout (no rAF — must work even
// when the tab's render pipeline is paused).
function onRevealScroll() {
  if (revealThrottle) return;
  processReveals();
  revealThrottle = window.setTimeout(() => { revealThrottle = 0; processReveals(); }, 100);
}

function startRevealListening() {
  if (revealListening) return;
  revealListening = true;
  // capture:true catches scroll from nested scroll containers (scroll
  // does not bubble, but capture-phase ancestors still receive it).
  window.addEventListener("scroll", onRevealScroll, { passive: true, capture: true });
  window.addEventListener("resize", onRevealScroll, { passive: true });
}

function stopRevealListening() {
  if (!revealListening) return;
  revealListening = false;
  window.removeEventListener("scroll", onRevealScroll, { capture: true });
  window.removeEventListener("resize", onRevealScroll);
}

function registerReveal(el: Element, cb: () => void) {
  const entry: RevealEntry = { el, cb };
  revealRegistry.add(entry);
  startRevealListening();
  checkEntry(entry, window.innerHeight || 800); // synchronous initial check
  return () => {
    revealRegistry.delete(entry);
    if (revealRegistry.size === 0) stopRevealListening();
  };
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    return registerReveal(el, () => setVisible(true));
  }, []);
  return { ref, visible };
}

/* ═══════════════════════════════════════════════════════════════
   Primitives
   ═══════════════════════════════════════════════════════════════ */

function Reveal({ children, delay = 0, className = "", as = "div" }: {
  children: React.ReactNode; delay?: number; className?: string; as?: "div" | "li";
}) {
  const { ref, visible } = useReveal();
  const Tag = as as "div";
  return (
    <Tag ref={ref as never} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : "translateY(24px)",
      transition: `opacity .7s cubic-bezier(.22,.61,.36,1) ${delay}ms, transform .7s cubic-bezier(.22,.61,.36,1) ${delay}ms`,
    }}>
      {children}
    </Tag>
  );
}

function SectionLabel({ index, total, label }: { index: string; total: string; label: string }) {
  return (
    <div className="pf-eyebrow flex items-center" style={{ gap: 10 }}>
      <span style={{ color: "var(--pf-accent)" }}>{index}</span>
      <span style={{ color: "var(--pf-faint)" }}>/ {total}</span>
      <span style={{ width: 28, height: 1, background: "var(--pf-line-strong)" }} />
      <span style={{ color: "var(--pf-muted)" }}>{label}</span>
    </div>
  );
}

const PIXEL_BTN: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "0.14em",
  padding: "10px 24px",
  cursor: "pointer", borderRadius: 0,
  display: "inline-flex", alignItems: "center", gap: 10,
  textDecoration: "none", whiteSpace: "nowrap",
  background: "#c0c0c0", color: "#000",
  imageRendering: "pixelated",
  borderTop: "2px solid #fff",
  borderLeft: "2px solid #fff",
  borderBottom: "2px solid #404040",
  borderRight: "2px solid #404040",
  boxShadow: "1px 1px 0 #000, inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080",
  textShadow: "none",
  outline: "1px solid #000",
};
const PIXEL_BTN_PRESSED: React.CSSProperties = {
  ...PIXEL_BTN,
  borderTop: "2px solid #404040",
  borderLeft: "2px solid #404040",
  borderBottom: "2px solid #fff",
  borderRight: "2px solid #fff",
  boxShadow: "1px 1px 0 #000, inset 1px 1px 0 #808080, inset -1px -1px 0 #dfdfdf",
  padding: "11px 23px 9px 25px",
};

function PixelButton({ children, href, onClick, accent }: {
  children: React.ReactNode; href?: string; onClick?: () => void; accent?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const base = accent
    ? { ...(pressed ? PIXEL_BTN_PRESSED : PIXEL_BTN), background: "#c0c0c0", color: "#000" }
    : pressed ? PIXEL_BTN_PRESSED : PIXEL_BTN;
  const Tag = (href ? "a" : "button") as "a";
  return (
    <Tag style={base} href={href} onClick={onClick}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)} onMouseLeave={() => setPressed(false)}>
      {children}
    </Tag>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Sticky Nav
   ═══════════════════════════════════════════════════════════════ */

const NAV_LINKS = [
  { label: "Home", to: "hero" },
  { label: "Studio", to: "studio" },
  { label: "Work", to: "work" },
  { label: "Videos", to: "videos" },
  { label: "Skills", to: "skills" },
  { label: "Journey", to: "journey" },
  { label: "Contact", to: "contact" },
];

function PortfolioNav() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.to);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { setActive(e.target.id); break; }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const go = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "color-mix(in srgb, var(--pf-bg) 85%, transparent)",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--pf-line)",
      display: "flex", justifyContent: "center", gap: 6,
      padding: "8px 16px", flexWrap: "wrap",
    }}>
      {NAV_LINKS.map((l) => (
        <button key={l.to} onClick={() => go(l.to)} style={{
          background: active === l.to ? "var(--pf-accent)" : "#1a1a2e",
          color: active === l.to ? "#fff" : "rgba(255,255,255,0.7)",
          border: "none", borderRadius: 9999,
          padding: "6px 18px", cursor: "pointer",
          fontFamily: "var(--font-pixel)", fontSize: 13, fontWeight: 600,
          letterSpacing: "0.05em", textTransform: "uppercase",
          transition: "background .2s, color .2s",
        }}>
          {l.label}
        </button>
      ))}
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Sections
   ═══════════════════════════════════════════════════════════════ */

function HeroSection() {
  const goWork = useCallback(() => {
    document.getElementById("work")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const goContact = useCallback(() => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section id="hero" className="pf-hero relative overflow-hidden" style={{ background: "var(--pf-bg)" }}>
      {/* Layered background: faint grid + rose glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage:
          "linear-gradient(var(--pf-line) 1px, transparent 1px), linear-gradient(90deg, var(--pf-line) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        maskImage: "radial-gradient(ellipse 80% 60% at 70% 0%, black, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 70% 0%, black, transparent 75%)",
        opacity: 0.6,
      }} />
      <div className="absolute pointer-events-none" style={{
        top: "-20%", right: "-10%", width: "60%", height: "70%",
        background: "radial-gradient(circle, var(--pf-accent-soft) 0%, transparent 65%)",
      }} />

      <div className="section-inner relative" style={{ minHeight: 620, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {/* Top row: logo + availability */}
        <div className="flex items-center justify-between" style={{ marginBottom: "clamp(40px, 7cqi, 88px)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-glow.png" alt="Obaida" style={{ width: "clamp(56px, 8cqi, 92px)", height: "auto" }} />
          <div className="pf-meta flex items-center" style={{ gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#5BCE8A", boxShadow: "0 0 8px #5BCE8A" }} />
            Available for work — 2026
          </div>
        </div>

        <Reveal>
          <div className="pf-eyebrow" style={{ marginBottom: 24 }}>Video Editor — Portfolio Designer</div>
        </Reveal>

        <Reveal delay={120}>
          <h1 className="pf-display" style={{ color: "var(--pf-text)", maxWidth: "16ch", marginBottom: 28 }}>
            Short-form video that makes people{" "}
            <span style={{ color: "var(--pf-accent)", fontStyle: "italic" }}>stop scrolling.</span>
          </h1>
        </Reveal>

        <Reveal delay={240}>
          <p className="pf-lead" style={{ fontFamily: "var(--font-body)", maxWidth: "54ch", marginBottom: 40 }}>
            Obaida crafts viral gaming edits, education content, and awareness clips —
            every frame engineered to hold attention. No templates. No filler.
          </p>
        </Reveal>

        <Reveal delay={360}>
          <div className="flex flex-wrap items-center" style={{ gap: 20 }}>
            <PixelButton onClick={goWork} accent>View Selected Work →</PixelButton>
            <PixelButton onClick={goContact}>Get in touch</PixelButton>
          </div>
        </Reveal>

        {/* Stat bar */}
        <Reveal delay={480}>
          <div className="pf-stats" style={{ marginTop: "clamp(48px, 8cqi, 96px)" }}>
            {HERO_STATS.map(s => (
              <div key={s.label} style={{ background: "var(--pf-bg)", padding: "22px 20px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(26px, 3.4cqi, 40px)", fontWeight: 700, color: "var(--pf-text)" }}>{s.value}</div>
                <div className="pf-meta" style={{ marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MarqueeSection() {
  return (
    <section style={{ background: "var(--pf-bg)", borderTop: "1px solid var(--pf-line)", borderBottom: "1px solid var(--pf-line)" }}>
      <div className="pf-marquee" style={{ padding: "20px 0" }}>
        <div className="pf-marquee-track">
          {[0, 1].map(rep => (
            <span key={rep} style={{ display: "inline-flex", alignItems: "center" }} aria-hidden={rep === 1}>
              {MARQUEE_ITEMS.map(item => (
                <span key={item} style={{ display: "inline-flex", alignItems: "center" }}>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontStyle: "italic",
                    fontSize: "clamp(22px, 3cqi, 38px)", color: "var(--pf-text)", padding: "0 28px",
                  }}>{item}</span>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--pf-accent)" }} />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="studio" style={{ background: "var(--pf-bg)" }}>
      <div className="section-inner">
        <div className="pf-grid-2">
          <Reveal>
            <SectionLabel index="01" total="06" label="Studio" />
          </Reveal>
          <div>
            <Reveal delay={120}>
              <h2 className="pf-h2" style={{ color: "var(--pf-text)", marginBottom: 28 }}>
                Who We Are
              </h2>
            </Reveal>
            <Reveal delay={240}>
              <p className="pf-lead" style={{ fontFamily: "var(--font-body)", marginBottom: 18 }}>
                Self-taught since 2024, Obaida mastered the one thing most creators ignore:
                why people stop scrolling. The work lives under three minutes —
                tight, intentional, and made to perform.
              </p>
            </Reveal>
            <Reveal delay={360}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "clamp(16px, 2cqi, 22px)", fontWeight: 700, color: "var(--pf-accent)", lineHeight: 1.4 }}>
                No templates. No filler. Just work that gets seen.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkCard({ item, delay }: { item: typeof WORK[number]; delay: number }) {
  return (
    <Reveal delay={delay}>
      <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}>
      <article className="pf-card h-full" style={{ display: "flex", flexDirection: "column" }}>
        {/* Media */}
        <div className="pf-media" style={{ aspectRatio: "4 / 3", background: "var(--pf-bg)", borderBottom: "1px solid var(--pf-line)" }}>
          <div className="pf-media-inner absolute inset-0 flex items-center justify-center" style={{
            background: "radial-gradient(circle at 30% 25%, var(--pf-accent-soft) 0%, transparent 55%)",
          }}>
            {/* Ghost index numeral */}
            <span style={{
              position: "absolute", fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: "clamp(90px, 16cqi, 200px)", color: "var(--pf-line-strong)",
              lineHeight: 1, userSelect: "none",
            }}>{item.num}</span>
            {/* Play glyph */}
            <span style={{
              position: "relative", width: 0, height: 0,
              borderLeft: "22px solid var(--pf-accent)",
              borderTop: "14px solid transparent", borderBottom: "14px solid transparent",
              filter: "drop-shadow(0 0 12px rgba(201,122,138,0.5))",
            }} />
          </div>
          {/* Duration */}
          <div className="absolute" style={{
            bottom: 12, right: 12, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
            color: "var(--pf-text)", background: "rgba(0,0,0,0.6)", padding: "3px 8px", letterSpacing: "0.06em",
            border: "1px solid var(--pf-line)",
          }}>{item.dur}</div>
          {/* Tag */}
          <div className="absolute pf-meta" style={{ top: 14, left: 14, color: "var(--pf-accent)" }}>{item.tag}</div>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 22px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
          <div className="flex items-start justify-between" style={{ gap: 12, marginBottom: 8 }}>
            <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(20px, 2.6cqi, 26px)", fontWeight: 700, color: "var(--pf-text)", lineHeight: 1.15 }}>{item.title}</h3>
            <span className="pf-arrow" style={{ fontSize: 20, color: "var(--pf-faint)", flexShrink: 0 }}>↗</span>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.6, color: "var(--pf-muted)", marginBottom: 16, flex: 1 }}>{item.desc}</p>
          <div className="pf-meta">{item.meta}</div>
        </div>
      </article>
      </a>
    </Reveal>
  );
}

function WorkSection() {
  return (
    <section id="work" style={{ background: "var(--pf-bg)", borderTop: "1px solid var(--pf-line)" }}>
      <div className="section-inner">
        <div className="flex flex-wrap items-end justify-between" style={{ gap: 20, marginBottom: "clamp(36px, 5cqi, 64px)" }}>
          <div>
            <Reveal>
              <SectionLabel index="02" total="06" label="Selected Work" />
            </Reveal>
            <Reveal delay={120}>
              <h2 className="pf-h2" style={{ color: "var(--pf-text)", marginTop: 18 }}>
                Projects &amp; Portfolio
              </h2>
            </Reveal>
          </div>
          <Reveal delay={240}>
            <span className="pf-meta">Three niches · one obsession</span>
          </Reveal>
        </div>

        <div className="pf-grid-work">
          {WORK.map((item, i) => <WorkCard key={item.num} item={item} delay={i * 120} />)}
        </div>
      </div>
    </section>
  );
}

function VideoCard({ video, delay }: { video: typeof VIDEOS[number]; delay: number }) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const vidRef = useRef<HTMLVideoElement>(null);
  const toggle = useCallback(() => {
    const v = vidRef.current;
    if (!v) return;
    if (v.paused) { v.muted = true; v.play(); setPlaying(true); setMuted(true); }
    else { v.pause(); setPlaying(false); }
  }, []);
  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const v = vidRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);
  const goFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    vidRef.current?.requestFullscreen?.();
  }, []);
  const seekThumb = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    e.currentTarget.currentTime = 0.5;
  }, []);
  return (
    <Reveal delay={delay}>
      <div style={{
        background: "#111", border: "1px solid var(--pf-line)",
        overflow: "hidden", position: "relative",
      }}>
        <div style={{ position: "relative", cursor: "pointer" }} onClick={toggle}>
          <video
            ref={vidRef}
            src={video.src}
            loop
            muted
            playsInline
            preload="metadata"
            onLoadedMetadata={seekThumb}
            onEnded={() => setPlaying(false)}
            style={{ width: "100%", display: "block", aspectRatio: "9/16", objectFit: "cover", background: "#000" }}
          />
          {!playing ? (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.35)",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "rgba(0,0,0,0.6)", border: "2px solid rgba(255,255,255,0.8)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{
                  width: 0, height: 0, marginLeft: 4,
                  borderLeft: "16px solid #fff",
                  borderTop: "10px solid transparent", borderBottom: "10px solid transparent",
                }} />
              </div>
            </div>
          ) : (
            <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 6 }}>
              <button onClick={toggleMute} style={{
                width: 30, height: 30, borderRadius: "50%", border: "none",
                background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{muted ? "🔇" : "🔊"}</button>
              <button onClick={goFullscreen} style={{
                width: 30, height: 30, borderRadius: "50%", border: "none",
                background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 13, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>⛶</button>
            </div>
          )}
        </div>
        <div style={{ padding: "14px 16px" }}>
          <div className="pf-meta" style={{ color: "var(--pf-accent)", marginBottom: 6 }}>{video.tag}</div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700,
            color: "var(--pf-text)", direction: "rtl",
          }}>{video.title}</div>
        </div>
      </div>
    </Reveal>
  );
}

function VideosSection() {
  return (
    <section id="videos" style={{ background: "var(--pf-bg)", borderTop: "1px solid var(--pf-line)" }}>
      <div className="section-inner">
        <div className="flex flex-wrap items-end justify-between" style={{ gap: 20, marginBottom: "clamp(36px, 5cqi, 64px)" }}>
          <div>
            <Reveal>
              <SectionLabel index="03" total="06" label="Videos" />
            </Reveal>
            <Reveal delay={120}>
              <h2 className="pf-h2" style={{ color: "var(--pf-text)", marginTop: 18 }}>
                Video Edits
              </h2>
            </Reveal>
          </div>
          <Reveal delay={240}>
            <span className="pf-meta">Short-form · engineered to hold</span>
          </Reveal>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "clamp(16px, 2.5cqi, 28px)",
        }}>
          {VIDEOS.map((v, i) => <VideoCard key={v.src} video={v} delay={i * 120} />)}
        </div>
      </div>
    </section>
  );
}

function CapabilityBar({ label, value, delay }: { label: string; value: number; delay: number }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{ marginBottom: 22 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--pf-text)", letterSpacing: "0.01em" }}>{label}</span>
        <span className="pf-meta" style={{ color: "var(--pf-accent)" }}>{value}%</span>
      </div>
      <div className="pf-bar-track">
        <div className="pf-bar-fill" style={{ width: visible ? `${value}%` : "0%", transitionDelay: `${delay}ms` }} />
      </div>
    </div>
  );
}

function CapabilitiesSection() {
  return (
    <section id="skills" style={{ background: "var(--pf-bg)", borderTop: "1px solid var(--pf-line)" }}>
      <div className="section-inner">
        <Reveal>
          <SectionLabel index="04" total="06" label="Capabilities" />
        </Reveal>
        <Reveal delay={120}>
          <h2 className="pf-h2" style={{ color: "var(--pf-text)", marginTop: 18, marginBottom: "clamp(36px, 5cqi, 60px)" }}>
            Experience &amp; Skills
          </h2>
        </Reveal>

        <div className="pf-grid-2">
          {/* Left: capability bars */}
          <Reveal delay={200}>
            <div>
              {CAPABILITIES.map((c, i) => (
                <CapabilityBar key={c.label} label={c.label} value={c.value} delay={i * 90} />
              ))}
            </div>
          </Reveal>

          {/* Right: services list */}
          <div>
            {SERVICES.map((s, i) => (
              <Reveal key={s.n} delay={260 + i * 90}>
                <div className="flex items-baseline" style={{
                  gap: 18, padding: "20px 4px",
                  borderTop: "1px solid var(--pf-line)",
                  borderBottom: i === SERVICES.length - 1 ? "1px solid var(--pf-line)" : "none",
                }}>
                  <span className="pf-meta" style={{ color: "var(--pf-accent)", flexShrink: 0 }}>{s.n}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(18px, 2.2cqi, 24px)", fontWeight: 700, color: "var(--pf-text)" }}>{s.label}</div>
                    <div className="pf-meta" style={{ marginTop: 4 }}>{s.note}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Journey timeline — a video-editor's scrubber. A playhead scrubs down the
   spine as you scroll; each year is a keyframe that lights up when the
   playhead passes it, and goes dark again when you scrub back up. */
function useTimeline(count: number) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState<boolean[]>(() => new Array(count).fill(false));

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Reduced motion: show everything, fill the spine, skip the listener.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setActive(new Array(count).fill(true));
      if (fillRef.current) fillRef.current.style.height = "100%";
      return;
    }

    // Direct DOM writes drive the high-frequency scrubber (no re-render);
    // node booleans only toggle on threshold crossings (rare → setState ok,
    // and identity is preserved when nothing changed so we don't re-render).
    const update = () => {
      const vh = window.innerHeight || 800;
      const threshold = vh * 0.7; // playhead line, 70% down the viewport
      const rect = section.getBoundingClientRect();
      const passed = threshold - rect.top;
      const h = Math.max(0, Math.min(rect.height, passed));
      if (fillRef.current) fillRef.current.style.height = `${h}px`;
      const ph = playheadRef.current;
      if (ph) {
        ph.style.transform = `translateY(${h}px)`;
        ph.style.opacity = passed > 0 && passed < rect.height ? "1" : "0";
      }
      setActive(prev => {
        let copy: boolean[] | null = null;
        for (let i = 0; i < nodeRefs.current.length; i++) {
          const el = nodeRefs.current[i];
          if (!el) continue;
          const on = el.getBoundingClientRect().top < threshold;
          if (on !== prev[i]) {
            if (!copy) copy = prev.slice();
            copy[i] = on;
          }
        }
        return copy ?? prev;
      });
    };

    // Leading-edge, ~60fps time throttle — cheaper and more reliable than
    // rAF inside a backgrounded preview frame (passive: no scroll blocking).
    let last = 0;
    const onScroll = () => {
      const now = Date.now();
      if (now - last < 16) return;
      last = now;
      update();
    };

    const target = getScrollParent(section);
    target.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update(); // initial sync
    return () => {
      target.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [count]);

  return { sectionRef, fillRef, playheadRef, nodeRefs, active };
}

function TimelineNode({ entry, active, nodeRef }: {
  entry: typeof JOURNEY[number];
  active: boolean;
  nodeRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div ref={nodeRef} className="pf-tl-node" data-active={active || undefined}>
      <div className="pf-tl-year" style={{ fontFamily: "var(--font-mono)" }}>{entry.year}</div>
      <div className="pf-tl-title" style={{ fontFamily: "var(--font-mono)" }}>{entry.title}</div>
      <p className="pf-tl-desc" style={{ fontFamily: "var(--font-body)" }}>{entry.desc}</p>
    </div>
  );
}

function JourneySection() {
  const { sectionRef, fillRef, playheadRef, nodeRefs, active } = useTimeline(JOURNEY.length);
  return (
    <section id="journey" style={{ background: "var(--pf-bg)", borderTop: "1px solid var(--pf-line)" }}>
      <div className="section-inner">
        <Reveal>
          <SectionLabel index="05" total="06" label="Journey" />
        </Reveal>
        <Reveal delay={120}>
          <h2 className="pf-h2" style={{ color: "var(--pf-text)", marginTop: 18, marginBottom: "clamp(36px, 5cqi, 64px)" }}>
            Obaida&apos;s Story
          </h2>
        </Reveal>

        <div ref={sectionRef} className="pf-timeline">
          <div className="pf-tl-spine" aria-hidden>
            <div ref={fillRef} className="pf-tl-fill" />
            <div ref={playheadRef} className="pf-tl-playhead">
              <span className="pf-tl-playhead-tri" />
            </div>
          </div>
          {JOURNEY.map((e, i) => (
            <TimelineNode
              key={e.year}
              entry={e}
              active={active[i]}
              nodeRef={(el) => { nodeRefs.current[i] = el; }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="contact" style={{ background: "var(--pf-bg)", borderTop: "1px solid var(--pf-line)", position: "relative", overflow: "hidden" }}>
      <div className="absolute pointer-events-none" style={{
        bottom: "-30%", left: "-10%", width: "60%", height: "80%",
        background: "radial-gradient(circle, var(--pf-accent-soft) 0%, transparent 65%)",
      }} />
      <div className="section-inner relative">
        <Reveal>
          <SectionLabel index="06" total="06" label="Contact" />
        </Reveal>
        <Reveal delay={120}>
          <h2 className="pf-h2" style={{ color: "var(--pf-text)", margin: "24px 0 36px" }}>
            Get in Touch
          </h2>
        </Reveal>

        <Reveal delay={240}>
          <a href={`mailto:${EMAIL}`} className="pf-link" style={{
            display: "inline-block", fontFamily: "var(--font-mono)",
            fontSize: "clamp(20px, 3cqi, 34px)", fontWeight: 700, marginBottom: 44,
          }}>{EMAIL}</a>
        </Reveal>

        <div className="flex flex-wrap items-end justify-between" style={{ gap: 32 }}>
          <div className="flex flex-wrap" style={{ gap: "32px 56px" }}>
            {CONTACT_DETAILS.map((c, i) => (
              <Reveal key={c.label} delay={300 + i * 80}>
                <div>
                  <div className="pf-meta" style={{ marginBottom: 6 }}>{c.label}</div>
                  {c.href ? (
                    <a href={c.href} {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--pf-accent)", wordBreak: "break-word", textDecoration: "underline" }}>{c.value}</a>
                  ) : (
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--pf-text)", wordBreak: "break-word" }}>{c.value}</div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={540}>
            <PixelButton href={`mailto:${EMAIL}`} accent>Start a Project →</PixelButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  const toTop = useCallback(() => {
    document.querySelector(".portfolio-root")?.closest(".overflow-auto")?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <footer style={{ background: "var(--pf-bg)", borderTop: "1px solid var(--pf-line)" }}>
      <div className="section-inner" style={{ paddingTop: "clamp(40px, 6cqi, 72px)", paddingBottom: "clamp(40px, 6cqi, 72px)" }}>
        <div className="flex flex-wrap items-center justify-between" style={{ gap: 24, marginBottom: 40 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(28px, 5cqi, 52px)", fontWeight: 700, color: "var(--pf-text)" }}>
            Obaida<span style={{ color: "var(--pf-accent)" }}>.</span>
          </div>
          <PixelButton onClick={toTop}>Back to top ↑</PixelButton>
        </div>
        <div className="flex flex-wrap items-center justify-between" style={{
          gap: 16, paddingTop: 24, borderTop: "1px solid var(--pf-line)",
        }}>
          <span className="pf-meta">© 2024–2026 Obaida — Video / Design</span>
          <span className="pf-meta">Crafted frame by frame</span>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Root
   ═══════════════════════════════════════════════════════════════ */

export default function Portfolio() {
  return (
    <div className="portfolio-root" style={{
      background: "var(--pf-bg)", color: "var(--pf-text)",
      fontFamily: "var(--font-mono)", fontSize: 14, lineHeight: 1.5,
      containerType: "inline-size",
    }}>
      <HeroSection />
      <PortfolioNav />
      <MarqueeSection />
      <AboutSection />
      <WorkSection />
      <VideosSection />
      <CapabilitiesSection />
      <JourneySection />
      <ContactSection />
      <FooterSection />
    </div>
  );
}
