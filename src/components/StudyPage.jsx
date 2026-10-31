import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
  ShieldCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Activity,
  Award,
  Flame,
  Coffee,
  Heart,
  ChevronRight,
  Maximize2
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Web Audio API Synthesizer (Gentle, supportive sound nudges)        */
/* ------------------------------------------------------------------ */
function playTone(type = 'chime') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'nudge') {
      // Soft gentle two-tone reminder (A4 -> E4)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.28);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (type === 'success') {
      // Pleasant upward chime (C5 -> G5)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(783.99, now + 0.12);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.48);
    } else {
      // Timer bell
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.62);
    }
  } catch {
    // Audio might be blocked before first user gesture
  }
}

/* ------------------------------------------------------------------ */
/* Stretch Break Routines (SRS FR-11)                                 */
/* ------------------------------------------------------------------ */
const STRETCHES = [
  {
    id: 'chin',
    title: 'Cervical Chin Retraction',
    jp: '首の引き締め',
    duration: 30,
    desc: 'Tuck your chin straight back like making a double-chin. Hold for 3 seconds, release. Realigns cervical spine.',
    target: 'Relieves forward tech-neck pressure',
  },
  {
    id: 'chest',
    title: 'Pectoral & Shoulder Opener',
    jp: '胸郭ストレッチ',
    duration: 30,
    desc: 'Clasp your hands behind your back, roll shoulders downwards, and gently lift your chest towards the ceiling.',
    target: 'Reverses inward shoulder curling',
  },
  {
    id: 'spine',
    title: 'Seated Decompression Reach',
    jp: '背筋のばし',
    duration: 30,
    desc: 'Interlock fingers overhead, reach palms upward towards the sky, inhale deeply, and lengthen your spine.',
    target: 'Decompresses thoracic vertebrae',
  },
];

  export default function StudyPage({ user, onBackToHome, onOpenDemo, onOpenProfile }) {
    /* Tabs: 'workspace' | 'calibration' | 'stretches' | 'report' */
    const [activeTab, setActiveTab] = useState('workspace');

    /* Pomodoro State (FR-09, FR-10) */
    const [pomodoroMode, setPomodoroMode] = useState('focus'); // 'focus' | 'break'
    const [focusLength, setFocusLength] = useState(25 * 60);
    const [breakLength, setBreakLength] = useState(5 * 60);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [sprintCount, setSprintCount] = useState(1);

    /* Posture & Camera State (FR-01 - FR-08) */
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraPermission, setCameraPermission] = useState('idle'); // 'idle' | 'granted' | 'denied'
    const [postureState, setPostureState] = useState('aligned'); // 'aligned' | 'slouching' | 'out_of_frame'
    const [postureAngle, setPostureAngle] = useState(8); // degrees deviation
    const [sensitivity, setSensitivity] = useState('medium'); // 'low' | 'medium' | 'high'
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [potatoMode, setPotatoMode] = useState(false); // 15 fps low spec mode (FR-21)

    /* Telemetry & Stats (FR-14, FR-15, FR-18) */
    const [uprightSeconds, setUprightSeconds] = useState(0);
    const [totalDetectedSeconds, setTotalDetectedSeconds] = useState(0);
    const [slouchAlertCount, setSlouchAlertCount] = useState(0);
    const [lastNudgeTime, setLastNudgeTime] = useState(0);
    const [showNudgeToast, setShowNudgeToast] = useState(false);
    const [nudgeMessage, setNudgeMessage] = useState('');
    const [timelineSamples, setTimelineSamples] = useState([
      'aligned', 'aligned', 'aligned', 'slouching', 'aligned', 'aligned', 'aligned'
    ]);

    /* 10-Second Calibration State (FR-03) */
    const [calibProgress, setCalibProgress] = useState(0);
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [baselineCalibrated, setBaselineCalibrated] = useState(true);

    /* Guided Stretch Break (FR-11) */
    const [currentStretchIdx, setCurrentStretchIdx] = useState(0);
    const [stretchTimer, setStretchTimer] = useState(30);
    const [stretchRunning, setStretchRunning] = useState(false);

    const videoRef = useRef(null);
    const streamRef = useRef(null);

    /* Calculate Posture Health Score */
    const postureScore = totalDetectedSeconds > 0
      ? Math.round((uprightSeconds / totalDetectedSeconds) * 100)
      : 92;

    /* Plant Growth Stage (FR-18) */
    const plantStage = postureScore >= 85
      ? { level: 3, name: 'Thriving Bonsai', jp: '立派な盆栽', icon: '🌿', color: 'var(--mint)' }
      : postureScore >= 70
        ? { level: 2, name: 'Healthy Sprout', jp: '元気な若葉', icon: '🌱', color: 'var(--yellow)' }
        : { level: 1, name: 'Drooping Seedling', jp: '少しお疲れ', icon: '🪴', color: 'var(--coral)' };

    /* ------------------------------------------------------------------ */
    /* Pomodoro Timer Engine                                              */
    /* ------------------------------------------------------------------ */
    useEffect(() => {
      let timer = null;
      if (isRunning && timeLeft > 0) {
        timer = setInterval(() => {
          // Pause timer automatically if user leaves camera frame (FR-06)
          if (postureState === 'out_of_frame') return;

          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              handleSprintComplete();
              return 0;
            }
            return prev - 1;
          });

          // Track posture metrics
          setTotalDetectedSeconds((t) => t + 1);
          if (postureState === 'aligned') {
            setUprightSeconds((u) => u + 1);
          }
        }, 1000);
      }
      return () => clearInterval(timer);
    }, [isRunning, timeLeft, postureState]);

    /* Append timeline sample every 20 seconds of session */
    useEffect(() => {
      let sampleInterval = null;
      if (isRunning) {
        sampleInterval = setInterval(() => {
          setTimelineSamples((prev) => [...prev.slice(-24), postureState]);
        }, 15000);
      }
      return () => clearInterval(sampleInterval);
    }, [isRunning, postureState]);

    const handleSprintComplete = () => {
      if (soundEnabled) playTone('success');
      if (pomodoroMode === 'focus') {
        setPomodoroMode('break');
        setTimeLeft(breakLength);
        setIsRunning(false);
        setActiveTab('stretches');
        setCurrentStretchIdx(0);
        setStretchTimer(30);
      } else {
        setPomodoroMode('focus');
        setTimeLeft(focusLength);
        setSprintCount((c) => c + 1);
        setIsRunning(false);
        setActiveTab('workspace');
      }
    };

    /* ------------------------------------------------------------------ */
    /* Slouch Detection & Gentle Nudge Engine (FR-07, FR-08)             */
    /* ------------------------------------------------------------------ */
    const triggerPostureChange = (newStatus, angle) => {
      setPostureState(newStatus);
      setPostureAngle(angle);

      if (newStatus === 'slouching') {
        const now = Date.now();
        // Minimum 10 seconds between audio nudges to prevent annoyance (NFR-07)
        if (now - lastNudgeTime > 10000) {
          setLastNudgeTime(now);
          setSlouchAlertCount((c) => c + 1);
          setNudgeMessage('Your neck is 12 cm forward! Roll your shoulders back and sit tall.');
          setShowNudgeToast(true);
          if (soundEnabled) playTone('nudge');

          setTimeout(() => {
            setShowNudgeToast(false);
          }, 5000);
        }
      } else if (newStatus === 'aligned') {
        setShowNudgeToast(false);
      }
    };

    /* ------------------------------------------------------------------ */
    /* Real Webcam Activation (FR-01, FR-02)                              */
    /* ------------------------------------------------------------------ */
    const startCamera = async () => {
      try {
        setCameraPermission('idle');
        const constraints = {
          video: {
            width: { ideal: potatoMode ? 480 : 640 },
            height: { ideal: potatoMode ? 360 : 480 },
            frameRate: { ideal: potatoMode ? 15 : 30 },
          },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
        setCameraPermission('granted');
      } catch {
        setCameraPermission('denied');
        setCameraActive(false);
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    };

    /* ------------------------------------------------------------------ */
    /* 10-Second Baseline Calibration (FR-03)                             */
    /* ------------------------------------------------------------------ */
    const startCalibration = () => {
      setIsCalibrating(true);
      setCalibProgress(0);
      setActiveTab('calibration');

      const interval = setInterval(() => {
        setCalibProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsCalibrating(false);
            setBaselineCalibrated(true);
            if (soundEnabled) playTone('success');
            setTimeout(() => setActiveTab('workspace'), 600);
            return 100;
          }
          return prev + 10;
        });
      }, 1000);
    };

    /* ------------------------------------------------------------------ */
    /* Guided Stretch Timer Engine (FR-11)                                */
    /* ------------------------------------------------------------------ */
    useEffect(() => {
      let timer = null;
      if (activeTab === 'stretches' && stretchRunning && stretchTimer > 0) {
        timer = setInterval(() => {
          setStretchTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setStretchRunning(false);
              if (soundEnabled) playTone('success');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      return () => clearInterval(timer);
    }, [activeTab, stretchRunning, stretchTimer]);

    /* Format seconds to MM:SS */
    const formatTime = (secs) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
      <div className="study-space">
        {/* Top App Bar */}
        <header className="study-topbar">
          <div className="study-topbar__inner">
            <div className="study-topbar__left">
              <button
                type="button"
                className="study-back-btn"
                onClick={onBackToHome}
                title="Return to Landing Page"
              >
                <ArrowLeft size={16} />
                <span>Back to Home （ホーム）</span>
              </button>

              <div className="study-brand">
                <span className="study-brand__logo">Furai</span>
                <span className="study-brand__jp">学習スペース</span>
              </div>
            </div>

            {/* Tab Navigation */}
            <nav className="study-tabs" role="tablist">
              <button
                type="button"
                className={`study-tab ${activeTab === 'workspace' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('workspace')}
              >
                <Activity size={14} />
                <span>Study Session</span>
                <small>集中</small>
              </button>

              <button
                type="button"
                className={`study-tab ${activeTab === 'calibration' ? 'is-active' : ''}`}
                onClick={startCalibration}
              >
                <Sparkles size={14} />
                <span>Calibration</span>
                <small>10s 調整</small>
              </button>

              <button
                type="button"
                className={`study-tab ${activeTab === 'stretches' ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveTab('stretches');
                  setStretchTimer(30);
                  setStretchRunning(false);
                }}
              >
                <Coffee size={14} />
                <span>Guided Stretches</span>
                <small>ストレッチ</small>
              </button>

              <button
                type="button"
                className={`study-tab ${activeTab === 'report' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('report')}
              >
                <Award size={14} />
                <span>Session Report</span>
                <small>記録</small>
              </button>
            </nav>

            {/* User Profile Avatar Pill */}
            <div className="study-topbar__right">
                <button
                  type="button"
                  className="study-user-chip"
                  onClick={onOpenProfile}
                  title="Open Profile & Settings"
                >
                  <span className="study-user-chip__jp">{user?.archetypeJp || '自習'}</span>
              <span className="study-user-chip__avatar">
                {(user?.name ? user.name.trim().charAt(0) : 'U').toUpperCase()}
              </span>
            </button>
          </div>
      </div>
      </header >

      {/* Main Workspace Container */ }
      < main className = "study-container" >
        {/* Slouch Alert Toast Banner (FR-07) */ }
    {
      showNudgeToast && (
        <div className="nudge-toast" role="alert">
          <div className="nudge-toast__inner">
            <div className="nudge-toast__icon">
              <span>猫背</span>
            </div>
            <div className="nudge-toast__text">
              <strong>Gentle Posture Nudge</strong>
              <p>{nudgeMessage}</p>
            </div>
            <button
              type="button"
              className="nudge-toast__dismiss"
              onClick={() => setShowNudgeToast(false)}
            >
              Got it, sitting tall!
            </button>
          </div>
        </div>
      )
    }

    {/* ======================================================== */ }
    {/* TAB 1: MAIN STUDY & POMODORO WORKSPACE                    */ }
    {/* ======================================================== */ }
    {
      activeTab === 'workspace' && (
        <div className="study-grid">
          {/* LEFT COLUMN: Real-Time Posture Viewfinder Stage */}
          <div className="study-col study-col--left">
            <div className="card-staz card-staz--viewfinder">
              <div className="card-staz__head">
                <div>
                  <span className="jp-label">（リアルタイム姿勢検知）</span>
                  <h2 className="display" style={{ fontSize: '26px' }}>POSTURE RADAR</h2>
                </div>

                <div className="viewfinder-controls">
                  <button
                    type="button"
                    className={`vf-icon-btn ${soundEnabled ? 'is-active' : ''}`}
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    title={soundEnabled ? 'Sound alerts ON' : 'Sound alerts muted'}
                  >
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>

                  <button
                    type="button"
                    className={`vf-icon-btn ${cameraActive ? 'is-active' : ''}`}
                    onClick={cameraActive ? stopCamera : startCamera}
                    title={cameraActive ? 'Turn off camera' : 'Start webcam detection'}
                  >
                    {cameraActive ? <Camera size={16} /> : <CameraOff size={16} />}
                  </button>
                </div>
              </div>

              {/* Viewfinder Canvas Stage */}
              <div className="vf-stage">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="vf-video"
                  />
                ) : (
                  /* Fallback Animated Pose Illustration */
                  <div className="vf-simulated">
                    <img
                      src="/assets/shrimp-chair.svg"
                      alt="Posture avatar"
                      className={`vf-shrimp ${postureState === 'slouching' ? 'is-slouching' : 'is-upright'}`}
                    />
                  </div>
                )}

                {/* Corner Viewfinder Brackets */}
                <div className="vf-bracket vf-bracket--tl" />
                <div className="vf-bracket vf-bracket--tr" />
                <div className="vf-bracket vf-bracket--bl" />
                <div className="vf-bracket vf-bracket--br" />

                {/* Pose Landmark HUD Overlay */}
                <svg className="vf-hud" viewBox="0 0 400 300" fill="none">
                  {/* Spine Curvature Vector */}
                  {postureState === 'aligned' ? (
                    <path
                      d="M 200 70 L 200 130 L 195 210"
                      stroke="var(--mint)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="vf-spine-line"
                    />
                  ) : postureState === 'slouching' ? (
                    <path
                      d="M 160 85 Q 260 90 230 210"
                      stroke="var(--shrimp)"
                      strokeWidth="4"
                      strokeDasharray="6 6"
                      strokeLinecap="round"
                      className="vf-spine-line"
                    />
                  ) : null}

                  {/* Landmark Nodes (Ear, Shoulder, Hip) */}
                  {postureState !== 'out_of_frame' && (
                    <>
                      <circle
                        cx={postureState === 'aligned' ? 200 : 160}
                        cy={postureState === 'aligned' ? 70 : 85}
                        r="5"
                        fill="#fff"
                        stroke={postureState === 'aligned' ? 'var(--mint)' : 'var(--shrimp)'}
                        strokeWidth="2.5"
                      />
                      <circle
                        cx={postureState === 'aligned' ? 200 : 220}
                        cy={postureState === 'aligned' ? 130 : 135}
                        r="5"
                        fill="#fff"
                        stroke={postureState === 'aligned' ? 'var(--mint)' : 'var(--shrimp)'}
                        strokeWidth="2.5"
                      />
                      <circle
                        cx={postureState === 'aligned' ? 195 : 230}
                        cy={210}
                        r="5"
                        fill="#fff"
                        stroke={postureState === 'aligned' ? 'var(--mint)' : 'var(--shrimp)'}
                        strokeWidth="2.5"
                      />
                    </>
                  )}
                </svg>

                {/* Status Overlay Pill */}
                <div className="vf-badge-tag">
                  {postureState === 'aligned' && (
                    <span className="vf-badge vf-badge--aligned">
                      <span className="vf-badge__dot" />
                      <b>ピン ALIGNED</b> · {postureAngle}°
                    </span>
                  )}
                  {postureState === 'slouching' && (
                    <span className="vf-badge vf-badge--slouch">
                      <span className="vf-badge__dot" />
                      <b>猫背 SLOUCH</b> · {postureAngle}°
                    </span>
                  )}
                  {postureState === 'out_of_frame' && (
                    <span className="vf-badge vf-badge--empty">
                      <b>不在 OUT OF FRAME</b> · Timer Paused
                    </span>
                  )}
                </div>

                {/* Potato-laptop badge */}
                {potatoMode && (
                  <div className="vf-potato-tag">
                    <span>15 FPS · 低スペOK</span>
                  </div>
                )}
              </div>

              {/* Simulation & Sensitivity Switcher Bar */}
              <div className="vf-bottom-bar">
                <div className="vf-sim-group">
                  <span className="vf-meta-label">SIMULATE TEST:</span>
                  <div className="vf-btn-cluster">
                    <button
                      type="button"
                      className={`vf-btn ${postureState === 'aligned' ? 'is-selected' : ''}`}
                      onClick={() => triggerPostureChange('aligned', 8)}
                    >
                      ピン Upright
                    </button>
                    <button
                      type="button"
                      className={`vf-btn ${postureState === 'slouching' ? 'is-selected' : ''}`}
                      onClick={() => triggerPostureChange('slouching', 58)}
                    >
                      猫背 Slouch
                    </button>
                    <button
                      type="button"
                      className={`vf-btn ${postureState === 'out_of_frame' ? 'is-selected' : ''}`}
                      onClick={() => triggerPostureChange('out_of_frame', 0)}
                    >
                      不在 Away
                    </button>
                  </div>
                </div>

                <div className="vf-settings-group">
                  <button
                    type="button"
                    className={`vf-setting-btn ${potatoMode ? 'is-active' : ''}`}
                    onClick={() => setPotatoMode(!potatoMode)}
                    title="15 FPS mode for older laptops"
                  >
                    Potato Mode {potatoMode ? 'ON' : 'OFF'}
                  </button>

                  <div className="vf-sens-select">
                    <span>Sens:</span>
                    <select
                      value={sensitivity}
                      onChange={(e) => setSensitivity(e.target.value)}
                      className="vf-select"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Pomodoro Timer, Virtual Plant & Telemetry */}
          <div className="study-col study-col--right">
            {/* Pomodoro Timer STAZ Card */}
            <div className="card-staz card-staz--pomodoro">
              <div className="pomodoro-header">
                <div className="pomodoro-mode-switch">
                  <button
                    type="button"
                    className={`pomo-pill ${pomodoroMode === 'focus' ? 'is-active' : ''}`}
                    onClick={() => {
                      setPomodoroMode('focus');
                      setTimeLeft(focusLength);
                      setIsRunning(false);
                    }}
                  >
                    <span>集中 Focus</span>
                    <small>25m</small>
                  </button>

                  <button
                    type="button"
                    className={`pomo-pill ${pomodoroMode === 'break' ? 'is-active' : ''}`}
                    onClick={() => {
                      setPomodoroMode('break');
                      setTimeLeft(breakLength);
                      setIsRunning(false);
                    }}
                  >
                    <span>休憩 Stretch Break</span>
                    <small>5m</small>
                  </button>
                </div>

                <span className="pomo-sprint-badge">
                  SPRINT #{sprintCount}
                </span>
              </div>

              {/* Giant Digital Timer Display */}
              <div className="pomodoro-timer-stage">
                <span className="pomo-time-display">
                  {formatTime(timeLeft)}
                </span>
                <p className="pomo-status-sub">
                  {isRunning
                    ? postureState === 'out_of_frame'
                      ? '⏸ Timer auto-paused: please return to camera frame'
                      : pomodoroMode === 'focus'
                        ? 'Deep focus interval in progress. Stay upright!'
                        : 'Take deep breaths and perform a stretch break.'
                    : 'Session paused. Click Start to begin focusing.'}
                </p>
              </div>

              {/* Control Actions */}
              <div className="pomodoro-actions">
                <button
                  type="button"
                  className="pill pill--dark pomo-play-btn"
                  onClick={() => {
                    if (!isRunning && soundEnabled) playTone('chime');
                    setIsRunning(!isRunning);
                  }}
                >
                  {isRunning ? <Pause size={18} /> : <Play size={18} />}
                  <span>{isRunning ? 'Pause Sprint' : 'Start Focus Sprint'}</span>
                </button>

                <button
                  type="button"
                  className="pill pill--ghost"
                  onClick={() => {
                    setIsRunning(false);
                    setTimeLeft(pomodoroMode === 'focus' ? focusLength : breakLength);
                  }}
                  title="Reset countdown"
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  className="pill pill--ghost"
                  onClick={handleSprintComplete}
                >
                  <span>Skip to {pomodoroMode === 'focus' ? 'Break' : 'Focus'} →</span>
                </button>
              </div>
            </div>

            {/* Virtual Plant & Study Habit Progress (FR-18, FR-19) */}
            <div className="card-staz card-staz--plant">
              <div className="plant-grid">
                <div className="plant-icon-box">
                  <span className="plant-emoji">{plantStage.icon}</span>
                </div>

                <div className="plant-info">
                  <div className="plant-info__top">
                    <span className="jp-label">（バーチャル植物）</span>
                    <span className="plant-level-badge">LVL {plantStage.level}</span>
                  </div>
                  <h3 className="plant-title">{plantStage.name}</h3>
                  <p className="plant-sub">
                    Grows while your posture score stays above 80%.
                  </p>

                  {/* Posture Score Progress Bar */}
                  <div className="plant-meter-bar">
                    <div
                      className="plant-meter-fill"
                      style={{
                        width: `${postureScore}%`,
                        backgroundColor: plantStage.color,
                      }}
                    />
                  </div>
                  <div className="plant-meter-labels">
                    <span>Health: {postureScore}%</span>
                    <span>Streak: 3 Days 🔥</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Session Telemetry Bar (FR-14, FR-15) */}
            <div className="card-staz card-staz--telemetry">
              <div className="telemetry-grid">
                <div className="tele-item">
                  <span className="tele-label">UPRIGHT SCORE</span>
                  <span className="tele-val tele-val--mint">{postureScore}%</span>
                </div>

                <div className="tele-item">
                  <span className="tele-label">SLOUCH NUDGES</span>
                  <span className="tele-val tele-val--coral">{slouchAlertCount}</span>
                </div>

                <div className="tele-item">
                  <span className="tele-label">ACTIVE TIME</span>
                  <span className="tele-val">{formatTime(totalDetectedSeconds)}</span>
                </div>

                <div className="tele-item">
                  <span className="tele-label">CALIBRATION</span>
                  <span className="tele-val tele-val--ok">
                    {baselineCalibrated ? '✓ Calibrated' : 'Default'}
                  </span>
                </div>
              </div>

              {/* Minute-by-Minute Posture Timeline */}
              <div className="tele-timeline-wrap">
                <div className="tele-timeline-head">
                  <span>POSTURE TIMELINE (PAST SAMPLES)</span>
                  <small>Green = Aligned · Coral = Slouching</small>
                </div>
                <div className="tele-timeline-bars">
                  {timelineSamples.map((sample, idx) => (
                    <span
                      key={idx}
                      className={`tele-bar ${sample === 'aligned' ? 'is-green' : 'is-coral'}`}
                      title={`Sample #${idx + 1}: ${sample}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    {/* ======================================================== */ }
    {/* TAB 2: 10-SECOND CALIBRATION FLOW (FR-03)                 */ }
    {/* ======================================================== */ }
    {
      activeTab === 'calibration' && (
        <div className="card-staz card-staz--calib-stage">
          <span className="doodle-plus" style={{ top: 24, left: '20%' }}>+</span>
          <span className="doodle-plus" style={{ bottom: 28, right: '20%' }}>+</span>

          <div className="calib-container">
            <span className="jp-label">（10秒 姿勢キャリブレーション）</span>
            <h2 className="display" style={{ fontSize: '38px', margin: '8px 0 14px' }}>
              ALIGN YOUR BASELINE
            </h2>
            <p className="calib-desc">
              Sit naturally tall in your desk chair with your ears aligned over your shoulders.
              Furai records your upright spine angle for the current session.
            </p>

            {/* Progress Stage */}
            <div className="calib-meter-box">
              <div className="calib-ring-wrap">
                <span className="calib-ring-val">{10 - Math.floor(calibProgress / 10)}s</span>
                <span className="calib-ring-label">HOLD POSTURE</span>
              </div>

              <div className="calib-progress-bar">
                <div
                  className="calib-progress-fill"
                  style={{ width: `${calibProgress}%` }}
                />
              </div>
            </div>

            {/* Instructions checklist */}
            <div className="calib-checklist">
              <div className="calib-item">
                <Check size={16} strokeWidth={3} />
                <span>Eyes level with top third of laptop display</span>
              </div>
              <div className="calib-item">
                <Check size={16} strokeWidth={3} />
                <span>Shoulders relaxed downwards away from ears</span>
              </div>
              <div className="calib-item">
                <Check size={16} strokeWidth={3} />
                <span>Lower spine supported against your chair back</span>
              </div>
            </div>

            <div className="calib-actions">
              <button
                type="button"
                className="pill pill--dark"
                onClick={() => {
                  setBaselineCalibrated(true);
                  setActiveTab('workspace');
                }}
              >
                <span>Save Calibration & Return to Session →</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    {/* ======================================================== */ }
    {/* TAB 3: GUIDED STRETCH BREAK ROUTINES (FR-11)              */ }
    {/* ======================================================== */ }
    {
      activeTab === 'stretches' && (
        <div className="card-staz card-staz--stretch-stage">
          <div className="section-head" style={{ marginBottom: '28px' }}>
            <span className="eyebrow">GUIDED POSTURE STRETCH BREAK</span>
            <h2 className="display" style={{ fontSize: '34px' }}>RESET YOUR CERVICAL SPINE</h2>
            <p className="section-head__jp">3つのストレッチで、首と肩のコリをリセット。</p>
          </div>

          <div className="stretches-grid">
            {STRETCHES.map((s, idx) => {
              const isSelected = currentStretchIdx === idx;
              return (
                <article
                  key={s.id}
                  className={`stretch-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => {
                    setCurrentStretchIdx(idx);
                    setStretchTimer(s.duration);
                    setStretchRunning(false);
                  }}
                >
                  <div className="stretch-card__top">
                    <span className="stretch-step-badge">STEP 0{idx + 1}</span>
                    <span className="stretch-jp-tag">{s.jp}</span>
                  </div>

                  <h3 className="stretch-card__title">{s.title}</h3>
                  <p className="stretch-card__desc">{s.desc}</p>
                  <div className="stretch-card__meta">
                    <span>🎯 {s.target}</span>
                    <b>{s.duration}s</b>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Active Stretch Countdown Controller */}
          <div className="stretch-controller">
            <div className="stretch-controller__info">
              <span className="jp-label">CURRENT ACTIVE ROUTINE:</span>
              <h4>{STRETCHES[currentStretchIdx].title}</h4>
            </div>

            <div className="stretch-controller__timer">
              <span className="stretch-time-val">{stretchTimer}s</span>
            </div>

            <div className="stretch-controller__actions">
              <button
                type="button"
                className="pill pill--dark"
                onClick={() => setStretchRunning(!stretchRunning)}
              >
                {stretchRunning ? <Pause size={16} /> : <Play size={16} />}
                <span>{stretchRunning ? 'Pause Stretch' : 'Start 30s Countdown'}</span>
              </button>

              <button
                type="button"
                className="pill pill--ghost"
                onClick={() => {
                  if (currentStretchIdx < STRETCHES.length - 1) {
                    setCurrentStretchIdx(currentStretchIdx + 1);
                    setStretchTimer(30);
                    setStretchRunning(false);
                  } else {
                    setActiveTab('workspace');
                  }
                }}
              >
                <span>Next Exercise →</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    {/* ======================================================== */ }
    {/* TAB 4: SESSION REPORT & ANALYTICS (FR-14, FR-15)          */ }
    {/* ======================================================== */ }
    {
      activeTab === 'report' && (
        <div className="card-staz card-staz--report-stage">
          <div className="report-header">
            <div>
              <span className="jp-label">（セッション レポート）</span>
              <h2 className="display" style={{ fontSize: '36px' }}>STUDY POSTURE REPORT</h2>
              <p className="body" style={{ marginTop: '4px' }}>
                Summary of your upright alignment, focus intervals, and posture endurance.
              </p>
            </div>

            <div className="report-badge-pill">
              <span>GRADE: EXCELLENT (A)</span>
            </div>
          </div>

          <div className="report-metric-cards">
            <div className="report-card">
              <span className="report-card__num">{postureScore}%</span>
              <span className="report-card__label">OVERALL HEALTH SCORE</span>
              <p className="report-card__desc">Percentage of session spent in calibrated upright position.</p>
            </div>

            <div className="report-card">
              <span className="report-card__num">{formatTime(totalDetectedSeconds)}</span>
              <span className="report-card__label">TOTAL DETECTED STUDY</span>
              <p className="report-card__desc">Active minutes tracked while studying at your workstation.</p>
            </div>

            <div className="report-card">
              <span className="report-card__num">{slouchAlertCount}</span>
              <span className="report-card__label">GENTLE NUDGES TRIGGERED</span>
              <p className="report-card__desc">Times Furai caught you curling like fried shrimp.</p>
            </div>

            <div className="report-card">
              <span className="report-card__num">{sprintCount} Sprints</span>
              <span className="report-card__label">POMODORO CYCLES</span>
              <p className="report-card__desc">Full 25-minute focus intervals completed with stretch breaks.</p>
            </div>
          </div>

          <div className="report-insight-box">
            <div className="report-insight__head">
              <Sparkles size={18} />
              <h4>ERGONOMIC COACH INSIGHT</h4>
            </div>
            <p>
              Great discipline today! Most of your forward head tilt occurred around minute 18
              of your focus sprint. Try raising your laptop stand by 3 cm or taking deeper breaths
              during the 5-minute stretch intervals.
            </p>
          </div>

          <div className="report-actions">
            <button
              type="button"
              className="pill pill--dark pill--lg"
              onClick={() => {
                setActiveTab('workspace');
                setTimeLeft(focusLength);
                setIsRunning(false);
              }}
            >
              <span>Start Next Study Sprint</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )
    }
      </main >
    </div >
  );
  }

