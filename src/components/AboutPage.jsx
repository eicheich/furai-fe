import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Coffee,
  Cpu,
  HeartHandshake,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';

const CREW_MEMBERS = [
  {
    id: 'eki',
    name: 'Eki (@ekishinta)',
    role: 'Chief Spine Officer & SRS Overlord',
    jpBadge: '企画・仕様',
    color: 'var(--yellow)',
    spineStatus: '74% Upright · 26% Boiled Shrimp during thesis review',
    bio: 'Drafted the 25-feature SRS with such extreme precision that even MediaPipe was afraid to drop frames. Believes tech-neck is the ultimate modern villain threatening SDG 3 (Health) and SDG 4 (Education).',
    quirk: 'Known to sprint through 25-minute Pomodoros while mentally calculating spine curvature angles.',
    stats: [
      { label: 'SRS SPECS WRITTEN', val: '25 Features' },
      { label: 'TYPING DISCIPLINE', val: '110 WPM' },
    ],
  },
  {
    id: 'husnu',
    name: 'Husnu',
    role: 'Frontend Architect & Anti-AI-Slop Specialist',
    jpBadge: 'デザイン・実装',
    color: 'var(--mint)',
    spineStatus: '84% Upright · Sustained purely by hatred for generic SaaS templates',
    bio: 'Refuses to let Furai look like another generic purple-gradient template. Banned emoji spam, fake chat bubbles, and 8px brutalist drop-shadows with extreme prejudice. Hand-aligned SVG shrimp coordinates by 0.5% increments until the composition harmonized.',
    quirk: 'Obsessively browses Japanese stationery and Shibuya design zines to find the exact shade of paper white (#f1f0eb).',
    stats: [
      { label: 'AI SLOP DETECTED', val: '0 Instances' },
      { label: 'PIXEL PRECISION', val: '100% SVG' },
    ],
  },
  {
    id: 'ebi',
    name: 'Ebi-san',
    role: 'Chief Slouch Mascot & Mascot of Disaster',
    jpBadge: '看板エビ',
    color: 'var(--shrimp)',
    spineStatus: '12% Upright · Anatomically lacks vertebrae (deep-fried)',
    bio: 'The unofficial spirit animal of late-night coders, thesis crammers, and Discord lurkers. Has no actual backbone, making him legally unqualified to offer orthopedic advice, yet remains the emotional anchor of this entire project.',
    quirk: 'Slowly curls into a crispy crescent whenever an npm build outputs 47 deprecation warnings.',
    stats: [
      { label: 'CRISPINESS LEVEL', val: 'Maximum' },
      { label: 'CHAIR SLUMP', val: 'Extreme' },
    ],
  },
  {
    id: 'mediapipe',
    name: 'MediaPipe Pose (Google)',
    role: 'The Unpaid WebAssembly Intern',
    jpBadge: '超高速推論',
    color: 'var(--sky)',
    spineStatus: '99.9% Upright · Pure mathematical tensor perfection',
    bio: 'Quietly lives inside your browser cache. Calculates 33 skeletal landmarks at 30 fps without ever asking for your credit card, your cookies, or sending a single byte of video to any corporate surveillance cloud.',
    quirk: 'Consumes exactly 0 bytes of external bandwidth once cached in your browser. A true saint.',
    stats: [
      { label: 'SERVER UPLOADS', val: '0 Bytes' },
      { label: 'INFERENCE SPEED', val: '~15-30 FPS' },
    ],
  },
];

const MILESTONES = [
  {
    time: '02:14 AM',
    title: 'The Fried Shrimp Revelation',
    desc: 'Someone looked in the bathroom mirror after a 6-hour coding streak and realized their spine resembled an unbattered tempura. The name "Furai" was immediately born.',
  },
  {
    time: 'Day 2',
    title: 'The Great Anti-Slop Rebellion',
    desc: 'Initial prototypes looked like a generic crypto dashboard with fire emojis and purple neon cards. The team staged a revolt, deleted all drop-shadows, and embraced Shibuya editorial aesthetics.',
  },
  {
    time: 'Day 3',
    title: '100% Local Privacy Proof',
    desc: 'Refused every temptation to add tracking analytics or cloud databases. Proved on DevTools Network tab that zero video frames leave the user’s laptop.',
  },
];

