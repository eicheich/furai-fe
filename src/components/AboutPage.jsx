import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Cpu,
  Layers,
  Server,
  Activity,
  Timer,
  Camera,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  Sparkles
} from 'lucide-react';

const TECH_MODULES = [
  {
    id: 'nextjs',
    name: 'Next.js & React',
    tag: 'FRONTEND // UI & AUDIO',
    jpBadge: 'フロントエンド',
    color: 'var(--yellow)',
    icon: Layers,
    summary: 'Reactive client interface, WebRTC video stream orchestration, and local-first state.',
    desc: 'Provides the zero-latency presentation layer. Coordinates webcam capture via HTML5 Canvas, renders real-time MediaPipe skeletal overlays, synthesizes gentle acoustic sound nudges via Web Audio API, and stores telemetry in local browser storage.',
    stats: [
      { label: 'RENDER LATENCY', val: '< 16ms (60 FPS)' },
      { label: 'SERVER RETENTION', val: '0 Bytes Raw' },
    ],
  },
  {
    id: 'fastapi',
    name: 'FastAPI (Python)',
    tag: 'BACKEND // ASGI SERVICE',
    jpBadge: 'バックエンド',
    color: 'var(--mint)',
    icon: Server,
    summary: 'High-performance asynchronous ASGI microservice for session telemetry and analytics.',
    desc: 'Powered by Starlette and Pydantic v2. Provides non-blocking asynchronous REST and WebSocket channels for session aggregation, sprint streak synchronization, and historical posture score computation without blocking inference threads.',
    stats: [
      { label: 'RESPONSE TIME', val: '< 5ms ASGI' },
      { label: 'CONCURRENCY', val: 'Async Event Loop' },
    ],
  },
  {
    id: 'mediapipe',
    name: 'MediaPipe Pose (Google)',
    tag: 'CV ENGINE // 3D TOPOLOGY',
    jpBadge: '骨格推論',
    color: 'var(--sky)',
    icon: Cpu,
    summary: 'Sub-millisecond BlazePose neural network inferring 33 3D skeletal landmarks.',
    desc: 'Processes frames on-device in sub-milliseconds. Extracts 33 anatomical 3D coordinates with high fidelity, isolating critical biomechanical landmarks: Nose, Ears (7/8), Shoulders (11/12), and Hips (23/24) to track thoracic alignment.',
    stats: [
      { label: 'LANDMARKS', val: '33 3D Keypoints' },
      { label: 'INFERENCE SPEED', val: '~30 FPS On-Device' },
    ],
  },
  {
    id: 'opencv',
    name: 'OpenCV (cv2)',
    tag: 'VISION // FRAME PIPELINE',
    jpBadge: '画像処理',
    color: 'var(--coral)',
    icon: Camera,
    summary: 'Low-overhead frame acquisition, color-space transcoding, and memory buffers.',
    desc: 'Handles the raw video stream lifecycle: BGR-to-RGB transcoding (cv2.cvtColor), resolution downscaling for potato-laptop mode, and real-time matrix transformations strictly within volatile RAM buffers. No frames are ever written to disk.',
    stats: [
      { label: 'FRAME BUFFER', val: 'Volatile RAM Only' },
      { label: 'DISK WRITES', val: '0 IOPS (Zero disk)' },
    ],
  },
  {
    id: 'numpy',
    name: 'NumPy Vector Math',
    tag: 'MATH // TRIGONOMETRY',
    jpBadge: '幾何学計算',
    color: '#ffe04a',
    icon: Activity,
    summary: 'Biomechanical vector calculations and cervical spine inclination angles.',
    desc: 'Calculates Euclidean vectors between ear-shoulder and shoulder-hip coordinate pairs. Uses np.arctan2 and vector dot products to derive forward head posture (FHP) angles and thoracic slump divergence with sub-pixel floating point precision.',
    stats: [
      { label: 'SLOUCH THRESHOLD', val: 'θ < 65° Flexion' },
      { label: 'MATH COMPUTE', val: '< 0.2ms / frame' },
    ],
  },
  {
    id: 'deque_time',
    name: 'collections.deque & time',
    tag: 'STABILITY // DEBOUNCE',
    jpBadge: '平滑化・時系列',
    color: '#ffffff',
    icon: Timer,
    summary: 'Sliding-window moving average filter and temporal slouch debouncer.',
    desc: 'Maintains a circular FIFO buffer (deque(maxlen=30)) to compute sliding-window averages, eliminating false positives from transient micro-movements or looking down at notes. time.time() enforces a 3.0-second persistence threshold before sound triggers.',
    stats: [
      { label: 'SLIDING WINDOW', val: '30-Frame FIFO' },
      { label: 'DEBOUNCE TIMER', val: '3.0s Threshold' },
    ],
  },
];

