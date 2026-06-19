"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   Hoisted static data — react: rendering-hoist-jsx
   ═══════════════════════════════════════════════════════════════ */

const STATS = [
  { value: "2024", label: "Started" },
  { value: "2026", label: "Went Viral" },
  { value: "3", label: "Niches" },
];

const EDIT_HISTORY = [
  { tc: "00:00:00", year: "2022", title: "Started Learning", desc: "Self-taught video editing journey begins. Discovered the power of short-form content." },
  { tc: "00:01:30", year: "2024", title: "First Publish", desc: "Released first professional edits. Built a growing portfolio of viral-ready clips." },
  { tc: "00:03:00", year: "2026", title: "The Breakthrough", desc: "Content went viral. Portfolio design services launched. No looking back." },
];

const SKILLS = [
  { label: "Video Editing", value: 70 },
  { label: "Motion Graphics", value: 80 },
  { label: "Portfolio Design", value: 88 },
  { label: "Social Media", value: 63 },
];

const SPECIALTIES = ["Gaming Content", "Education Content", "Awareness Content"];

const PROJECTS = [
  { num: "01", title: "Visual FX Edit", cat: "Gaming · FX · Viral", dur: "0:47" },
  { num: "02", title: "Motion Typography", cat: "Type · Motion · Design", dur: "1:23" },
  { num: "03", title: "Character Story", cat: "Animation · Story · Anime", dur: "2:15" },
];

const CONTACT_INFO = [
  { label: "EMAIL", value: "technecal23@gmail.com" },
  { label: "PHONE", value: "+966 56 620 7480" },
  { label: "YOUTUBE", value: "@festeara-24 / Obaida" },
];

const RENDER_LOG_LINES = [
  { icon: "✓", text: "Render Complete" },
  { icon: "✓", text: "Quality: Maximum" },
  { icon: "✓", text: "Format: Your Vision.mp4" },
];

/* ═══════════════════════════════════════════════════════════════
   Hooks
   ═══════════════════════════════════════════════════════════════ */

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ═══════════════════════════════════════════════════════════════
   Layout primitives
   ═══════════════════════════════════════════════════════════════ */

function Section({ bg, children, id }: { bg: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} style={{ background: bg }}>
      <div className="section-inner" style={{ margin: "0 auto" }}>{children}</div>
    </section>
  );
}

function SectionHead({ label, title, tc, dark = false }: {
  label: string; title: string; tc?: string; dark?: boolean;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="flex items-center flex-wrap" style={{ gap: 10, marginBottom: 8 }}>
        <span className="font-bold uppercase section-label" style={{
          fontSize: 11, letterSpacing: "0.18em", color: "var(--color-dusty-rose)",
        }}>{label}</span>
        {tc ? (
          <span style={{
            fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700,
            color: "var(--color-storm-lighter)", letterSpacing: "0.08em",
            padding: "2px 7px", border: "1px solid var(--color-storm-light)",
            background: dark ? "rgba(17,19,24,0.06)" : "rgba(255,255,255,0.05)",
          }}>TC {tc}</span>
        ) : null}
      </div>
      <TypingTitle text={title} dark={dark} />
    </div>
  );
}

function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : "translateY(20px)",
      transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

