"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";

/* ═══════════════════════════════════════════════════════════════
   Static data
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
const PORTFOLIOS = [
  {
    num: "01", tag: "Corporate", title: "IES-BIM",
    meta: "Web Design · Development · Branding",
    desc: "A professional corporate website for IES-BIM — clean layout, modern structure, built to convert.",
    url: "https://www.ies-bim.com/",
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

const NAV_LINKS = [
  { label: "HOME", to: "hero" },
  { label: "STUDIO", to: "studio" },
  { label: "JOURNEY", to: "journey" },
  { label: "PORTFOLIOS", to: "work" },
  { label: "VIDEOS", to: "videos" },
  { label: "SKILLS", to: "skills" },
  { label: "CONTACT", to: "contact" },
];

/* ═══════════════════════════════════════════════════════════════
   Reveal system
   ═══════════════════════════════════════════════════════════════ */

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
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : "translateY(20px)",
      transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Retro UI Primitives
   ═══════════════════════════════════════════════════════════════ */

function RetroButton({ children, href, onClick, variant = "default", size = "md" }: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "primary" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const pad = size === "sm" ? "6px 16px" : size === "lg" ? "14px 36px" : "10px 26px";
  const fontSize = size === "sm" ? 11 : size === "lg" ? 15 : 13;

  const styles: Record<string, React.CSSProperties> = {
    default: {
      background: "linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 40%, #1a1a1a 100%)",
      border: "2px solid",
      borderColor: "#5a5a5a #1a1a1a #1a1a1a #5a5a5a",
      color: "#c8c8c8",
      boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.1), 2px 2px 0 #000",
    },
    primary: {
      background: "linear-gradient(180deg, #b06070 0%, #8a3850 40%, #6e2840 100%)",
      border: "2px solid",
      borderColor: "#c07888 #3e1828 #3e1828 #c07888",
      color: "#ffe4e8",
      boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.15), 2px 2px 0 #000, 0 0 12px rgba(201,122,138,0.25)",
    },
    ghost: {
      background: "transparent",
      border: "1px solid rgba(201,122,138,0.3)",
      color: "#C97A8A",
      boxShadow: "none",
    },
  };

  const base: React.CSSProperties = {
    ...styles[variant],
    fontFamily: "var(--font-pixel)",
    fontSize,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    padding: pad,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
    whiteSpace: "nowrap",
    transition: "filter .15s, transform .1s",
    imageRendering: "pixelated" as const,
  };

  const Tag = (href ? "a" : "button") as "a";
  return (
    <Tag
      style={base}
      href={href}
      onClick={onClick}
      onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "translate(2px, 2px)"; }}
      onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "none"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "none"; }}
    >
      {children}
    </Tag>
  );
}

function SectionHeader({ index, label, title }: { index: string; label: string; title: string }) {
  return (
    <div style={{ marginBottom: "clamp(32px, 5cqi, 56px)" }}>
      <Reveal>
        <div className="retro-eyebrow flex items-center" style={{ gap: 10, marginBottom: 16 }}>
          <span style={{ color: "var(--retro-green)" }}>[{index}]</span>
          <span style={{ width: 40, height: 1, background: "var(--retro-green)", opacity: 0.3 }} />
          <span style={{ color: "var(--retro-dim)" }}>{label}</span>
        </div>
      </Reveal>
      <Reveal delay={100}>
        <h2 className="retro-h2">{title}</h2>
      </Reveal>
    </div>
  );
}

function Divider() {
  return (
    <div style={{
      height: 1,
      background: "linear-gradient(90deg, transparent, var(--retro-line) 20%, var(--retro-line) 80%, transparent)",
    }} />
  );
}

/* ═══════════════════════════════════════════════════════════════
   Navigation
   ═══════════════════════════════════════════════════════════════ */

