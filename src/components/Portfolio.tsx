"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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

/* ───────────────────────── Layout primitives ───────────────────────── */

function Section({ bg, children, id }: { bg: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} style={{ background: bg }}>
      <div className="section-inner" style={{ maxWidth: 640, margin: "0 auto", padding: "52px 28px" }}>
        {children}
      </div>
    </section>
  );
}

function SectionHead({ label, title, dark = false }: { label: string; title: string; dark?: boolean }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="font-bold uppercase section-label" style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--color-dusty-rose)", marginBottom: 8 }}>
        {label}
      </div>
      <TypingTitle text={title} dark={dark} />
    </div>
  );
}

/* ───────────────────────── Hooks & effects ───────────────────────── */

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reveal = () => setVisible(true);
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { reveal(); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    const fb = setTimeout(() => {
      const r = el.getBoundingClientRect();
      if (r.top < (window.innerHeight || 800) + 120) reveal();
    }, 1200);
    return () => { obs.disconnect(); clearTimeout(fb); };
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
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
      if (i >= text.length) { clearInterval(iv); if (cursorRef.current) cursorRef.current.style.display = "none"; }
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

/* ───────────────────────── Reusable UI ───────────────────────── */

function RetroCard({ title, children, dark = true, className = "" }: { title: string; children: React.ReactNode; dark?: boolean; className?: string }) {
  const [minimized, setMinimized] = useState(false);
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
          <button className="w-[11px] h-[11px] border border-[var(--color-blue-slate)]"
            style={{ background: "var(--color-blush-white)", cursor: "pointer" }}
            onClick={() => setMinimized(m => !m)} title={minimized ? "Restore" : "Minimize"} />
          <div className="w-[11px] h-[11px] border border-[var(--color-blue-slate)]" style={{ background: "var(--color-blush-white)" }} />
          <div className="w-[11px] h-[11px] border border-[var(--color-blue-slate)]" style={{ background: "var(--color-rose-darker)" }} />
        </div>
      </div>
      {!minimized && (
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

function TrackButton({ children, href, onClick }: { children: React.ReactNode; href?: string; onClick?: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 2;
    const y = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * 2;
    el.style.transform = `translate(${-x}px, ${-y}px)`;
    el.style.boxShadow = `${x * 3}px ${y * 3}px 0 var(--color-rose-darker)`;
  }, []);
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
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
  return <Tag ref={ref as never} style={style} href={href} onClick={onClick} onMouseMove={onMove} onMouseLeave={onLeave}>{children}</Tag>;
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
    const id = setInterval(() => { c = Math.min(c + step, value); setCur(c); if (c >= value) clearInterval(id); }, 40);
    return () => clearInterval(id);
  }, [visible, value]);
  return (
    <div ref={ref} className="progress-row" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span className="font-bold uppercase progress-label" style={{ fontSize: 11, letterSpacing: "0.05em", minWidth: 110, whiteSpace: "nowrap" }}>{label}</span>
      <div className="flex-1 relative overflow-hidden" style={{ height: 20, background: "var(--color-blue-slate)", border: "2px solid var(--color-storm-light)" }}>
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

/* ───────────────────────── Sections ───────────────────────── */

function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas?.parentElement) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId = 0;
    const resize = () => { canvas.width = canvas.parentElement!.offsetWidth; canvas.height = canvas.parentElement!.offsetHeight; };
    resize();
    const particles = Array.from({ length: 22 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      size: 2 + Math.floor(Math.random() * 3),
      vy: -0.12 - Math.random() * 0.32, vx: (Math.random() - 0.5) * 0.2,
      alpha: 0.12 + Math.random() * 0.35,
    }));
    let last = 0;
    const draw = (now: number) => {
      animId = requestAnimationFrame(draw);
      if (now - last < 66) return;
      last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = "#C97A8A";
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
        p.y += p.vy; p.x += p.vx;
        if (p.y < -p.size) { p.y = canvas.height + p.size; p.x = Math.random() * canvas.width; }
        if (p.x < -p.size) p.x = canvas.width; if (p.x > canvas.width) p.x = -p.size;
      }
    };
    animId = requestAnimationFrame(draw);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, []);

  return (
    <section className="hero-section relative overflow-hidden flex flex-col items-center justify-center text-center"
      style={{ background: "linear-gradient(180deg, #1C2028 0%, #111318 100%)", padding: "64px 28px 72px" }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%)" }} />

      <div className="relative flex flex-col items-center">
        <Reveal>
          <div style={{
            padding: "18px 34px", marginBottom: 22,
            background: "radial-gradient(ellipse at center, rgba(201,122,138,0.28) 0%, rgba(201,122,138,0.05) 55%, transparent 75%)",
            borderRadius: 12,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="hero-logo" src="/assets/logo-glow.png" alt="Obaida" style={{ width: 168, height: "auto", display: "block", animation: "logoGlow 3s ease-in-out infinite", imageRendering: "auto" }} />
          </div>
        </Reveal>
        <Reveal delay={150}>
          <div className="font-bold uppercase hero-subtitle" style={{ fontSize: 11, letterSpacing: "0.22em", color: "var(--color-dusty-rose)", marginBottom: 18 }}>
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
          <TrackButton onClick={() => {
            const el = document.getElementById("showreel");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}>View Showreel</TrackButton>
        </Reveal>
      </div>
    </section>
  );
}

function AboutSection() {
  const stats = [["2024", "Started"], ["2026", "Went Viral"], ["3", "Niches"]] as const;
  return (
    <Section bg="var(--color-blush-white)">
      <SectionHead label="About Us" title="Who We Are" dark />
      <Reveal delay={150}>
        <RetroCard title="about.mov">
          <p style={{ fontSize: 13, lineHeight: 1.7 }}>Obaida is a short-form video editor and portfolio designer who builds content that performs. Self-taught since 2024, he mastered the one thing most creators ignore: why people stop scrolling.</p>
          <p style={{ fontSize: 13, lineHeight: 1.7, marginTop: 12 }}>He focuses on videos under 3 minutes — viral gaming edits, education content that lands, and awareness clips with no wasted second.</p>
          <p style={{ fontSize: 14, fontWeight: 700, marginTop: 16, color: "var(--color-dusty-rose)" }}>No templates. No filler. Just work that gets seen.</p>
        </RetroCard>
      </Reveal>
      <Reveal delay={300}>
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 18 }}>
          {stats.map(([val, lab]) => (
            <div key={lab} className="stat-card" style={{
              border: "2px solid var(--color-blue-slate)", boxShadow: "3px 3px 0 var(--color-blue-slate)",
              background: "var(--color-storm)", padding: "16px 12px", textAlign: "center",
            }}>
              <div className="stat-value" style={{ fontSize: 26, fontWeight: 700, color: "var(--color-dusty-rose)" }}>{val}</div>
              <div className="uppercase" style={{ fontSize: 10, letterSpacing: "0.06em", marginTop: 4, color: "var(--color-storm-lighter)" }}>{lab}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

function StorySection() {
  const events = [
    { year: "2022", title: "Started Learning", desc: "Self-taught video editing journey begins. Discovered the power of short-form content." },
    { year: "2024", title: "First Publish", desc: "Released first professional edits to the world. Built a growing portfolio of viral-ready clips." },
    { year: "2026", title: "The Breakthrough", desc: "Content went viral. Portfolio design services launched. No looking back." },
  ];
  return (
    <section style={{ background: "var(--color-storm)" }}>
      <div style={{ padding: "52px 28px" }}>
      <SectionHead label="Timeline" title="Obaida's Story" />
      <div className="relative" style={{ paddingLeft: 34 }}>
        <div className="absolute" style={{ left: 14, top: 6, bottom: 6, width: 2, background: "var(--color-dusty-rose)" }} />
        {events.map((e, i) => (
          <Reveal key={i} delay={i * 150}>
            <div style={{ position: "relative", marginBottom: i === events.length - 1 ? 0 : 28 }}>
              <div className="absolute" style={{
                left: -27, top: 5, width: 12, height: 12, background: "var(--color-dusty-rose)",
                border: "2px solid var(--color-blush-white)", boxShadow: "0 0 8px rgba(201,122,138,0.5)",
              }} />
              <div className="timeline-year" style={{ fontSize: 22, fontWeight: 700, color: "var(--color-dusty-rose)" }}>{e.year}</div>
              <div className="timeline-title" style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{e.title}</div>
              <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.6, color: "var(--color-storm-lighter)" }}>{e.desc}</div>
            </div>
          </Reveal>
        ))}
      </div>
      </div>
    </section>
  );
}

function SkillsSection() {
  const skills = [
    { label: "Video Editing", value: 70 },
    { label: "Motion Graphics", value: 80 },
    { label: "Portfolio Design", value: 88 },
    { label: "Social Media", value: 63 },
  ];
  const specialties = ["Gaming Content", "Education Content", "Awareness Content"];
  return (
    <Section bg="var(--color-blush-white)">
      <SectionHead label="Skills" title="Experience & Skills" dark />
      <div className="two-col-grid">
        <Reveal delay={150}>
          <RetroCard title="editing_skills.reel" className="h-full">
            <div className="flex flex-col" style={{ gap: 14 }}>
              {skills.map(s => <ProgressBar key={s.label} label={s.label} value={s.value} />)}
            </div>
          </RetroCard>
        </Reveal>
        <Reveal delay={300}>
          <RetroCard title="specialties.mp4" className="h-full">
            <div className="flex flex-col" style={{ gap: 10 }}>
              {specialties.map(s => (
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
  const projects = [
    { num: "01", title: "Visual FX Edit", cat: "Gaming · FX · Viral" },
    { num: "02", title: "Motion Typography", cat: "Type · Motion · Design" },
    { num: "03", title: "Character Story", cat: "Animation · Story · Anime" },
  ];
  return (
    <Section bg="var(--color-storm)" id="showreel">
      <SectionHead label="Showreel" title="Projects & Portfolio" />
      <div className="projects-grid">
        {projects.map((p, i) => (
          <Reveal key={p.num} delay={i * 120}>
            <RetroCard title={`project_${p.num}.mp4`} className="h-full">
              <div className="flex items-center justify-center group" style={{
                height: 120, marginBottom: 14, cursor: "pointer",
                background: "var(--color-blue-slate)", border: "1px solid var(--color-storm-light)",
              }}>
                <div className="transition-opacity group-hover:opacity-90" style={{
                  width: 0, height: 0, opacity: 0.45,
                  borderLeft: "20px solid var(--color-dusty-rose)",
                  borderTop: "13px solid transparent", borderBottom: "13px solid transparent",
                }} />
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
  const info = [["EMAIL", "technecal23@gmail.com"], ["PHONE", "+966 56 620 7480"], ["YOUTUBE", "@festeara-24 / Obaida"]] as const;
  return (
    <Section bg="var(--color-blush-white)">
      <SectionHead label="Contact Us" title="Get in Touch" dark />
      <Reveal delay={100}>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-storm)", marginBottom: 24 }}>
          Ready to take your content to the next level? Let&apos;s create something worth watching.
        </p>
      </Reveal>
      <div className="two-col-grid">
        <Reveal delay={200}>
          <RetroCard title="contact_info.mov" className="h-full">
            <div className="flex flex-col" style={{ gap: 16 }}>
              {info.map(([l, v]) => (
                <div key={l}>
                  <div className="font-bold uppercase" style={{ fontSize: 11, letterSpacing: "0.1em", marginBottom: 4, color: "var(--color-dusty-rose)" }}>{l}</div>
                  <div style={{ fontSize: 13, wordBreak: "break-all" }}>{v}</div>
                </div>
              ))}
            </div>
          </RetroCard>
        </Reveal>
        <Reveal delay={350}>
          <RetroCard title="thank_you.letter" className="h-full">
            <ThankYouMail />
          </RetroCard>
        </Reveal>
      </div>
    </Section>
  );
}

function ThankYouMail() {
  const [phase, setPhase] = useState<"closed" | "opening" | "open">("closed");

  const handleClick = () => {
    if (phase !== "closed") return;
    setPhase("opening");
    setTimeout(() => setPhase("open"), 600);
  };

  return (
    <div className="flex flex-col items-center text-center" style={{ padding: "24px 12px", gap: 16, minHeight: 220 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-dusty-rose)", fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}>
        Thank You for Choosing Us
      </div>

      {phase === "closed" && (
        <button
          onClick={handleClick}
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 16, transition: "transform 0.2s",
            imageRendering: "pixelated",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {/* Pixelated mail envelope icon */}
          <svg width="80" height="64" viewBox="0 0 80 64" style={{ imageRendering: "pixelated" }}>
            {/* envelope body */}
            <rect x="4" y="16" width="72" height="44" rx="2" fill="#d4cfe8" stroke="#6366a0" strokeWidth="3" />
            {/* envelope shadow */}
            <rect x="4" y="52" width="72" height="8" rx="1" fill="#b8b3d0" />
            {/* envelope flap */}
            <polygon points="4,16 40,40 76,16" fill="#e8e4f4" stroke="#6366a0" strokeWidth="3" strokeLinejoin="round" />
            {/* stamp */}
            <rect x="56" y="22" width="14" height="12" fill="#f4a261" stroke="#e76f51" strokeWidth="2" rx="1" />
            <rect x="59" y="25" width="8" height="6" fill="#e76f51" rx="1" />
            {/* lines on envelope */}
            <line x1="12" y1="36" x2="36" y2="36" stroke="#9b97b8" strokeWidth="2" />
            <line x1="12" y1="42" x2="32" y2="42" stroke="#9b97b8" strokeWidth="2" />
            <line x1="12" y1="48" x2="28" y2="48" stroke="#9b97b8" strokeWidth="2" />
            {/* blue arrow swoop (like Outlook Express) */}
            <path d="M62,0 Q78,8 68,24" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <polygon points="65,22 72,26 68,17" fill="#3b82f6" />
            <path d="M18,64 Q2,56 12,40" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <polygon points="15,42 8,38 12,47" fill="#3b82f6" />
          </svg>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-storm-lighter)", marginTop: 8 }}>
            Click to open
          </div>
        </button>
      )}

      {phase === "opening" && (
        <div style={{
          width: 80, height: 64, position: "relative",
          animation: "mailOpen 0.6s ease-out forwards",
        }}>
          <svg width="80" height="64" viewBox="0 0 80 64" style={{ imageRendering: "pixelated" }}>
            <rect x="4" y="16" width="72" height="44" rx="2" fill="#d4cfe8" stroke="#6366a0" strokeWidth="3" />
            <rect x="4" y="52" width="72" height="8" rx="1" fill="#b8b3d0" />
            <polygon points="4,16 40,40 76,16" fill="#e8e4f4" stroke="#6366a0" strokeWidth="3" strokeLinejoin="round"
              style={{ transformOrigin: "40px 16px", animation: "flapOpen 0.4s ease-out forwards" }} />
          </svg>
        </div>
      )}

      {phase === "open" && (
        <div style={{ animation: "letterSlide 0.5s ease-out" }}>
          {/* Old paper letter */}
          <div style={{
            background: "linear-gradient(175deg, #f5f0e1, #ede7d4, #e8e0c8)",
            border: "2px solid #c4b99a",
            borderRadius: 4,
            padding: "20px 18px",
            maxWidth: 300,
            boxShadow: "2px 3px 0 rgba(0,0,0,0.15), inset 0 0 20px rgba(160,140,100,0.1)",
            imageRendering: "pixelated",
            position: "relative",
          }}>
            {/* Paper texture dots */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: 4, opacity: 0.08,
              backgroundImage: "repeating-conic-gradient(#000 0% 25%, transparent 0% 50%)",
              backgroundSize: "4px 4px",
            }} />
            {/* Torn top edge */}
            <div style={{
              position: "absolute", top: -2, left: 8, right: 8, height: 4,
              background: "repeating-linear-gradient(90deg, #f5f0e1 0 3px, transparent 3px 5px)",
            }} />

            <div style={{ fontSize: 14, fontFamily: "var(--font-display)", fontWeight: 700, color: "#6b4c3b", marginBottom: 12, textAlign: "left" }}>
              Dear Friend,
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.9, color: "#5a4a3a", fontFamily: "var(--font-mono)", textAlign: "left", margin: 0, marginBottom: 8 }}>
              Thank you for trusting us with your vision. It is a privilege to bring your ideas to life.
            </p>
            <p style={{ fontSize: 12, lineHeight: 1.9, color: "#5a4a3a", fontFamily: "var(--font-mono)", textAlign: "left", margin: 0, marginBottom: 8 }}>
              Every project we work on is crafted with care, passion, and dedication to excellence.
            </p>
            <p style={{ fontSize: 12, lineHeight: 1.9, color: "#5a4a3a", fontFamily: "var(--font-mono)", textAlign: "left", margin: 0, marginBottom: 14 }}>
              We look forward to creating something remarkable together.
            </p>
            <div style={{ borderTop: "1px dashed #c4b99a", paddingTop: 10 }}>
              <div style={{ fontSize: 12, fontFamily: "var(--font-display)", fontStyle: "italic", color: "#7a6652" }}>With gratitude,</div>
              <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#6b4c3b", marginTop: 2 }}>— Obaida</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FooterSection() {
  return (
    <footer style={{ background: "var(--color-storm)", borderTop: "2px solid var(--color-storm-light)", padding: "20px 28px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div className="flex overflow-hidden" style={{ gap: 4, marginBottom: 16 }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="shrink-0" style={{ width: 16, height: 10, opacity: 0.2, border: "2px solid var(--color-dusty-rose)" }} />
          ))}
        </div>
        <div className="footer-bottom flex justify-between items-center uppercase" style={{ fontSize: 11, letterSpacing: "0.06em", color: "var(--color-storm-lighter)" }}>
          <span>Obaida — Video / Design</span>
          <span>2024–2026</span>
        </div>
      </div>
    </footer>
  );
}