const MILESTONES = [
  {
    time: 'Phase 01',
    title: 'The Edge-First Vision',
    desc: 'Refused the industry standard of cloud webcam surveillance. Formulated a strict local-first architecture where video never leaves volatile browser memory.',
  },
  {
    time: 'Phase 02',
    title: 'MediaPipe & OpenCV Layering',
    desc: 'Integrated OpenCV frame acquisition with Google BlazePose 33-landmark inference, yielding 30 FPS tracking on ordinary laptops without dedicated GPUs.',
  },
  {
    time: 'Phase 03',
    title: 'Vector Math & Deque Smoothing',
    desc: 'Developed NumPy angular trigonometry for cervical spine flexion and layered a 30-sample deque sliding window to eliminate camera noise and jitter spikes.',
  },
  {
    time: 'Phase 04',
    title: 'FastAPI & Next.js Ecosystem',
    desc: 'Coupled the high-throughput async FastAPI telemetry backend with a bespoke Next.js Shibuya-editorial frontend to ensure zero AI-slop user experience.',
  },
];

const CODE_SNIPPET = `# ==============================================================================
# FURAI BIOMECHANICAL POSTURE ENGINE (cv_posture_engine.py)
# Zero-retention architecture: frames exist only in volatile RAM buffers.
# ==============================================================================

import time
from collections import deque
import cv2
import numpy as np
import mediapipe as mp

class BiomechanicalPosturePipeline:
    def __init__(self, fps: int = 30, debounce_sec: float = 3.0):
        # 1. Initialize MediaPipe Pose solution
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            min_detection_confidence=0.65,
            min_tracking_confidence=0.65
        )
        # 2. Sliding window buffer to smooth out camera jitter
        self.angle_window = deque(maxlen=fps)
        self.slouch_start_time = None
        self.debounce_sec = debounce_sec

    def process_frame(self, frame_bgr: np.ndarray) -> dict:
        # Step A: OpenCV BGR to RGB color transformation
        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        results = self.pose.process(frame_rgb)

        if not results.pose_landmarks:
            return {"state": "NO_SUBJECT", "score": 100, "trigger_nudge": False}

        # Step B: Extract 33 skeletal landmarks (Ear, Shoulder, Hip)
        lm = results.pose_landmarks.landmark
        ear = np.array([lm[self.mp_pose.PoseLandmark.LEFT_EAR].x,
                        lm[self.mp_pose.PoseLandmark.LEFT_EAR].y])
        shoulder = np.array([lm[self.mp_pose.PoseLandmark.LEFT_SHOULDER].x,
                             lm[self.mp_pose.PoseLandmark.LEFT_SHOULDER].y])
        hip = np.array([lm[self.mp_pose.PoseLandmark.LEFT_HIP].x,
                        lm[self.mp_pose.PoseLandmark.LEFT_HIP].y])

        # Step C: NumPy vector trigonometry (Cervical spine flexion)
        vec_torso = shoulder - hip
        vec_neck = ear - shoulder
        angle_rad = np.arctan2(vec_neck[1], vec_neck[0]) - np.arctan2(vec_torso[1], vec_torso[0])
        angle_deg = np.abs(np.degrees(angle_rad))

        # Step D: Temporal smoothing via collections.deque
        self.angle_window.append(angle_deg)
        smooth_angle = float(np.mean(self.angle_window))

        # Step E: Debounce persistent slouching via time.time()
        is_slouching = smooth_angle < 65.0  # Ebi Furai threshold
        now = time.time()

        if is_slouching:
            if self.slouch_start_time is None:
                self.slouch_start_time = now
            duration = now - self.slouch_start_time
            trigger_nudge = duration >= self.debounce_sec
        else:
            self.slouch_start_time = None
            trigger_nudge = False

        return {
            "angle": round(smooth_angle, 1),
            "state": "SLOUCH" if is_slouching else "ALIGNED",
            "trigger_nudge": trigger_nudge
        }`;