function PortfolioNav({ onExit }: { onExit?: () => void }) {
  const [active, setActive] = useState("hero");
  const [scrolled, setScrolled] = useState(false);

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <nav className="retro-nav" data-scrolled={scrolled || undefined}>
      <div className="retro-nav-inner">
        {/* Exit button */}
        {onExit && (
          <button onClick={onExit} className="retro-nav-exit" title="Back to monitor">
            ◀ EXIT
          </button>
        )}
        {/* Brand Logo */}
        <div style={{ flex: "0 0 auto" }}>
          <img
            src="/assets/Logos/logo-glow.png"
            alt="Obaida"
            style={{ height: "clamp(28px, 3cqi, 38px)", width: "auto", display: "block", filter: "drop-shadow(0 0 6px rgba(201,122,138,0.4))" }}
          />
        </div>
        <div className="retro-nav-links">
          {NAV_LINKS.map((l) => (
            <button
              key={l.to}
              onClick={() => go(l.to)}
              className="retro-nav-btn"
              data-active={active === l.to || undefined}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
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
    <section id="hero" className="retro-section" style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
      {/* Retro grid bg */}
      <div className="absolute inset-0 pointer-events-none retro-grid-bg" />
      {/* Glow */}
      <div className="absolute pointer-events-none" style={{
        top: "-15%", right: "-8%", width: "50%", height: "60%",
        background: "radial-gradient(circle, rgba(201,122,138,0.06) 0%, transparent 65%)",
      }} />

      <div className="retro-container relative">
        {/* Top bar */}
        <div className="flex items-center justify-between" style={{ marginBottom: "clamp(40px, 7cqi, 80px)" }}>
          <img
            src="/assets/Logos/logo-glow.png"
            alt="Obaida"
            style={{ height: "clamp(36px, 4cqi, 56px)", width: "auto", display: "block", filter: "drop-shadow(0 0 12px rgba(201,122,138,0.5))", animation: "logoGlow 3s ease infinite" }}
          />
          <div className="retro-status-badge">
            <span className="retro-status-dot" />
            <span>AVAILABLE — 2026</span>
          </div>
        </div>

        <Reveal>
          <div className="retro-eyebrow" style={{ marginBottom: 20 }}>
            {">"} VIDEO EDITOR — PORTFOLIO DESIGNER
          </div>
        </Reveal>

        <Reveal delay={120}>
          <h1 className="retro-display" style={{ maxWidth: "16ch", marginBottom: 28 }}>
            Short-form video that makes people{" "}
            <span className="retro-highlight">stop scrolling.</span>
          </h1>
        </Reveal>

        <Reveal delay={240}>
          <p className="retro-lead" style={{ maxWidth: "54ch", marginBottom: 40 }}>
            Obaida crafts viral gaming edits, education content, and awareness clips —
            every frame engineered to hold attention. No templates. No filler.
          </p>
        </Reveal>

        <Reveal delay={360}>
          <div className="flex flex-wrap items-center" style={{ gap: 16 }}>
            <RetroButton onClick={goWork} variant="primary" size="lg">
              ▶ View Selected Work
            </RetroButton>
            <RetroButton onClick={goContact}>
              Get in touch
            </RetroButton>
          </div>
        </Reveal>

        {/* Stats */}
        <Reveal delay={480}>
          <div className="retro-stat-grid" style={{ marginTop: "clamp(48px, 8cqi, 88px)" }}>
            {HERO_STATS.map(s => (
              <div key={s.label} className="retro-stat-cell">
                <div className="retro-stat-value">{s.value}</div>
                <div className="retro-stat-label">{s.label}</div>
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
    <div className="retro-marquee-wrap">
      <div className="retro-marquee-track">
        {[0, 1].map(rep => (
          <span key={rep} className="inline-flex items-center" aria-hidden={rep === 1}>
            {MARQUEE_ITEMS.map(item => (
              <span key={item} className="inline-flex items-center">
                <span className="retro-marquee-item">{item}</span>
                <span style={{ width: 6, height: 6, background: "var(--retro-green)", opacity: 0.6, flexShrink: 0 }} />
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <section id="studio" className="retro-section">
      <div className="retro-container">
        <SectionHeader index="01" label="STUDIO" title="Who We Are" />
        <div className="retro-two-col">
          <div>
            <Reveal>
              <div className="retro-terminal-box">
                <div className="retro-terminal-header">
                  <span>■</span> system_info.exe
                </div>
                <div className="retro-terminal-body">
                  <p><span style={{ color: "var(--retro-green)" }}>{">"}</span> Name: Obaida</p>
                  <p><span style={{ color: "var(--retro-green)" }}>{">"}</span> Role: Video Editor</p>
                  <p><span style={{ color: "var(--retro-green)" }}>{">"}</span> Since: 2024</p>
                  <p><span style={{ color: "var(--retro-green)" }}>{">"}</span> Status: <span style={{ color: "var(--retro-amber)" }}>ACTIVE</span></p>
                </div>
              </div>
            </Reveal>
          </div>
          <div>
            <Reveal delay={120}>
              <p className="retro-lead" style={{ marginBottom: 18 }}>
                Self-taught since 2024, Obaida mastered the one thing most creators ignore:
                why people stop scrolling. The work lives under three minutes —
                tight, intentional, and made to perform.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <p style={{ fontFamily: "var(--font-pixel)", fontSize: 14, fontWeight: 700, color: "var(--retro-green)", lineHeight: 1.6 }}>
                {">"} No templates. No filler. Just work that gets seen._
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function PortfolioCard({ item, delay }: { item: typeof PORTFOLIOS[number]; delay: number }) {
  return (
    <Reveal delay={delay}>
      <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <article className="retro-card" style={{ maxWidth: 560 }}>
          <div className="retro-card-media" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="retro-card-tag">[{item.tag}]</div>
            <span className="retro-card-ghost-num">{item.num}</span>
            <div style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 10, zIndex: 1,
            }}>
              <span style={{
                width: 48, height: 48, borderRadius: "50%",
                border: "2px solid rgba(201,122,138,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(201,122,138,0.08)",
                fontSize: 20, color: "var(--retro-green)",
              }}>
                ↗
              </span>
              <span style={{
                fontFamily: "var(--font-pixel)", fontSize: 10,
                color: "var(--retro-dim)", letterSpacing: "0.12em",
              }}>
                VISIT SITE
              </span>
            </div>
          </div>
          <div className="retro-card-body">
            <div className="flex items-start justify-between" style={{ gap: 10, marginBottom: 8 }}>
              <h3 className="retro-card-title">{item.title}</h3>
              <span style={{ fontSize: 16, color: "var(--retro-dim)", flexShrink: 0 }}>↗</span>
            </div>
            <p className="retro-card-desc">{item.desc}</p>
            <div className="retro-card-meta">{item.meta}</div>
          </div>
        </article>
      </a>
    </Reveal>
  );
}

function WorkSection() {
  return (
    <section id="work" className="retro-section">
      <div className="retro-container">
        <SectionHeader index="03" label="PORTFOLIOS" title="Portfolios" />
        <div className="retro-work-grid">
          {PORTFOLIOS.map((item, i) => <PortfolioCard key={item.num} item={item} delay={i * 120} />)}
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
      <div className="retro-video-card">
        <div style={{ position: "relative", cursor: "pointer" }} onClick={toggle}>
          <video
            ref={vidRef}
            src={video.src}
            loop muted playsInline preload="metadata"
            onLoadedMetadata={seekThumb}
            onEnded={() => setPlaying(false)}
            style={{ width: "100%", display: "block", aspectRatio: "9/16", objectFit: "cover", background: "#000" }}
          />
          {!playing ? (
            <div className="retro-video-overlay">
              <div className="retro-video-play-btn">▶</div>
            </div>
          ) : (
            <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 6 }}>
              <button onClick={toggleMute} className="retro-video-ctrl">
                {muted ? "♪×" : "♪"}
              </button>
              <button onClick={goFullscreen} className="retro-video-ctrl">
                ⛶
              </button>
            </div>
          )}
        </div>
        <div style={{ padding: "12px 14px" }}>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: "var(--retro-green)", letterSpacing: "0.1em", marginBottom: 6 }}>
            [{video.tag.toUpperCase()}]
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "var(--retro-text)", direction: "rtl" }}>
            {video.title}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function VideosSection() {
  return (
    <section id="videos" className="retro-section">
      <div className="retro-container">
        <SectionHeader index="04" label="VIDEOS" title="Video Edits" />
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
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 12, color: "var(--retro-text)", letterSpacing: "0.05em" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--retro-green)" }}>{value}%</span>
      </div>
      <div className="retro-bar-track">
        <div className="retro-bar-fill" style={{ width: visible ? `${value}%` : "0%", transitionDelay: `${delay}ms` }} />
        <div className="retro-bar-segments" />
      </div>
    </div>
  );
}

function CapabilitiesSection() {
  return (
    <section id="skills" className="retro-section">
      <div className="retro-container">
        <SectionHeader index="05" label="CAPABILITIES" title="Experience & Skills" />
        <div className="retro-two-col">
          <Reveal delay={100}>
            <div>
              {CAPABILITIES.map((c, i) => (
                <CapabilityBar key={c.label} label={c.label} value={c.value} delay={i * 90} />
              ))}
            </div>
          </Reveal>
          <div>
            {SERVICES.map((s, i) => (
              <Reveal key={s.n} delay={160 + i * 90}>
                <div className="retro-service-row">
                  <span className="retro-service-num">[{s.n}]</span>
                  <div style={{ flex: 1 }}>
                    <div className="retro-service-label">{s.label}</div>
                    <div className="retro-service-note">{s.note}</div>
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
    <section id="journey" className="retro-section">
      <div className="retro-container">
        <SectionHeader index="02" label="JOURNEY" title="Obaida's Story" />
        <div className="retro-timeline">
          {JOURNEY.map((entry, i) => (
            <Reveal key={entry.year} delay={i * 150}>
              <div className="retro-timeline-node">
                <div className="retro-timeline-marker">
                  <span className="retro-timeline-diamond" />
                  {i < JOURNEY.length - 1 && <span className="retro-timeline-line" />}
                </div>
                <div className="retro-timeline-content">
                  <div className="retro-timeline-year">{entry.year}</div>
                  <div className="retro-timeline-title">{entry.title}</div>
                  <p className="retro-timeline-desc">{entry.desc}</p>
                </div>
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
    <section id="contact" className="retro-section" style={{ position: "relative", overflow: "hidden" }}>
      <div className="absolute pointer-events-none" style={{
        bottom: "-20%", left: "-10%", width: "50%", height: "70%",
        background: "radial-gradient(circle, rgba(201,122,138,0.05) 0%, transparent 65%)",
      }} />
      <div className="retro-container relative">
        <SectionHeader index="06" label="CONTACT" title="Get in Touch" />
        <Reveal delay={120}>
          <div className="retro-terminal-box" style={{ marginBottom: 36 }}>
            <div className="retro-terminal-header">
              <span>■</span> contact.exe
            </div>
            <div className="retro-terminal-body">
              <p style={{ marginBottom: 12 }}>
                <span style={{ color: "var(--retro-green)" }}>{">"}</span> Ready to start a project?
              </p>
              <p>
                <span style={{ color: "var(--retro-green)" }}>{">"}</span>{" "}
                <a href={`mailto:${EMAIL}`} className="retro-link">{EMAIL}</a>
              </p>
            </div>
          </div>
        </Reveal>

        <div className="flex flex-wrap" style={{ gap: "28px 48px", marginBottom: 36 }}>
          {CONTACT_DETAILS.map((c, i) => (
            <Reveal key={c.label} delay={200 + i * 80}>
              <div>
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: "var(--retro-dim)", letterSpacing: "0.12em", marginBottom: 6 }}>
                  [{c.label.toUpperCase()}]
                </div>
                {c.href ? (
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="retro-link"
                    style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}
                  >
                    {c.value}
                  </a>
                ) : (
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--retro-text)" }}>{c.value}</div>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={400}>
          <RetroButton href={`mailto:${EMAIL}`} variant="primary" size="lg">
            ▶ Start a Project
          </RetroButton>
        </Reveal>
      </div>
    </section>
  );
}

function FooterSection() {
  const toTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <footer className="retro-section" style={{ borderTop: "1px solid var(--retro-line)" }}>
      <div className="retro-container" style={{ paddingTop: "clamp(36px, 5cqi, 60px)", paddingBottom: "clamp(36px, 5cqi, 60px)" }}>
        <div className="flex flex-wrap items-center justify-between" style={{ gap: 20, marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: "clamp(24px, 4cqi, 40px)", fontWeight: 700, color: "var(--retro-text)" }}>
            OBAIDA<span style={{ color: "var(--retro-green)" }}>.</span>
          </div>
          <RetroButton onClick={toTop} size="sm">↑ BACK TO TOP</RetroButton>
        </div>
        <Divider />
        <div className="flex flex-wrap items-center justify-between" style={{ gap: 12, paddingTop: 20 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--retro-dim)", letterSpacing: "0.06em" }}>
            © 2024–2026 OBAIDA — VIDEO / DESIGN
          </span>
          <span style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: "var(--retro-dim)" }}>
            CRAFTED FRAME BY FRAME
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Root
   ═══════════════════════════════════════════════════════════════ */

function PortfolioComponent({ onExit }: { onExit?: () => void } = {}) {
  return (
    <div className="retro-root" style={{ containerType: "inline-size" }}>
      {/* CRT overlay effects */}
      <div className="retro-crt-overlay" />

      <PortfolioNav onExit={onExit} />
      <HeroSection />
      <Divider />
      <MarqueeSection />
      <Divider />
      <AboutSection />
      <Divider />
      <JourneySection />
      <Divider />
      <WorkSection />
      <Divider />
      <VideosSection />
      <Divider />
      <CapabilitiesSection />
      <Divider />
      <ContactSection />
      <FooterSection />
    </div>
  );
}

export default memo(PortfolioComponent);