export default function AboutPage({ onOpenDemo }) {
  return (
    <div className="about-view">
      {/* Hero Banner */}
      <section className="about-hero">
        <div className="about-hero__inner">
          <p className="jp-label jp-label--light">（フライの真実と愉快な仲間たち）</p>
          <h1 className="about-hero__title">
            THE CHRONICLES<br />OF FURAI.
          </h1>
          <p className="about-hero__sub">
            The tragic comedy of late-night coding, ruined cervical spines, and the passionate crew
            building an anti-slouch companion that respects your privacy and your dignity.
          </p>

          <div className="about-hero__tags">
            <span className="about-tag">#EbiFurai</span>
            <span className="about-tag">#TechNeckEpidemic</span>
            <span className="about-tag">#ZeroServerUploads</span>
            <span className="about-tag">#NoAISlop</span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="about-content">
        {/* Section 1: The Origin Story */}
        <section className="about-section">
          <div className="card-staz card-staz--story">
            <span className="doodle-plus" style={{ top: 24, left: '18%' }}>+</span>
            <span className="doodle-plus" style={{ bottom: 28, right: '14%' }}>+</span>

            <div className="card-staz__head">
              <div>
                <p className="jp-label">（誕生の物語）</p>
                <h2 className="display">WHY FURAI?</h2>
              </div>
              <span className="story-chip">ORIGIN // 01</span>
            </div>

            <div className="story-grid">
              <div className="story-body">
                <p className="lead-text">
                  Have you ever caught your reflection on a black laptop screen during a late-night debugging sprint?
                </p>
                <p className="body">
                  Your chin is poking 14 cm forward. Your shoulders are curled inward like a terrified pangolin.
                  Your lower lumbar is performing an acrobatic arch that orthopedic surgeons write horror novels about.
                  In Japanese culinary terms: <strong>you have achieved full Ebi Furai (fried shrimp) morphology.</strong>
                </p>
                <p className="body">
                  Most posture apps either demand a \$140 smart posture brace with Bluetooth, or force you to run corporate
                  monitoring software that beams webcam frames into an opaque cloud server. We thought that was dystopian
                  and ridiculous.
                </p>
                <p className="body">
                  So we built <strong>Furai</strong>: an on-device, lightweight study buddy that uses Google MediaPipe Pose
                  inside WebAssembly. It catches your slouch, cheers your upright focus, and never lets a single pixel of your
                  camera leave your browser.
                </p>
              </div>

              <div className="story-timeline">
                <h3 className="story-timeline__title">THE SPRINT TIMELINE</h3>
                <div className="timeline-items">
                  {MILESTONES.map((m, i) => (
                    <div className="timeline-item" key={i}>
                      <span className="timeline-time">{m.time}</span>
                      <h4 className="timeline-head">{m.title}</h4>
                      <p className="timeline-desc">{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: The Ebi Squad (The Crew) */}
        <section className="about-section">
          <div className="section-head">
            <p className="eyebrow">THE MINDS BEHIND THE SPINE</p>
            <h2 className="display">THE EBI SQUAD</h2>
            <p className="section-head__jp">（開発に関わった人間たちと一匹のエビ）</p>
          </div>

          <div className="crew-grid">
            {CREW_MEMBERS.map((member) => (
              <article className="crew-card" key={member.id}>
                <div className="crew-card__top">
                  <span className="crew-badge" style={{ background: member.color }}>
                    {member.jpBadge}
                  </span>
                  <span className="crew-role-code">{member.role}</span>
                </div>

                <h3 className="crew-card__name">{member.name}</h3>

                <div className="crew-spine-meter">
                  <span className="meter-label">SPINE STATUS:</span>
                  <span className="meter-val">{member.spineStatus}</span>
                </div>

                <p className="crew-card__bio">{member.bio}</p>

                <div className="crew-quirk">
                  <Coffee size={14} />
                  <span>{member.quirk}</span>
                </div>

                <div className="crew-stats">
                  {member.stats.map((s, idx) => (
                    <div className="crew-stat" key={idx}>
                      <span className="crew-stat__label">{s.label}</span>
                      <span className="crew-stat__val">{s.val}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Section 3: The Furai Creed (3 Holy Commandments) */}
        <section className="about-section">
          <div className="card-staz card-staz--creed">
            <div className="creed-head">
              <p className="jp-label">（フライの３大原則）</p>
              <h2 className="display">THE 3 CREEDS OF FURAI</h2>
              <p className="creed-sub">
                The non-negotiable laws governing every line of code and pixel in this app:
              </p>
            </div>

            <div className="creed-grid">
              <div className="creed-card">
                <span className="creed-num">01</span>
                <h3 className="creed-title">Zero Video Uploads</h3>
                <p className="creed-desc">
                  Camera frames belong to the user, not to an AWS bucket. Pose vectors are computed on-device via Wasm and instantly garbage collected.
                </p>
              </div>

              <div className="creed-card">
                <span className="creed-num">02</span>
                <h3 className="creed-title">Zero AI Slop Allowed</h3>
                <p className="creed-desc">
                  No generic purple neon gradients. No emoji clutter. Every screen honors authentic Shibuya zine typography, stationery textures, and intentional composition.
                </p>
              </div>

              <div className="creed-card">
                <span className="creed-num">03</span>
                <h3 className="creed-title">SDG 3 & 4 Alignment</h3>
                <p className="creed-desc">
                  Physical spine health (Good Health & Well-being) plus sustained Pomodoro rhythm (Quality Education) for every student on any laptop.
                </p>
              </div>
            </div>

            <div className="creed-cta">
              <div className="creed-cta__text">
                <h3>Ready to un-shrimp your spine?</h3>
                <p>Launch the in-browser simulator or 10-second posture calibration right now.</p>
              </div>
              <button className="pill pill--dark pill--lg" onClick={onOpenDemo}>
                <span>Try Posture Simulator</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

