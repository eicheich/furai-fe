import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Eye,
  Clock,
  Heart,
  Check,
  CheckCircle2,
  Zap,
  Play
} from 'lucide-react';

export default function AboutPage({ onOpenDemo, onNavigate }) {
  return (
    <div className="about-view">
      {/* ---------------------------------------------------- */}
      {/* HERO SECTION: Introducing Furai                      */}
      {/* ---------------------------------------------------- */}
      <section className="about-hero">
        <div className="about-hero__inner">
          <span className="about-acronym-chip">
            ⚡ FURAI = Fix Ur Alignment Issue
          </span>
          <h1 className="about-hero__title">
            MEET FURAI.
          </h1>
          <p className="about-hero__sub">
            An intelligent study companion engineered to keep your spine upright and your focus sharp with Pomodoro sprints — right in your browser without extra hardware.
          </p>

          <div className="about-hero__actions">
            <button
              type="button"
              className="pill pill--yellow pill--lg"
              onClick={() => onNavigate?.('study')}
            >
              <span>Launch Study Space</span>
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="pill pill--ghost pill--lg"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
              onClick={onOpenDemo}
            >
              <Play size={16} />
              <span>Try Interactive Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* MAIN CONTENT                                         */}
      {/* ---------------------------------------------------- */}
      <main className="about-content">
        {/* ORIGIN STORY: The "Ebi Furai" Phenomenon */}
        <section className="about-section">
          <div className="card-staz card-staz--story">
            <span className="doodle-plus" style={{ top: 24, left: '16%' }}>+</span>
            <span className="doodle-plus" style={{ bottom: 28, right: '14%' }}>+</span>

            <div className="card-staz__head">
              <div>
                <p className="jp-label">（誕生のきっかけ）</p>
                <h2 className="display">WHY FURAI WAS CREATED</h2>
              </div>
              <span className="story-chip" style={{ background: 'var(--yellow)' }}>
                ORIGIN & MISSION
              </span>
            </div>

            <div className="story-grid">
              <div className="story-body" style={{ maxWidth: '100%' }}>
                <p className="lead-text">
                  Have you ever caught your reflection on a black laptop screen during a late-night study sprint?
                </p>
                <p className="body">
                  Your chin is jutting 12 cm forward, your shoulders are curled inward, and your spine is contorted like a stressed crustacean.
                  In Japanese culinary terms: <strong>you have achieved full <em>Ebi Furai</em> (fried shrimp) morphology.</strong>
                </p>
                <p className="body">
                  Hours of slumping over a laptop trigger chronic tech neck, lower lumbar strain, and mental fatigue. Most students and developers don't even realize they're curling up until the stiffness and soreness set in.
                </p>
                <p className="body">
                  <strong>Furai was created as a supportive, calm companion</strong>: an on-device posture guardian that watches your alignment with empathy. No expensive harnesses, no wearable straps, and no judgment.
                </p>

                {/* Acronym Explainer Box */}
                <div className="about-acronym-banner">
                  <span className="about-acronym-tag">THE NAME & MEANING // 由来</span>
                  <h3><strong>F.U.R.A.I</strong> stands for <strong>Fix Ur Alignment Issue</strong></h3>
                  <p>
                    A playful double meaning: inspired by uncurling from the crispy Japanese <em>Ebi Furai</em> (fried shrimp) slouch, and literally engineered to <strong>Fix Ur Alignment Issue</strong> directly in your browser.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 CORE FEATURES */}
        <section className="about-section">
          <div className="section-head">
            <p className="eyebrow">WHAT'S PACKED INSIDE FURAI</p>
            <h2 className="display">THREE CORE PILLARS</h2>
            <p className="section-head__jp">（3つのコア機能）</p>
          </div>

          <div className="about-features-grid">
            {/* Feature 1 */}
            <div className="about-feat-card">
              <div className="about-feat-icon" style={{ background: 'var(--yellow)' }}>
                <Eye size={24} />
              </div>
              <div className="about-feat-head">
                <span className="about-feat-step">FEATURE 01</span>
                <h3>Real-Time Posture Radar</h3>
              </div>
              <p>
                Furai uses your laptop camera to track ear and shoulder alignment in real time. The moment you curl into a shrimp or lean too close to the screen, Furai gently lets you know.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="about-feat-card">
              <div className="about-feat-icon" style={{ background: 'var(--mint)' }}>
                <Clock size={24} />
              </div>
              <div className="about-feat-head">
                <span className="about-feat-step">FEATURE 02</span>
                <h3>Integrated Pomodoro Timer</h3>
              </div>
              <p>
                Structure your sessions with 25-minute deep focus intervals and 5-minute stretch breaks. The timer auto-pauses whenever you step away from the desk or camera frame.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="about-feat-card">
              <div className="about-feat-icon" style={{ background: 'var(--sky)' }}>
                <Sparkles size={24} />
              </div>
              <div className="about-feat-head">
                <span className="about-feat-step">FEATURE 03</span>
                <h3>Adaptive 5-Second Calibration</h3>
              </div>
              <p>
                Every body and workstation is unique. Sit upright for just 5 seconds, and Furai tailors the baseline to your natural ergonomics rather than a rigid formula.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="about-section">
          <div className="card-staz card-staz--how">
            <div className="section-head" style={{ marginBottom: '28px' }}>
              <p className="eyebrow">EFFORTLESS ONBOARDING</p>
              <h2 className="display">HOW TO USE FURAI</h2>
              <p className="section-head__jp">（かんたん3ステップ）</p>
            </div>

            <div className="about-steps-row">
              <div className="about-step-col">
                <div className="about-step-num">1</div>
                <h4>Open Study Space</h4>
                <p>Launch the study room and grant browser camera permission. Everything stays in memory.</p>
              </div>

              <div className="about-step-divider">→</div>

              <div className="about-step-col">
                <div className="about-step-num">2</div>
                <h4>5-Second Baseline</h4>
                <p>Sit comfortably tall for 5 seconds so Furai captures your natural upright reference angle.</p>
              </div>

              <div className="about-step-divider">→</div>

              <div className="about-step-col">
                <div className="about-step-num">3</div>
                <h4>Focus & Study</h4>
                <p>Start your Pomodoro sprint. Furai provides supportive, gentle nudges if you begin to slouch.</p>
              </div>
            </div>
          </div>
        </section>

        {/* PRIVACY GUARANTEE: ZERO SURVEILLANCE */}
        <section className="about-section">
          <div className="card-staz card-staz--creed">
            <div className="creed-head">
              <p className="jp-label">（プライバシーの約束）</p>
              <h2 className="display">100% PRIVATE & ON-DEVICE</h2>
              <p className="creed-sub">
                We never record, save, or upload webcam video footage:
              </p>
            </div>

            <div className="creed-grid">
              <div className="creed-card">
                <span className="creed-num"><ShieldCheck size={26} color="var(--mint)" /></span>
                <h3 className="creed-title">Processed Locally in Browser</h3>
                <p className="creed-desc">
                  All skeletal landmark calculations run on-device. Zero video frames or images are ever uploaded or transmitted across the internet.
                </p>
              </div>

              <div className="creed-card">
                <span className="creed-num"><Heart size={26} color="var(--coral)" /></span>
                <h3 className="creed-title">Calm, Supportive Nudges</h3>
                <p className="creed-desc">
                  No jarring alarms or stressful sirens. Furai delivers soft acoustic chimes and minimal visual cues so your focus remains unbroken.
                </p>
              </div>

              <div className="creed-card">
                <span className="creed-num"><Zap size={26} color="var(--yellow)" /></span>
                <h3 className="creed-title">Potato-Laptop Friendly</h3>
                <p className="creed-desc">
                  Engineered to be battery-conscious and lightweight, running smoothly at 30 FPS even on modest, older student laptops.
                </p>
              </div>
            </div>

            <div className="creed-cta">
              <div className="creed-cta__text">
                <h3>Ready to un-shrimp your spine?</h3>
                <p>Step into your Furai study space and feel the difference today.</p>
              </div>
              <button
                type="button"
                className="pill pill--dark pill--lg"
                onClick={() => onNavigate?.('study')}
              >
                <span>Launch Study Space</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
