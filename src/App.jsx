import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, LogOut } from 'lucide-react';
import InteractiveDemoModal from './components/InteractiveDemoModal';
import AuthPage from './components/AuthPage';
import AboutPage from './components/AboutPage';
import StudyPage from './components/StudyPage';
import ProfilePage from './components/ProfilePage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const TICKER = [
  ['猫背注意', 'Slouch alert'],
  ['ブラウザだけで動く', 'Runs in your browser'],
  ['動画は送信しません', 'Zero video uploads'],
  ['ずっと無料', 'Free forever'],
  ['低スペPCでもOK', 'Potato-laptop friendly'],
];

const STEPS = [
  {
    no: 'STEP 01',
    kanji: '許可',
    color: 'var(--yellow)',
    badge: 'OK',
    title: 'Allow your camera',
    desc: 'Pose detection runs on your device. Nothing is recorded or uploaded.',
  },
  {
    no: 'STEP 02',
    kanji: '調整',
    color: 'var(--sky)',
    badge: '10s',
    title: 'Sit tall for 10 seconds',
    desc: 'Furai learns what “upright” looks like for your body and your desk.',
  },
  {
    no: 'STEP 03',
    kanji: '集中',
    color: 'var(--mint)',
    badge: '25:00',
    title: 'Study, Pomodoro style',
    desc: 'Curl up for too long and you get a gentle nudge — not a lecture.',
  },
  {
    no: 'STEP 04',
    kanji: '記録',
    color: 'var(--coral)',
    badge: '92%',
    title: 'Check your report',
    desc: 'See your posture score and the exact minutes you started to shrimp.',
  },
];

const PICKS = [
  {
    id: '#01',
    title: 'Gentle nudges',
    tag: 'いちおし',
    meta: 'Sound optional',
    desc: 'A soft banner and chime when you slouch past your tolerance. Never spammy.',
    visual: 'nudge',
  },
  {
    id: '#02',
    title: 'Pomodoro + stretch',
    tag: '定番',
    meta: '25 / 5',
    desc: 'Focus sprints with three guided stretches tucked into every break.',
    visual: 'timer',
  },
  {
    id: '#03',
    title: 'Grow a tiny plant',
    tag: '人気',
    meta: 'Score ≥ 80%',
    desc: 'Keep a good score and it grows. Slouch and it wilts — slowly, no drama.',
    visual: 'plant',
  },
  {
    id: '#04',
    title: 'Potato-laptop mode',
    tag: '安心',
    meta: 'Low spec OK',
    desc: 'Lower frame rate for older laptops, or go fully camera-free with timers.',
    visual: 'potato',
  },
];

/* ------------------------------------------------------------------ */
/* Little hand-drawn bits                                              */
/* ------------------------------------------------------------------ */

