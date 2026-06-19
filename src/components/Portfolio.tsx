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

const WORK = [
  {
    num: "01", tag: "Gaming", title: "Viral Gaming Edits",
    meta: "FX · Pacing · Hooks", dur: "0:47",
    desc: "High-energy edits engineered to survive the first three seconds.",
  },
  {
    num: "02", tag: "Education", title: "Education That Lands",
    meta: "Clarity · Retention · Story", dur: "1:23",
    desc: "Complex ideas cut down to the moments people actually remember.",
  },
  {
    num: "03", tag: "Awareness", title: "Awareness Clips",
    meta: "Emotion · Message · Impact", dur: "2:15",
    desc: "Message-first storytelling with not a single wasted second.",
  },
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
  { label: "Email", value: "technecal23@gmail.com" },
  { label: "Phone", value: "+966 56 620 7480" },
  { label: "YouTube", value: "@festeara-24 / Obaida" },
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

function MagneticButton({ children, href, onClick }: {
  children: React.ReactNode; href?: string; onClick?: () => void;
}) {
  const btnRef = useRef<HTMLElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 4;
    const y = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * 4;
    el.style.transform = `translate(${x}px, ${y}px)`;
  }, []);
  const onLeave = useCallback(() => {
    const el = btnRef.current;
    if (el) el.style.transform = "";
  }, []);

  const style: React.CSSProperties = {
    fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.14em",
    padding: "16px 30px", cursor: "pointer", borderRadius: 2,
    border: "none", display: "inline-flex", alignItems: "center", gap: 10,
    textDecoration: "none", whiteSpace: "nowrap",
    background: "var(--pf-accent)", color: "#0B0D11",
    transition: "transform .25s cubic-bezier(.22,.61,.36,1), background .3s ease",
  };
  const Tag = (href ? "a" : "button") as "a";
  return (
    <Tag ref={btnRef as never} style={style} href={href} onClick={onClick}
      onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
      <span aria-hidden style={{ fontSize: 15 }}>→</span>
    </Tag>
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
    <section className="pf-hero relative overflow-hidden" style={{ background: "var(--pf-bg)" }}>
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
          <img src="/assets/logo-glow.png" alt="Obaida" style={{ width: "clamp(40px, 6cqi, 64px)", height: "auto" }} />
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
            <MagneticButton onClick={goWork}>View Selected Work</MagneticButton>
            <button onClick={goContact} className="pf-link" style={{
              background: "transparent", border: "none", cursor: "pointer",
              fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--pf-text)",
            }}>
              Get in touch
            </button>
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
    <section style={{ background: "var(--pf-bg)" }}>
      <div className="section-inner">
        <div className="pf-grid-2">
          <Reveal>
            <SectionLabel index="01" total="05" label="Studio" />
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
              <SectionLabel index="02" total="05" label="Selected Work" />
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
    <section style={{ background: "var(--pf-bg)", borderTop: "1px solid var(--pf-line)" }}>
      <div className="section-inner">
        <Reveal>
          <SectionLabel index="03" total="05" label="Capabilities" />
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

function JourneySection() {
  return (
    <section style={{ background: "var(--pf-bg)", borderTop: "1px solid var(--pf-line)" }}>
      <div className="section-inner">
        <Reveal>
          <SectionLabel index="04" total="05" label="Journey" />
        </Reveal>
        <Reveal delay={120}>
          <h2 className="pf-h2" style={{ color: "var(--pf-text)", marginTop: 18, marginBottom: "clamp(36px, 5cqi, 64px)" }}>
            Obaida&apos;s Story
          </h2>
        </Reveal>

        <div className="pf-grid-work">
          {JOURNEY.map((e, i) => (
            <Reveal key={e.year} delay={i * 120}>
              <div style={{ borderTop: "2px solid var(--pf-accent)", paddingTop: 22 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(36px, 5cqi, 56px)", fontWeight: 700, color: "var(--pf-text)", lineHeight: 1 }}>{e.year}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: "var(--pf-accent)", marginTop: 14, marginBottom: 8 }}>{e.title}</div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.65, color: "var(--pf-muted)" }}>{e.desc}</p>
              </div>
            </Reveal>
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
          <SectionLabel index="05" total="05" label="Contact" />
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
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--pf-text)", wordBreak: "break-word" }}>{c.value}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={540}>
            <MagneticButton href={`mailto:${EMAIL}`}>Start a Project</MagneticButton>
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
          <button onClick={toTop} className="pf-meta" style={{
            background: "transparent", border: "1px solid var(--pf-line)", cursor: "pointer",
            padding: "12px 18px", color: "var(--pf-muted)", display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            Back to top <span aria-hidden>↑</span>
          </button>
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
      <MarqueeSection />
      <AboutSection />
      <WorkSection />
      <CapabilitiesSection />
      <JourneySection />
      <ContactSection />
      <FooterSection />
    </div>
  );
}