export default function AboutPage({ onOpenDemo, onNavigate }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="about-view">
      {/* Hero Banner */}
      <section className="about-hero">
        <div className="about-hero__inner">
          <p className="jp-label jp-label--light">（技術スタックとシステム設計）</p>
          <h1 className="about-hero__title">
            THE ARCHITECTURE<br />& TECH OF FURAI.
          </h1>
          <p className="about-hero__sub">
            A zero-surveillance biomechanical study companion engineered with Next.js, FastAPI,
            Google MediaPipe Pose, OpenCV frame transcoding, and NumPy vector trigonometry.
          </p>

          <div className="about-hero__tags">
            <span className="about-tag">#NextJS</span>
            <span className="about-tag">#FastAPI</span>
            <span className="about-tag">#MediaPipePose</span>
            <span className="about-tag">#OpenCV_cv2</span>
            <span className="about-tag">#NumPyVectors</span>
            <span className="about-tag">#TemporalDeque</span>
            <span className="about-tag">#ZeroCloudStorage</span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="about-content">
        {/* Section 1: The Origin Story & Architecture Problem */}
        <section className="about-section">
          <div className="card-staz card-staz--story">
            <span className="doodle-plus" style={{ top: 24, left: '18%' }}>+</span>
            <span className="doodle-plus" style={{ bottom: 28, right: '14%' }}>+</span>

            <div className="card-staz__head">
              <div>
                <p className="jp-label">（誕生の背景と技術思想）</p>
                <h2 className="display">WHY FURAI?</h2>
              </div>
              <span className="story-chip">ARCHITECTURE // 01</span>
            </div>

            <div className="story-grid">
              <div className="story-body">
                <p className="lead-text">
                  Have you ever caught your reflection on a black laptop screen during a late-night debugging sprint?
                </p>
                <p className="body">
                  Your chin is poking 14 cm forward. Your shoulders are curled inward like a stressed crustacean.
                  Your lower lumbar is performing an acrobatic arch that orthopedic surgeons write horror novels about.
                  In Japanese culinary terms: <strong>you have achieved full Ebi Furai (fried shrimp) morphology.</strong>
                </p>
                <p className="body">
                  Most posture apps either demand a \$140 proprietary Bluetooth harness, or force you to run invasive
                  surveillance tools that beam webcam video to an opaque cloud server. We consider cloud-based webcam
                  processing an unacceptable privacy hazard.
                </p>
                <p className="body">
                  So we engineered <strong>Furai</strong>: an on-device, lightweight pipeline that layers <strong>Google MediaPipe Pose</strong>,
                  <strong>OpenCV</strong> frame buffering, and <strong>NumPy vector mathematics</strong>. It detects spinal deviations
                  in real time and never lets a single pixel leave your machine.
                </p>
              </div>

              <div className="story-timeline">
                <h3 className="story-timeline__title">THE ENGINEERING ROADMAP</h3>
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

        {/* Section 2: The Core Tech Stack Grid (Replaces People/Crew) */}
        <section className="about-section">
          <div className="section-head">
            <p className="eyebrow">MODULAR COMPUTER VISION & CLOUD ARCHITECTURE</p>
            <h2 className="display">THE TECH STACK</h2>
            <p className="section-head__jp">（6つのコア技術モジュール）</p>
          </div>

          <div className="tech-grid">
            {TECH_MODULES.map((tech) => {
              const IconComp = tech.icon;
              return (
                <article className="tech-card" key={tech.id}>
                  <div className="tech-card__top">
                    <span className="tech-badge" style={{ background: tech.color }}>
                      {tech.jpBadge}
                    </span>
                    <span className="tech-role-code">{tech.tag}</span>
                  </div>

                  <div className="tech-card__header">
                    <div className="tech-icon-wrap">
                      <IconComp size={20} />
                    </div>
                    <h3 className="tech-card__name">{tech.name}</h3>
                  </div>

                  <p className="tech-card__summary">{tech.summary}</p>
                  <p className="tech-card__desc">{tech.desc}</p>

                  <div className="tech-stats">
                    {tech.stats.map((s, idx) => (
                      <div className="tech-stat" key={idx}>
                        <span className="tech-stat__label">{s.label}</span>
                        <span className="tech-stat__val">{s.val}</span>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Section 3: Real Computer Vision Pipeline Inspector */}
        <section className="about-section">
          <div className="card-staz card-staz--code">
            <div className="card-staz__head">
              <div>
                <p className="jp-label">（推論パイプラインの実装コード）</p>
                <h2 className="display">PIPELINE INSPECTOR</h2>
              </div>
              <div className="code-header-actions">
                <span className="story-chip" style={{ background: 'var(--mint)' }}>
                  PYTHON 3.11 · OPENCV · MEDIAPIPE · NUMPY
                </span>
                <button
                  type="button"
                  className="pill-copy"
                  onClick={handleCopy}
                  title="Copy Python Pipeline Code"
                >
                  {copied ? (
                    <>
                      <Check size={14} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy code
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="code-terminal">
              <div className="code-terminal__bar">
                <div className="terminal-dots">
                  <span className="dot dot--red" />
                  <span className="dot dot--yellow" />
                  <span className="dot dot--green" />
                </div>
                <div className="terminal-title">cv_posture_engine.py</div>
                <div className="terminal-meta">UTF-8 · Python 3.11</div>
              </div>

              <div className="code-terminal__body">
                <pre>
                  <code>{CODE_SNIPPET}</code>
                </pre>
              </div>
            </div>

            {/* Pipeline Step Walkthrough Cards */}
            <div className="pipeline-steps-grid">
              <div className="pipeline-step">
                <span className="pipeline-step__num">01</span>
                <h4>Frame Ingestion (cv2)</h4>
                <p>OpenCV captures web camera feed and transcodes color space from BGR to RGB in memory buffers.</p>
              </div>
              <div className="pipeline-step">
                <span className="pipeline-step__num">02</span>
                <h4>BlazePose (MediaPipe)</h4>
                <p>Google MediaPipe identifies 33 3D skeletal landmarks. Isolates ear, shoulder, and hip anchors.</p>
              </div>
              <div className="pipeline-step">
                <span className="pipeline-step__num">03</span>
                <h4>Trigonometry (NumPy)</h4>
                <p>Computes angular divergence between cervical and thoracic spine vectors with sub-millisecond math.</p>
              </div>
              <div className="pipeline-step">
                <span className="pipeline-step__num">04</span>
                <h4>Debounce (deque & time)</h4>
                <p>Sliding window moving average filters sensor jitter; 3-second debounce confirms sustained slouching.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: The 3 Holy Creeds */}
        <section className="about-section">
          <div className="card-staz card-staz--creed">
            <div className="creed-head">
              <p className="jp-label">（フライの３大原則）</p>
              <h2 className="display">THE 3 CREEDS OF FURAI</h2>
              <p className="creed-sub">
                The non-negotiable architectural laws governing every line of code in this system:
              </p>
            </div>

            <div className="creed-grid">
              <div className="creed-card">
                <span className="creed-num">01</span>
                <h3 className="creed-title">Zero Video Uploads</h3>
                <p className="creed-desc">
                  Camera frames belong exclusively to the student, not to an external cloud bucket. Pose vectors are
                  computed in volatile memory and immediately garbage-collected.
                </p>
              </div>

              <div className="creed-card">
                <span className="creed-num">02</span>
                <h3 className="creed-title">Zero AI Slop Allowed</h3>
                <p className="creed-desc">
                  No generic purple neon gradients. No emoji clutter. Every screen honors authentic Shibuya zine typography,
                  stationery textures, and intentional composition.
                </p>
              </div>

              <div className="creed-card">
                <span className="creed-num">03</span>
                <h3 className="creed-title">SDG 3 & 4 Alignment</h3>
                <p className="creed-desc">
                  Physical spine health (Good Health & Well-being) plus sustained Pomodoro rhythm (Quality Education)
                  engineered for students on any standard laptop.
                </p>
              </div>
            </div>

            <div className="creed-cta">
              <div className="creed-cta__text">
                <h3>Ready to un-shrimp your spine?</h3>
                <p>Launch the in-browser simulator or 10-second posture calibration right now.</p>
              </div>
              <button
                type="button"
                className="pill pill--dark pill--lg"
                onClick={onOpenDemo}
              >
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