function Squiggle({ style }) {
  return (
    <svg className="squiggle" style={style} width="30" height="74" viewBox="0 0 30 74" fill="none" aria-hidden>
      <path
        d="M15 3c11 6 11 15 0 21s-11 15 0 21 11 15 0 21"
        stroke="#bdbbb2"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Cloud({ style }) {
  return (
    <svg className="cloud" style={style} viewBox="0 0 220 120" fill="none" aria-hidden>
      <path
        d="M44 110a32 32 0 0 1-2-64 44 44 0 0 1 80-20 38 38 0 0 1 64 28 28 28 0 0 1-2 56z"
        fill="#fff"
        stroke="#161616"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Starburst({ children }) {
  return (
    <div className="starburst" aria-hidden>
      <svg viewBox="0 0 120 120">
        <polygon
          points="60,4 70,18 87,9 90,27 108,26 103,44 117,54 104,65 112,82 94,86 92,104 76,99 66,115 55,101 40,111 35,94 17,95 20,77 5,69 17,56 7,41 24,35 22,17 40,21 47,5"
          fill="#ffe04a"
          stroke="#161616"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
      <span>{children}</span>
    </div>
  );
}

function RoundSticker({ onClick }) {
  return (
    <button className="round-sticker" onClick={onClick} aria-label="Try it now">
      <svg className="round-sticker__ring" viewBox="0 0 120 120">
        <defs>
          <path id="sticker-circle" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
        </defs>
        <circle cx="60" cy="60" r="58" fill="#ffe04a" stroke="#161616" strokeWidth="2.5" />
        <text>
          <textPath href="#sticker-circle" textLength="280" lengthAdjust="spacing">
            TRY IT NOW ・ 今すぐ試す ・ TRY IT NOW ・ 今すぐ試す ・
          </textPath>
        </text>
      </svg>
      <span className="round-sticker__center">
        試す
        <small>TRY</small>
      </span>
    </button>
  );
}

/* Pose-landmark overlay drawn in the shrimp SVG's own coordinate space (484 × 350),
   so it always lines up with the shrimp no matter the screen size. */
function PoseOverlay() {
  const spine = 'M98 128 C150 104 230 100 300 116 S368 170 350 205 S318 262 300 270';
  return (
    <svg className="stage__pose" viewBox="0 0 484 350" aria-hidden>
      <path className="pose__bracket" d="M18 112v-26h26 M392 86h26v26 M418 300v26h-26 M44 326h-26v-26" />
      <path className="pose__line" d={spine} />
      <circle className="pose__dot pose__dot--hot" cx="98" cy="128" r="8" />
      <circle className="pose__dot" cx="210" cy="104" r="7" />
      <circle className="pose__dot" cx="300" cy="116" r="7" />
      <circle className="pose__dot" cx="350" cy="205" r="7" />
      <circle className="pose__dot" cx="300" cy="270" r="7" />
      <g className="pose__tag" transform="translate(150 44)">
        <rect width="150" height="30" rx="15" />
        <text x="16" y="20">猫背 · 58°</text>
      </g>
    </svg>
  );
}

function PickVisual({ type }) {
  if (type === 'nudge') {
    return (
      <div className="v-nudge">
        <div className="v-nudge__bubble">
          ちょっと背中、丸いかも。
          <small>Sit up a little?</small>
        </div>
        <img src="/assets/shrimp-chair.svg" alt="" />
      </div>
    );
  }
  if (type === 'timer') {
    return (
      <div className="v-timer">
        <b>25:00</b>
        <span>集中モード</span>
      </div>
    );
  }
  if (type === 'plant') {
    return (
      <div className="v-plant">
        <svg width="56%" viewBox="0 0 100 100" fill="none" aria-hidden>
          <path d="M28 60h44l-6 30H34z" fill="#f08a6e" stroke="#161616" strokeWidth="3" strokeLinejoin="round" />
          <path d="M50 60V32" stroke="#161616" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 44C34 46 26 36 26 26c13 0 24 5 24 18z" fill="#fff" stroke="#161616" strokeWidth="3" strokeLinejoin="round" />
          <path d="M50 38c4-14 16-19 27-17-2 13-13 19-27 17z" fill="#fff" stroke="#161616" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  return (
    <div className="v-potato">
      <b>15</b>
      <span>fps · 低スペOK</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function App() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [view, setView] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'login' || hash === 'register') return hash;
    if (hash === 'about-page' || hash === 'story') return 'about';
    if (hash === 'study' || hash === 'session') return 'study';
    if (hash === 'profile' || hash === 'settings') return 'profile';
    return 'landing';
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('furai_user') || 'null');
      if (saved && typeof saved === 'object') setUser(saved);
    } catch {
      localStorage.removeItem('furai_user');
    }

    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'login' || hash === 'register') {
        setView(hash);
      } else if (hash === 'about-page' || hash === 'story') {
        setView('about');
      } else if (hash === 'study' || hash === 'session') {
        setView('study');
      } else if (hash === 'profile' || hash === 'settings') {
        setView('profile');
      } else if (
        hash === 'top' ||
        hash === '' ||
        hash === 'about' ||
        hash === 'how' ||
        hash === 'features' ||
        hash === 'privacy'
      ) {
        setView('landing');
      }
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const openDemo = () => {
    openPage('study');
  };

  const openPage = (mode, sectionId) => {
    setView(mode);
    if (mode === 'landing') {
      window.location.hash = sectionId || 'top';
      if (sectionId) {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (mode === 'study') {
      window.location.hash = 'study';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (mode === 'profile') {
      window.location.hash = 'profile';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = mode === 'about' ? 'about-page' : mode;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const logout = () => {
    localStorage.removeItem('furai_user');
    setUser(null);
    openPage('landing');
  };

  return (
    <div id="top" className="app-shell">
      {/* Reusable Navbar across landing & about pages (hidden on login/register/study/profile) */}
      {view !== 'login' && view !== 'register' && view !== 'study' && view !== 'profile' && (
        <Navbar
          currentView={view}
          user={user}
          onNavigate={openPage}
          onLogout={logout}
          onOpenDemo={openDemo}
          showTicker={true}
        />
      )}

      {view === 'about' && (
        <AboutPage onOpenDemo={openDemo} />
      )}

      {view === 'study' && (
        <StudyPage
          user={user}
          onBackToHome={() => openPage('landing')}
          onOpenDemo={openDemo}
          onOpenProfile={() => openPage('profile')}
        />
      )}

      {view === 'profile' && (
        <ProfilePage
          user={user}
          onUpdateUser={(updated) => setUser(updated)}
          onLogout={logout}
          onBackToStudy={() => openPage('study')}
          onBackToHome={() => openPage('landing')}
        />
      )}

      {(view === 'login' || view === 'register') && (
        <AuthPage
          initialMode={view}
          onBack={() => openPage('landing')}
          onSuccess={(u) => {
            setUser(u);
            openPage('study');
          }}
        />
      )}

      {view === 'landing' && (
        <>
          {/* Hero */}
          <section className="hero">
            <div className="stage">
              <p className="stage__vertical">猫背、バレてるよ。</p>
              <h1 className="stage__title">posture reveal</h1>
              <p className="stage__sub">
                A study buddy that catches you curling up like fried shrimp — right in your browser.
              </p>

              <img className="stage__desk" src="/assets/desk-monitor.svg" alt="" />
              <img className="stage__shrimp" src="/assets/shrimp-chair.svg" alt="A shrimp slouching at a desk" />
              <PoseOverlay />

              <RoundSticker onClick={openDemo} />
            </div>

            <p className="hero__mobile">
              A study buddy that catches you curling up like fried shrimp — right in your browser.
            </p>

            <div className="hero__foot">
              <a href="#about" className="pill pill--dark">
                Furai とは？
              </a>
            </div>
          </section>

          {/* About — STAZ "WORKS" card */}
          <section className="section" id="about">
            <div className="card-staz">
              <span className="doodle-plus" style={{ top: 22, left: 30 }}>+</span>
              <span className="doodle-plus" style={{ bottom: 120, left: 48 }}>+</span>

              <div className="frame">
                <div className="tiles">
                  <figure className="tile tile--cobalt">
                    <span className="tile__label">02:14 AM</span>
                    <span className="tile__cap">debugging…</span>
                    <img src="/assets/shrimp-chair.svg" alt="" />
                  </figure>
                  <figure className="tile tile--yellow">
                    <span className="tile__label">SLOUCH</span>
                    <span className="tile__kanji">猫背</span>
                    <span className="tile__cap">nekoze</span>
                  </figure>
                  <figure className="tile tile--mint">
                    <span className="tile__label">SIT TALL</span>
                    <span className="tile__kanji">ピン</span>
                    <span className="tile__cap">pin!</span>
                  </figure>
                </div>
              </div>

              <div className="card-staz__body">
                <div>
                  <p className="jp-label">（フライとは）</p>
                  <h2 className="display">WHAT IS FURAI</h2>
                  <p className="body">
                    Furai is a study buddy that watches your posture through your webcam — entirely
                    inside the browser. When you start curling up like ebi furai, it gives you a gentle
                    nudge without any guilt trips.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button onClick={() => openPage('about')} className="pill-coral">
                    meet the crew & story <ArrowRight size={15} />
                  </button>
                  <a href="#how" className="pill pill--dark">
                    how it works ↓
                  </a>
                </div>
              </div>

              <Squiggle style={{ top: '46%', right: '30%' }} />
              <Cloud style={{ right: -40, bottom: 70, width: 210 }} />
              <div className="halftone" style={{ right: 24, bottom: 18, width: 120, height: 56 }} />
            </div>
          </section>

          {/* How it works — dōzo "What's new" */}
          <div className="band" id="how">
            <section className="section">
              <div className="section-head">
                <span className="eyebrow">A STUDY BUDDY WITH A SPINE</span>
                <h2 className="display">How it works</h2>
                <p className="section-head__jp">使い方は、かんたん4ステップ。</p>
              </div>

              <div className="steps">
                {STEPS.map((s) => (
                  <article className="step" key={s.no}>
                    <div className="step__top">
                      <span className="step__no">{s.no}</span>
                      <div className="step__tile" style={{ background: s.color }}>
                        <span className="step__kanji">{s.kanji}</span>
                        <span className="step__badge">{s.badge}</span>
                      </div>
                    </div>
                    <h3 className="step__title">{s.title}</h3>
                    <p className="step__desc">{s.desc}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* Features — dōzo "Pick up" */}
          <div className="band band--sky" id="features">
            <section className="section">
              <div className="section-head">
                <span className="eyebrow">WHAT YOU GET</span>
                <h2 className="display">Pick up</h2>
                <p className="section-head__jp">今月のイチオシ機能はこれ！</p>
              </div>

              <div className="picks">
                {PICKS.map((p) => (
                  <article className="pick" key={p.id}>
                    <div className="pick__img">
                      <PickVisual type={p.visual} />
                    </div>
                    <h3 className="pick__title">
                      {p.id} {p.title}
                    </h3>
                    <div className="pick__row">
                      <span className="pick__tag">{p.tag}</span>
                      <span className="pick__meta">{p.meta}</span>
                    </div>
                    <p className="pick__desc">{p.desc}</p>
                    <button className="pill pill--dark" onClick={openDemo}>
                      詳細を見る
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* Privacy — STAZ "ABOUT" card */}
          <section className="section" id="privacy">
            <div className="card-staz card-staz--split">
              <span className="doodle-plus" style={{ top: 34, left: '20%' }}>+</span>
              <Squiggle style={{ top: 40, left: '38%' }} />

              <div className="card-staz__text">
                <p className="jp-label">（プライバシー）</p>
                <h2 className="display">PRIVACY</h2>
                <p className="body">
                  Your camera feed never leaves your laptop. The pose model runs on-device with
                  WebAssembly — your video stream is never recorded or transmitted.
                </p>
                <ul className="checks">
                  <li><Check size={16} strokeWidth={3} /> Real-time on-device pose detection</li>
                  <li><Check size={16} strokeWidth={3} /> Zero video frames uploaded to servers</li>
                  <li><Check size={16} strokeWidth={3} /> Reset session data in one click</li>
                </ul>
                <button className="pill-coral" onClick={openDemo}>
                  try the demo <ArrowRight size={15} />
                </button>
              </div>

              <div className="netlog" aria-label="Network panel showing zero image uploads">
                <div className="netlog__bar">
                  <i style={{ background: '#f38ba8' }} />
                  <i style={{ background: '#f9e2af' }} />
                  <i style={{ background: '#a6e3a1' }} />
                  <span>DevTools — Network</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>NAME</th>
                      <th>TYPE</th>
                      <th>SIZE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>pose_landmarker.task</td>
                      <td>model</td>
                      <td>cached</td>
                    </tr>
                    <tr>
                      <td>vision_wasm.wasm</td>
                      <td>wasm</td>
                      <td>cached</td>
                    </tr>
                    <tr>
                      <td>index.js</td>
                      <td>script</td>
                      <td>84 kB</td>
                    </tr>
                    <tr className="is-zero">
                      <td>image / video upload</td>
                      <td>—</td>
                      <td>0 B</td>
                    </tr>
                  </tbody>
                </table>
                <div className="netlog__foot">
                  <span>frames sent: 0</span>
                  <span>✓ local only</span>
                </div>
              </div>

              <Starburst>
                100%
                <br />
                ローカル
              </Starburst>
            </div>
          </section>
        </>
      )}

      {/* Reusable Footer across all pages */}
      {view !== 'study' && (
        <Footer
          user={user}
          onNavigate={openPage}
          onOpenDemo={openDemo}
          showCta={view !== 'login' && view !== 'register' && view !== 'profile'}
        />
      )}

      <InteractiveDemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