function TypingTitle({ text, dark = false }: { text: string; dark?: boolean }) {
  const textRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const { ref, visible } = useReveal();
  const typed = useRef(false);

  useEffect(() => {
    if (!visible || typed.current || !textRef.current) return;
    typed.current = true;
    const el = textRef.current;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      el.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(iv);
        if (cursorRef.current) cursorRef.current.style.display = "none";
      }
    }, 45);
    return () => clearInterval(iv);
  }, [visible, text]);

  return (
    <div ref={ref} className="section-title" style={{
      fontFamily: "var(--font-display)", fontSize: 34, lineHeight: 1.15, minHeight: "1.2em",
      color: dark ? "var(--color-blue-slate)" : "var(--color-blush-white)",
    }}>
      <span ref={textRef} />
      <span ref={cursorRef} style={{ color: "var(--color-dusty-rose)", animation: "blink 0.7s step-end infinite" }}>_</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Reusable UI components
   ═══════════════════════════════════════════════════════════════ */

function RetroCard({ title, children, dark = true, className = "" }: {
  title: string; children: React.ReactNode; dark?: boolean; className?: string;
}) {
  const [minimized, setMinimized] = useState(false);
  const toggle = useCallback(() => setMinimized(m => !m), []);

  return (
    <div className={className} style={{
      border: "2px solid var(--color-blue-slate)",
      boxShadow: "4px 4px 0 var(--color-blue-slate)",
      background: dark ? "var(--color-storm)" : "var(--color-blush-white)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <div className="flex items-center justify-between select-none" style={{
        height: 26, padding: "0 8px", background: "var(--color-dusty-rose)",
        borderBottom: "2px solid var(--color-blue-slate)",
        fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
        color: "var(--color-blush-white)",
      }}>
        <span className="truncate">{title}</span>
        <div className="flex gap-1 shrink-0">
          <button
            className="w-[11px] h-[11px] border border-[var(--color-blue-slate)]"
            style={{ background: "var(--color-blush-white)", cursor: "pointer" }}
            onClick={toggle}
            title={minimized ? "Restore" : "Minimize"}
          />
          <div className="w-[11px] h-[11px] border border-[var(--color-blue-slate)]" style={{ background: "var(--color-blush-white)" }} />
          <div className="w-[11px] h-[11px] border border-[var(--color-blue-slate)]" style={{ background: "var(--color-rose-darker)" }} />
        </div>
      </div>
      {minimized ? null : (
        <div className="card-body" style={{ padding: 18, flex: 1, color: dark ? "var(--color-blush-white)" : "var(--color-storm)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="badge-item" style={{
      fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
      padding: "4px 10px", color: "var(--color-dusty-rose)",
      border: "1px solid var(--color-dusty-rose)", boxShadow: "2px 2px 0 var(--color-blue-slate)",
      display: "inline-flex", whiteSpace: "nowrap", background: "rgba(201,122,138,0.06)",
    }}>{children}</span>
  );
}

function TrackButton({ children, href, onClick }: {
  children: React.ReactNode; href?: string; onClick?: () => void;
}) {
  const btnRef = useRef<HTMLElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 2;
    const y = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * 2;
    el.style.transform = `translate(${-x}px, ${-y}px)`;
    el.style.boxShadow = `${x * 3}px ${y * 3}px 0 var(--color-rose-darker)`;
  }, []);
  const onLeave = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    el.style.transform = "";
    el.style.boxShadow = "3px 3px 0 var(--color-rose-darker)";
  }, []);

  const style: React.CSSProperties = {
    fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.05em", padding: "12px 26px", cursor: "pointer",
    border: "2px solid var(--color-blue-slate)", display: "inline-flex",
    alignItems: "center", justifyContent: "center", textDecoration: "none", whiteSpace: "nowrap",
    background: "var(--color-dusty-rose)", color: "var(--color-blush-white)",
    boxShadow: "3px 3px 0 var(--color-rose-darker)",
    transition: "box-shadow 120ms ease, transform 120ms ease",
  };
  const Tag = (href ? "a" : "button") as "a";
  return (
    <Tag ref={btnRef as never} style={style} href={href} onClick={onClick}
      onMouseMove={onMove} onMouseLeave={onLeave}>{children}</Tag>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  const { ref, visible } = useReveal();
  const [cur, setCur] = useState(0);
  const animated = useRef(false);

  useEffect(() => {
    if (!visible || animated.current) return;
    animated.current = true;
    let c = 0;
    const step = Math.max(1, Math.ceil(value / 25));
    const id = setInterval(() => {
      c = Math.min(c + step, value);
      setCur(c);
      if (c >= value) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [visible, value]);

  return (
    <div ref={ref} className="progress-row" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span className="font-bold uppercase progress-label" style={{
        fontSize: 11, letterSpacing: "0.05em", minWidth: 110, whiteSpace: "nowrap",
      }}>{label}</span>
      <div className="flex-1 relative overflow-hidden" style={{
        height: 20, background: "var(--color-blue-slate)", border: "2px solid var(--color-storm-light)",
      }}>
        <div className="h-full flex items-center justify-end" style={{
          width: `${cur}%`, paddingRight: 6, background: "var(--color-dusty-rose)",
          transition: "width 0.04s linear",
          animation: cur >= value ? "progressPulse 2s ease-in-out infinite" : "none",
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{Math.round(cur)}%</span>
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "repeating-linear-gradient(90deg, transparent 0 4px, rgba(0,0,0,0.12) 4px 5px)",
        }} />
      </div>
    </div>
  );
}

function Timecode({ code, className = "" }: { code: string; className?: string }) {
  return (
    <span className={className} style={{
      fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 700,
      letterSpacing: "0.06em", color: "var(--color-storm-lighter)",
    }}>{code}</span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Sections — each grounded in video editing language
   ═══════════════════════════════════════════════════════════════ */

function HeroSection() {
  const handleShowreel = useCallback(() => {
    const el = document.getElementById("showreel");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section
      className="hero-section relative overflow-hidden flex flex-col items-center justify-center text-center"
      style={{ background: "linear-gradient(180deg, #1C2028 0%, #111318 100%)", padding: "64px 28px 72px" }}
    >
      {/* CSS-only film grain — no canvas */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.35 }}>
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" /></filter>
        </svg>
        <div style={{ width: "100%", height: "100%", filter: "url(#grain)", opacity: 0.08 }} />
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%)",
      }} />

      {/* Signature: Preview monitor overlays */}
      <div className="absolute top-3 left-4 pointer-events-none select-none" style={{
        fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 700,
        color: "var(--color-dusty-rose)", opacity: 0.55, letterSpacing: "0.1em",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: "#e74c3c",
            animation: "recBlink 1.2s ease-in-out infinite",
          }} />
          REC
        </span>
      </div>
      <div className="absolute top-3 right-4 pointer-events-none select-none" style={{
        fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 700,
        color: "var(--color-storm-lighter)", opacity: 0.5, letterSpacing: "0.1em",
      }}>
        1080p · 60fps
      </div>

      <div className="relative flex flex-col items-center">
        <Reveal>
          <div style={{
            padding: "18px 34px", marginBottom: 22,
            background: "radial-gradient(ellipse at center, rgba(201,122,138,0.28) 0%, rgba(201,122,138,0.05) 55%, transparent 75%)",
            borderRadius: 12,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="hero-logo"
              src="/assets/logo-glow.png"
              alt="Obaida"
              style={{ width: 168, height: "auto", display: "block", imageRendering: "auto" }}
            />
          </div>
        </Reveal>
        <Reveal delay={150}>
          <div className="font-bold uppercase hero-subtitle" style={{
            fontSize: 11, letterSpacing: "0.22em", color: "var(--color-dusty-rose)", marginBottom: 18,
          }}>
            Video Editing / Portfolio Design
          </div>
        </Reveal>
        <Reveal delay={300}>
          <div className="badge-row flex flex-wrap justify-center" style={{ gap: 10, marginBottom: 30, maxWidth: 420 }}>
            <Badge>Awareness Content</Badge>
            <Badge>Gaming Content</Badge>
            <Badge>Education Content</Badge>
          </div>
        </Reveal>
        <Reveal delay={450}>
          <TrackButton onClick={handleShowreel}>View Showreel</TrackButton>
        </Reveal>
      </div>

      {/* Signature: Playhead bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: 3 }}>
        <div style={{
          height: "100%", width: "100%",
          background: "linear-gradient(90deg, var(--color-dusty-rose) 0%, var(--color-rose-dark) 40%, transparent 70%)",
          opacity: 0.6,
        }} />
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <Section bg="var(--color-blush-white)">
      <SectionHead label="Source Material" title="Who We Are" tc="00:00:30" dark />
      <Reveal delay={150}>
        <RetroCard title="source_material.mov">
          <p style={{ fontSize: 13, lineHeight: 1.7 }}>
            Obaida is a short-form video editor and portfolio designer who builds content that performs.
            Self-taught since 2024, he mastered the one thing most creators ignore: why people stop scrolling.
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.7, marginTop: 12 }}>
            He focuses on videos under 3 minutes — viral gaming edits, education content that lands,
            and awareness clips with no wasted second.
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, marginTop: 16, color: "var(--color-dusty-rose)" }}>
            No templates. No filler. Just work that gets seen.
          </p>
        </RetroCard>
      </Reveal>
      <Reveal delay={300}>
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 18 }}>
          {STATS.map(s => (
            <div key={s.label} className="stat-card" style={{
              border: "2px solid var(--color-blue-slate)", boxShadow: "3px 3px 0 var(--color-blue-slate)",
              background: "var(--color-storm)", padding: "16px 12px", textAlign: "center",
            }}>
              <div className="stat-value" style={{ fontSize: 26, fontWeight: 700, color: "var(--color-dusty-rose)" }}>{s.value}</div>
              <div className="uppercase" style={{ fontSize: 10, letterSpacing: "0.06em", marginTop: 4, color: "var(--color-storm-lighter)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

function StorySection() {
  return (
    <section style={{ background: "var(--color-storm)" }}>
      <div className="section-inner" style={{ margin: "0 auto" }}>
        <SectionHead label="Edit History" title="The Timeline" tc="00:01:00" />

        {/* Timeline track — styled as NLE clip stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {EDIT_HISTORY.map((e, i) => (
            <Reveal key={i} delay={i * 150}>
              <div style={{
                display: "flex", overflow: "hidden",
                border: "2px solid var(--color-storm-light)",
                background: "var(--color-blue-slate)",
              }}>
                {/* Clip color label — left edge like Premiere Pro clip colors */}
                <div style={{
                  width: 5, flexShrink: 0,
                  background: "var(--color-dusty-rose)",
                }} />

                <div style={{ flex: 1, padding: "14px 16px" }}>
                  {/* Clip header with year and timecode */}
                  <div className="flex items-center justify-between flex-wrap" style={{ gap: 8, marginBottom: 6 }}>
                    <div className="flex items-center" style={{ gap: 10 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: "var(--color-dusty-rose)" }}>{e.year}</span>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{e.title}</span>
                    </div>
                    <Timecode code={e.tc} />
                  </div>

                  {/* Clip body */}
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-storm-lighter)" }}>{e.desc}</div>

                  {/* Clip waveform decoration — subtle visual texture */}
                  <div style={{
                    marginTop: 10, height: 8, opacity: 0.15, overflow: "hidden",
                    backgroundImage: "repeating-linear-gradient(90deg, var(--color-dusty-rose) 0 2px, transparent 2px 4px, var(--color-dusty-rose) 4px 5px, transparent 5px 8px, var(--color-dusty-rose) 8px 9px, transparent 9px 12px)",
                    backgroundSize: "12px 100%",
                    maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
                    WebkitMaskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
                  }} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkillsSection() {
  return (
    <Section bg="var(--color-blush-white)">
      <SectionHead label="Render Queue" title="Experience & Skills" tc="00:02:00" dark />
      <div className="two-col-grid">
        <Reveal delay={150}>
          <RetroCard title="render_queue.exe" className="h-full">
            <div className="flex flex-col" style={{ gap: 14 }}>
              {SKILLS.map(s => <ProgressBar key={s.label} label={s.label} value={s.value} />)}
            </div>
          </RetroCard>
        </Reveal>
        <Reveal delay={300}>
          <RetroCard title="export_presets.cfg" className="h-full">
            <div className="flex flex-col" style={{ gap: 10 }}>
              {SPECIALTIES.map(s => (
                <div key={s} className="flex items-center" style={{
                  gap: 12, padding: "11px 14px", background: "var(--color-storm-light)",
                  boxShadow: "inset 2px 2px 0 #4A5060, inset -2px -2px 0 var(--color-blue-slate)",
                }}>
                  <div className="shrink-0" style={{ width: 8, height: 8, background: "var(--color-dusty-rose)" }} />
                  <span className="font-bold uppercase" style={{ fontSize: 12, letterSpacing: "0.04em" }}>{s}</span>
                </div>
              ))}
            </div>
          </RetroCard>
        </Reveal>
      </div>
    </Section>
  );
}

function PortfolioSection() {
  return (
    <Section bg="var(--color-storm)" id="showreel">
      <SectionHead label="Clip Bin" title="Projects & Showreel" tc="00:03:00" />
      <div className="projects-grid">
        {PROJECTS.map((p, i) => (
          <Reveal key={p.num} delay={i * 120}>
            <RetroCard title={`project_${p.num}.mp4`} className="h-full">
              <div className="flex items-center justify-center group relative" style={{
                height: 120, marginBottom: 14, cursor: "pointer",
                background: "var(--color-blue-slate)", border: "1px solid var(--color-storm-light)",
              }}>
                {/* Play triangle */}
                <div className="transition-opacity group-hover:opacity-90" style={{
                  width: 0, height: 0, opacity: 0.45,
                  borderLeft: "20px solid var(--color-dusty-rose)",
                  borderTop: "13px solid transparent", borderBottom: "13px solid transparent",
                }} />
                {/* Duration stamp — like a clip thumbnail in a bin */}
                <div className="absolute bottom-1 right-2" style={{
                  fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 700,
                  color: "var(--color-blush-white)", background: "rgba(0,0,0,0.6)",
                  padding: "1px 5px", letterSpacing: "0.04em",
                }}>{p.dur}</div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{p.title}</div>
              <div className="uppercase" style={{ fontSize: 11, letterSpacing: "0.04em", marginTop: 4, color: "var(--color-storm-lighter)" }}>{p.cat}</div>
            </RetroCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function ContactSection() {
  return (
    <Section bg="var(--color-blush-white)">
      <SectionHead label="Export" title="Get in Touch" tc="00:04:30" dark />
      <Reveal delay={100}>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-storm)", marginBottom: 24 }}>
          Ready to take your content to the next level? Let&apos;s create something worth watching.
        </p>
      </Reveal>
      <div className="two-col-grid">
        <Reveal delay={200}>
          <RetroCard title="export_settings.cfg" className="h-full">
            <div className="flex flex-col" style={{ gap: 16 }}>
              {CONTACT_INFO.map(c => (
                <div key={c.label}>
                  <div className="font-bold uppercase" style={{
                    fontSize: 11, letterSpacing: "0.1em", marginBottom: 4, color: "var(--color-dusty-rose)",
                  }}>{c.label}</div>
                  <div style={{ fontSize: 13, wordBreak: "break-all" }}>{c.value}</div>
                </div>
              ))}
            </div>
          </RetroCard>
        </Reveal>
        <Reveal delay={350}>
          <RetroCard title="render_complete.log" className="h-full">
            <RenderComplete />
          </RetroCard>
        </Reveal>
      </div>
    </Section>
  );
}

function RenderComplete() {
  const { ref, visible } = useReveal();
  const [lines, setLines] = useState(0);
  const animated = useRef(false);

  useEffect(() => {
    if (!visible || animated.current) return;
    animated.current = true;
    let count = 0;
    const id = setInterval(() => {
      count++;
      setLines(count);
      if (count >= RENDER_LOG_LINES.length + 1) clearInterval(id);
    }, 400);
    return () => clearInterval(id);
  }, [visible]);

  return (
    <div ref={ref} style={{ padding: "12px 4px", minHeight: 200 }}>
      {/* Render log lines — appears like a terminal render log */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 2.2 }}>
        {RENDER_LOG_LINES.map((line, i) => (
          <div key={i} style={{
            opacity: lines > i ? 1 : 0,
            transform: lines > i ? "none" : "translateX(-8px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
            color: "var(--color-dusty-rose)",
          }}>
            <span style={{ marginRight: 8 }}>[{line.icon}]</span>
            {line.text}
          </div>
        ))}
      </div>

      {/* Thank you message — appears after log lines */}
      <div style={{
        marginTop: 20, paddingTop: 16,
        borderTop: lines > RENDER_LOG_LINES.length ? "1px dashed var(--color-storm-light)" : "1px dashed transparent",
        opacity: lines > RENDER_LOG_LINES.length ? 1 : 0,
        transform: lines > RENDER_LOG_LINES.length ? "none" : "translateY(10px)",
        transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s, border-color 0.3s ease",
      }}>
        <p style={{ fontSize: 13, lineHeight: 1.8, color: "var(--color-blush-white)", margin: 0, marginBottom: 8 }}>
          Thank you for trusting us with your vision.
          Every frame crafted with care and precision.
        </p>
        <div style={{
          fontSize: 13, fontWeight: 700, color: "var(--color-dusty-rose)",
          fontFamily: "var(--font-mono)",
        }}>
          — Obaida
        </div>
      </div>
    </div>
  );
}

function FooterSection() {
  return (
    <footer style={{
      background: "var(--color-storm)", borderTop: "2px solid var(--color-storm-light)", padding: "20px 28px",
    }}>
      <div className="section-inner" style={{ margin: "0 auto" }}>
        {/* Film strip sprocket holes */}
        <div className="flex overflow-hidden" style={{ gap: 4, marginBottom: 16 }}>
          {Array.from({ length: 40 }, (_, i) => (
            <div key={i} className="shrink-0" style={{
              width: 16, height: 10, opacity: 0.2, border: "2px solid var(--color-dusty-rose)",
            }} />
          ))}
        </div>
        <div className="footer-bottom flex justify-between items-center uppercase" style={{
          fontSize: 11, letterSpacing: "0.06em", color: "var(--color-storm-lighter)",
        }}>
          <span>Obaida — Video / Design</span>
          <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
            Total Runtime: 00:05:00
          </span>
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
      background: "var(--color-blue-slate)", color: "var(--color-blush-white)",
      fontFamily: "var(--font-mono)", fontSize: 14, lineHeight: 1.5,
      containerType: "inline-size",
    }}>
      <HeroSection />
      <AboutSection />
      <StorySection />
      <SkillsSection />
      <PortfolioSection />
      <ContactSection />
      <FooterSection />
    </div>
  );
}
