import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
  Sparkles,
  Check,
  ArrowLeft,
  X,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import {
  extractPostureFeatures,
  CalibratedPostureDetector,
  ensureMediaPipeLoaded,
} from '../utils/postureEngine';

/* ------------------------------------------------------------------ */
/* Web Audio API Synthesizer (Gentle sound cues)                      */
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
      // Soft gentle two-tone reminder
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.28);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (type === 'success') {
      // Pleasant upward chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(783.99, now + 0.12);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.48);
    } else {
      // Timer chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.62);
    }
  } catch {
    // Audio context may require user gesture
  }
}

export default function StudyPage({ user, onBackToHome, onOpenProfile }) {
  /* Initial Calibration Onboarding State */
  const [showCalibModal, setShowCalibModal] = useState(() => {
    return !localStorage.getItem('furai_baseline_calibrated');
  });

  /* Pomodoro State */
  const [pomodoroMode, setPomodoroMode] = useState('focus'); // 'focus' | 'break'
  const focusLength = 25 * 60;
  const breakLength = 5 * 60;
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sprintCount, setSprintCount] = useState(1);

  /* Posture & Camera State */
  const [cameraActive, setCameraActive] = useState(false);
  const [postureState, setPostureState] = useState('aligned'); // 'aligned' | 'slouching' | 'out_of_frame'
  const [soundEnabled, setSoundEnabled] = useState(true);

  /* Telemetry & Stats */
  const [uprightSeconds, setUprightSeconds] = useState(0);
  const [totalDetectedSeconds, setTotalDetectedSeconds] = useState(0);
  const [slouchAlertCount, setSlouchAlertCount] = useState(0);
  const [showNudgeToast, setShowNudgeToast] = useState(false);
  const [nudgeMessage, setNudgeMessage] = useState('');

  /* 5-Second Calibration State */
  const [calibProgress, setCalibProgress] = useState(0);
  const [isCalibratingLive, setIsCalibratingLive] = useState(false);
  const [calibSuccessNotice, setCalibSuccessNotice] = useState(false);
  const [baselineCalibrated, setBaselineCalibrated] = useState(() => {
    return localStorage.getItem('furai_baseline_calibrated') === 'true';
  });

  const videoRef = useRef(null);
  const modalVideoRef = useRef(null);
  const streamRef = useRef(null);

  /* Calibrated Posture Engine Ref */
  const detectorRef = useRef(new CalibratedPostureDetector({ sensitivity: 'medium' }));
  const poseRef = useRef(null);
  const animFrameRef = useRef(null);
  const isProcessingRef = useRef(false);
  const lastNudgeRef = useRef(0);

  const [liveCoords, setLiveCoords] = useState(null);
  const [liveStatusText, setLiveStatusText] = useState('Kamera nonaktif');

  // Pastikan stream terpasang ke videoRef saat cameraActive berubah
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch((err) => {
        console.warn('Play error in cameraActive effect:', err);
      });
    }
  }, [cameraActive]);

  // Pasang stream ke modalVideoRef bila modal kalibrasi aktif
  useEffect(() => {
    if (showCalibModal && cameraActive && streamRef.current && modalVideoRef.current) {
      if (modalVideoRef.current.srcObject !== streamRef.current) {
        modalVideoRef.current.srcObject = streamRef.current;
      }
      modalVideoRef.current.play().catch(() => {});
    }
  }, [showCalibModal, cameraActive]);

  // Shortcut keyboard: Tekan 'c' untuk kalibrasi ulang cepat
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'c' || e.key === 'C') {
        openCalibrationFlow();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [cameraActive]);

  // Cleanup kamera & requestAnimationFrame saat unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (poseRef.current) {
        try { poseRef.current.close(); } catch (e) {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  /* Posture Health Score */
  const postureScore = totalDetectedSeconds > 0
    ? Math.round((uprightSeconds / totalDetectedSeconds) * 100)
    : 94;

  /* Pomodoro Countdown Engine */
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        // Otomatis jeda jika pengguna tidak berada di depan kamera
        if (postureState === 'out_of_frame') return;

        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSprintComplete();
            return 0;
          }
          return prev - 1;
        });

        // Catat metrik postur saat timer berjalan
        setTotalDetectedSeconds((t) => t + 1);
        if (postureState === 'aligned') {
          setUprightSeconds((u) => u + 1);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, postureState]);

  const handleSprintComplete = () => {
    if (soundEnabled) playTone('success');
    if (pomodoroMode === 'focus') {
      setPomodoroMode('break');
      setTimeLeft(breakLength);
      setIsRunning(false);
    } else {
      setPomodoroMode('focus');
      setTimeLeft(focusLength);
      setSprintCount((c) => c + 1);
      setIsRunning(false);
    }
  };

  /* Inisialisasi MediaPipe Pose di background tanpa memblokir video */
  const initMediaPipe = async () => {
    try {
      await ensureMediaPipeLoaded();
      if (!window.Pose) return;

      if (!poseRef.current) {
        const pose = new window.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults((results) => {
          if (!results || !videoRef.current) return;
          const v = videoRef.current;
          const w = v.videoWidth || 640;
          const h = v.videoHeight || 480;

          let features = null;
          if (results.poseLandmarks) {
            features = extractPostureFeatures(results.poseLandmarks, w, h);
          }

          const res = detectorRef.current.processFrame(features);
          setLiveStatusText(res.statusText);

          if (res.state === 'calibrating') {
            setIsCalibratingLive(true);
            setCalibProgress(res.progress || 0);
          } else if (res.state === 'calibrated' || res.justFinishedCalibration) {
            setIsCalibratingLive(false);
            setCalibProgress(100);
            setBaselineCalibrated(true);
            setCalibSuccessNotice(true);
            localStorage.setItem('furai_baseline_calibrated', 'true');
            if (soundEnabled) playTone('success');

            // Tutup modal otomatis setelah 1.5 detik
            setTimeout(() => {
              setShowCalibModal(false);
              setCalibSuccessNotice(false);
            }, 1500);
          }

          if (res.state === 'aligned' || res.state === 'calibrated') {
            setPostureState('aligned');
            setShowNudgeToast(false);
          } else if (res.state === 'slouching') {
            setPostureState('slouching');
            if (res.alertActive) {
              const now = Date.now();
              if (now - lastNudgeRef.current > 8000) {
                lastNudgeRef.current = now;
                setSlouchAlertCount((c) => c + 1);
                setNudgeMessage('Luruskan punggung! Posisi kepala/bahu terdeteksi bungkuk.');
                setShowNudgeToast(true);
                if (soundEnabled) playTone('nudge');
              }
            }
          } else if (res.state === 'out_of_frame') {
            setPostureState('out_of_frame');
          }

          if (res.coords) {
            setLiveCoords(res.coords);
          }
        });

        poseRef.current = pose;
      }

      // Loop pengiriman frame ke pose analyzer
      if (!animFrameRef.current) {
        let lastFrameTime = 0;
        const targetInterval = 1000 / 30;

        const processLoop = async (timestamp) => {
          const v = videoRef.current;
          if (!streamRef.current || !v || !poseRef.current) return;

          if (timestamp - lastFrameTime >= targetInterval) {
            if (v.readyState >= 2 && !isProcessingRef.current) {
              isProcessingRef.current = true;
              try {
                await poseRef.current.send({ image: v });
              } catch (err) {
                // frame drop aman
              }
              isProcessingRef.current = false;
              lastFrameTime = timestamp;
            }
          }
          animFrameRef.current = requestAnimationFrame(processLoop);
        };

        animFrameRef.current = requestAnimationFrame(processLoop);
      }
    } catch (err) {
      console.warn('MediaPipe init error:', err);
    }
  };

  /* Aktifkan Webcam & Langsung Tampilkan Muka Pengguna */
  const startCamera = async () => {
    try {
      setLiveStatusText('Menghubungkan webcam...');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;

      // Pasang langsung ke elemen video utama
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.warn('Video play error on start:', e);
        }
      }

      // Pasang juga ke elemen video modal bila terbuka
      if (modalVideoRef.current) {
        modalVideoRef.current.srcObject = stream;
        try {
          await modalVideoRef.current.play();
        } catch (e) {}
      }

      setCameraActive(true);
      setLiveStatusText('Kamera aktif · Mendeteksi postur...');

      // Inisialisasi MediaPipe setelah video siap
      initMediaPipe();
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraActive(false);
      setLiveStatusText('Akses kamera tidak diizinkan / kamera tidak ditemukan');
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (poseRef.current) {
      try { poseRef.current.close(); } catch (e) {}
      poseRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (modalVideoRef.current) {
      modalVideoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setLiveCoords(null);
    setLiveStatusText('Kamera nonaktif');
  };

  /* Memulai Kalibrasi 5 Detik */
  const run5SecondCalibration = async () => {
    setCalibSuccessNotice(false);
    if (!cameraActive) {
      await startCamera();
    }
    // Mulai perekaman baseline
    detectorRef.current.startCalibration();
    setIsCalibratingLive(true);
    setCalibProgress(0);
  };

  const openCalibrationFlow = () => {
    setShowCalibModal(true);
    setCalibSuccessNotice(false);
    if (cameraActive) {
      run5SecondCalibration();
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="study-space">
      {/* ---------------------------------------------------- */}
      {/* Top App Bar (Clean & Focused, No Tab Clutter)        */}
      {/* ---------------------------------------------------- */}
      <header className="study-topbar">
        <div className="study-topbar__inner">
          <div className="study-topbar__left">
            <button
              type="button"
              className="study-back-btn"
              onClick={onBackToHome}
              title="Kembali ke Beranda"
            >
              <ArrowLeft size={16} />
              <span>Back to Home （ホーム）</span>
            </button>

            <div className="study-brand">
              <span className="study-brand__logo">Furai</span>
              <span className="study-brand__jp">学習スペース</span>
            </div>
          </div>

          <div className="study-topbar__actions">
            {/* Quick Calibration Action */}
            <button
              type="button"
              className={`study-calib-pill ${baselineCalibrated ? 'is-calibrated' : ''}`}
              onClick={openCalibrationFlow}
              title="Kalibrasi posisi duduk tegak (5 detik)"
            >
              <Sparkles size={14} />
              <span>{baselineCalibrated ? 'Terkalibrasi (5s)' : 'Mulai Kalibrasi'}</span>
              <span className="study-calib-key">C</span>
            </button>

            {/* User Profile Pill */}
            <button
              type="button"
              className="study-user-chip"
              onClick={onOpenProfile}
              title="Buka Profil & Pengaturan"
            >
              <span className="study-user-chip__jp">{user?.archetypeJp || '自習'}</span>
              <span className="study-user-chip__avatar">
                {(user?.name ? user.name.trim().charAt(0) : 'U').toUpperCase()}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* Slouch Warning Toast                                */}
      {/* ---------------------------------------------------- */}
      {showNudgeToast && (
        <div className="nudge-toast" role="alert">
          <div className="nudge-toast__inner">
            <div className="nudge-toast__icon">
              <span>猫背</span>
            </div>
            <div className="nudge-toast__text">
              <strong>Tegakkan Badan</strong>
              <p>{nudgeMessage}</p>
            </div>
            <button
              type="button"
              className="nudge-toast__dismiss"
              onClick={() => setShowNudgeToast(false)}
            >
              Siap, duduk tegak!
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Main Workspace (2-Column Focus Layout)              */}
      {/* ---------------------------------------------------- */}
      <main className="study-container">
        <div className="study-grid">
          {/* LEFT COLUMN: Posture Radar Viewfinder Stage */}
          <div className="study-col study-col--left">
            <div className="card-staz card-staz--viewfinder">
              <div className="card-staz__head">
                <div>
                  <span className="jp-label">（リアルタイム姿勢検知）</span>
                  <h2 className="display" style={{ fontSize: '24px', margin: 0 }}>
                    POSTURE RADAR
                  </h2>
                </div>

                <div className="viewfinder-controls">
                  <button
                    type="button"
                    className={`vf-icon-btn ${isCalibratingLive ? 'is-active' : ''}`}
                    onClick={openCalibrationFlow}
                    title="Kalibrasi Ulang (Tekan 'c')"
                  >
                    <Sparkles size={16} />
                  </button>

                  <button
                    type="button"
                    className={`vf-icon-btn ${soundEnabled ? 'is-active' : ''}`}
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    title={soundEnabled ? 'Suara notifikasi aktif' : 'Suara dimatikan'}
                  >
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>

                  <button
                    type="button"
                    className={`vf-icon-btn ${cameraActive ? 'is-active' : ''}`}
                    onClick={cameraActive ? stopCamera : startCamera}
                    title={cameraActive ? 'Matikan Kamera' : 'Nyalakan Kamera'}
                  >
                    {cameraActive ? <Camera size={16} /> : <CameraOff size={16} />}
                  </button>
                </div>
              </div>

              {/* Viewfinder Canvas Stage */}
              <div className="vf-stage">
                {/* Elemen Video Selalu di DOM agar stream langsung terikat */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="vf-video"
                  style={{ display: cameraActive ? 'block' : 'none' }}
                />

                {!cameraActive && (
                  /* Fallback Illustration saat kamera belum dinyalakan */
                  <div className="vf-simulated">
                    <img
                      src="/assets/shrimp-chair.svg"
                      alt="Ilustrasi postur"
                      className={`vf-shrimp ${postureState === 'slouching' ? 'is-slouching' : 'is-upright'}`}
                    />
                    <div className="vf-camera-off-msg">
                      <p>Kamera belum dinyalakan</p>
                      <button
                        type="button"
                        className="pill pill--dark pill--sm"
                        onClick={startCamera}
                        style={{ marginTop: '8px' }}
                      >
                        <Camera size={14} />
                        <span>Nyalakan Kamera</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Viewfinder Corner Brackets */}
                <div className="vf-bracket vf-bracket--tl" />
                <div className="vf-bracket vf-bracket--tr" />
                <div className="vf-bracket vf-bracket--bl" />
                <div className="vf-bracket vf-bracket--br" />

                {/* Pose Landmark HUD Overlay */}
                <svg className="vf-hud" viewBox="0 0 400 300" fill="none">
                  {cameraActive && liveCoords && videoRef.current ? (
                    (() => {
                      const vw = videoRef.current.videoWidth || 640;
                      const vh = videoRef.current.videoHeight || 480;
                      const sx = (x) => (x / vw) * 400;
                      const sy = (y) => (y / vh) * 300;

                      const earX = sx(liveCoords.earMid.x);
                      const earY = sy(liveCoords.earMid.y);
                      const shX = sx(liveCoords.shoulderMid.x);
                      const shY = sy(liveCoords.shoulderMid.y);
                      const shLeftX = sx(liveCoords.shoulderLeft.x);
                      const shLeftY = sy(liveCoords.shoulderLeft.y);
                      const shRightX = sx(liveCoords.shoulderRight.x);
                      const shRightY = sy(liveCoords.shoulderRight.y);
                      const hipEstY = Math.min(285, shY + liveCoords.lebarBahu * 0.75 * (300 / vh));
                      const isAligned = postureState === 'aligned';

                      return (
                        <g>
                          {/* Shoulder line */}
                          <line
                            x1={shLeftX}
                            y1={shLeftY}
                            x2={shRightX}
                            y2={shRightY}
                            stroke={isAligned ? 'var(--mint)' : 'var(--shrimp)'}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                          {/* Cervical spine vector */}
                          <line
                            x1={earX}
                            y1={earY}
                            x2={shX}
                            y2={shY}
                            stroke={isAligned ? 'var(--mint)' : 'var(--shrimp)'}
                            strokeWidth="4"
                            strokeDasharray={isAligned ? 'none' : '5 5'}
                            strokeLinecap="round"
                          />
                          {/* Thoracic spine vector */}
                          <line
                            x1={shX}
                            y1={shY}
                            x2={shX}
                            y2={hipEstY}
                            stroke={isAligned ? 'var(--mint)' : 'var(--shrimp)'}
                            strokeWidth="4"
                            strokeDasharray={isAligned ? 'none' : '5 5'}
                            strokeLinecap="round"
                          />
                          {/* Nodes */}
                          <circle cx={earX} cy={earY} r="6" fill="#fff" stroke={isAligned ? 'var(--mint)' : 'var(--shrimp)'} strokeWidth="3" />
                          <circle cx={shLeftX} cy={shLeftY} r="5" fill="#fff" stroke={isAligned ? 'var(--mint)' : 'var(--shrimp)'} strokeWidth="2.5" />
                          <circle cx={shRightX} cy={shRightY} r="5" fill="#fff" stroke={isAligned ? 'var(--mint)' : 'var(--shrimp)'} strokeWidth="2.5" />
                          <circle cx={shX} cy={shY} r="5" fill={isAligned ? 'var(--mint)' : 'var(--shrimp)'} />
                        </g>
                      );
                    })()
                  ) : null}
                </svg>

                {/* Status Badge Tag */}
                <div className="vf-badge-tag">
                  {isCalibratingLive ? (
                    <span className="vf-badge" style={{ background: 'var(--yellow)', color: 'var(--ink)' }}>
                      <span className="vf-badge__dot" style={{ background: '#161616' }} />
                      <b>KALIBRASI ({Math.round(calibProgress)}%) · Duduk Tegak</b>
                    </span>
                  ) : cameraActive ? (
                    postureState === 'aligned' ? (
                      <span className="vf-badge vf-badge--aligned">
                        <span className="vf-badge__dot" />
                        <b>TEGAK · ALIGNED</b>
                      </span>
                    ) : postureState === 'slouching' ? (
                      <span className="vf-badge vf-badge--slouch">
                        <span className="vf-badge__dot" />
                        <b>BUNGKUK · SLOUCH</b>
                      </span>
                    ) : (
                      <span className="vf-badge vf-badge--empty">
                        <b>DI LUAR FRAME · Sesi Dijeda</b>
                      </span>
                    )
                  ) : (
                    <span className="vf-badge vf-badge--empty">
                      <b>KAMERA NONAKTIF</b>
                    </span>
                  )}
                </div>
              </div>

              {/* Clean Footer Bar */}
              <div className="vf-clean-footer">
                <span className="vf-privacy-note">
                  <ShieldCheck size={14} />
                  <span>100% lokal di browser · Video tidak dikirim ke server</span>
                </span>
                <button
                  type="button"
                  className="vf-recalib-link"
                  onClick={openCalibrationFlow}
                >
                  <Sparkles size={13} />
                  <span>Tekan <b>C</b> untuk kalibrasi</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Pomodoro Timer & Essential Telemetry */}
          <div className="study-col study-col--right">
            {/* Pomodoro Timer Card */}
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
                    <span>休憩 Break</span>
                    <small>5m</small>
                  </button>
                </div>

                <span className="pomo-sprint-badge">
                  SPRINT #{sprintCount}
                </span>
              </div>

              {/* Giant Digital Timer Stage */}
              <div className="pomodoro-timer-stage">
                <span className="pomo-time-display">
                  {formatTime(timeLeft)}
                </span>
                <p className="pomo-status-sub">
                  {isRunning
                    ? postureState === 'out_of_frame'
                      ? '⏸ Sesi dijeda otomatis (di luar jangkauan kamera)'
                      : pomodoroMode === 'focus'
                        ? 'Sesi fokus berjalan. Pertahankan postur duduk tegak!'
                        : 'Waktu istirahat sejenak. Regangkan bahu dan leher.'
                    : 'Sesi dijeda. Klik Mulai untuk memulai sesi fokus.'}
                </p>
              </div>

              {/* Pomodoro Action Buttons */}
              <div className="pomodoro-actions">
                <button
                  type="button"
                  className="pill pill--dark pomo-play-btn"
                  onClick={() => {
                    if (!isRunning && soundEnabled) playTone('chime');
                    if (!cameraActive && !isRunning) startCamera();
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
                  title="Reset hitungan mundur"
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  className="pill pill--ghost"
                  onClick={handleSprintComplete}
                  title="Lompat ke mode berikutnya"
                >
                  <span>Skip →</span>
                </button>
              </div>
            </div>

            {/* Essential Metrics Card */}
            <div className="card-staz card-staz--telemetry-clean">
              <div className="tele-clean-head">
                <span className="jp-label">（セッション統計）</span>
                <h3 className="tele-clean-title">SESSION STATS</h3>
              </div>

              <div className="tele-clean-grid">
                <div className="tele-clean-item">
                  <span className="tele-clean-label">UPRIGHT SCORE</span>
                  <span className="tele-clean-val tele-clean-val--mint">{postureScore}%</span>
                  <span className="tele-clean-sub">Waktu duduk tegak</span>
                </div>

                <div className="tele-clean-item">
                  <span className="tele-clean-label">SLOUCH ALERTS</span>
                  <span className={`tele-clean-val ${slouchAlertCount > 0 ? 'tele-clean-val--coral' : ''}`}>
                    {slouchAlertCount}
                  </span>
                  <span className="tele-clean-sub">Peringatan bungkuk</span>
                </div>

                <div className="tele-clean-item">
                  <span className="tele-clean-label">ACTIVE TIME</span>
                  <span className="tele-clean-val">{formatTime(totalDetectedSeconds)}</span>
                  <span className="tele-clean-sub">Waktu sesi aktif</span>
                </div>
              </div>

              <div className="tele-clean-footer">
                <div className="tele-baseline-status">
                  <span className={`status-dot ${baselineCalibrated ? 'is-ok' : 'is-warn'}`} />
                  <span>
                    Baseline:{' '}
                    <strong>{baselineCalibrated ? 'Terkalibrasi (5 Detik)' : 'Standar Default'}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  className="tele-calib-btn"
                  onClick={openCalibrationFlow}
                >
                  <Sparkles size={13} />
                  <span>Kalibrasi Ulang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ---------------------------------------------------- */}
      {/* Initial / Onboarding Calibration Modal               */}
      {/* ---------------------------------------------------- */}
      {showCalibModal && (
        <div className="calib-modal-backdrop" role="dialog" aria-modal="true">
          <div className="calib-modal">
            <div className="calib-modal__head">
              <div>
                <span className="jp-label">（初回キャリブレーション）</span>
                <h3 className="calib-modal__title">Kalibrasi Postur Awal</h3>
              </div>
              <button
                type="button"
                className="calib-modal__close"
                onClick={() => {
                  setShowCalibModal(false);
                  setIsCalibratingLive(false);
                }}
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="calib-modal__body">
              <p className="calib-modal__lead">
                Furai mendeteksi bungkuk secara adaptif dengan membandingkan posisi dudukmu terhadap acuan tegak alami. Duduklah tegak selama <strong>5 detik</strong>.
              </p>

              {/* Live Calibration Visualizer Stage */}
              <div className="calib-modal__stage">
                {cameraActive ? (
                  <div className="calib-camera-preview-wrap">
                    <video
                      ref={modalVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="calib-preview-video"
                    />

                    {isCalibratingLive && (
                      <div className="calib-overlay-countdown">
                        <div className="calib-ring">
                          <span className="calib-ring-number">
                            {Math.max(1, Math.ceil(5 - (calibProgress / 100) * 5))}s
                          </span>
                          <span className="calib-ring-sub">Duduk Tegak</span>
                        </div>
                        <div className="calib-progress-track">
                          <div
                            className="calib-progress-fill"
                            style={{ width: `${calibProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {(calibSuccessNotice || baselineCalibrated) && !isCalibratingLive && (
                      <div className="calib-overlay-success">
                        <div className="calib-success-icon">
                          <Check size={28} strokeWidth={3} />
                        </div>
                        <h4>✓ Postur Terkalibrasi!</h4>
                        <p>Posisi idealmu berhasil disimpan.</p>
                      </div>
                    )}

                    {!isCalibratingLive && !calibSuccessNotice && !baselineCalibrated && (
                      <div className="calib-overlay-ready">
                        <p>Kamera aktif! Duduklah tegak menghadap layar.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="calib-ready-box">
                    <div className="calib-tips-list">
                      <div className="calib-tip-item">
                        <span className="calib-tip-num">1</span>
                        <span>Posisikan layar sejajar dengan pandangan mata</span>
                      </div>
                      <div className="calib-tip-item">
                        <span className="calib-tip-num">2</span>
                        <span>Tarik kedua bahu rileks ke belakang, buka rongga dada</span>
                      </div>
                      <div className="calib-tip-item">
                        <span className="calib-tip-num">3</span>
                        <span>Sandarkan punggung secara tegak dan nyaman</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="calib-modal__actions">
                {isCalibratingLive ? (
                  <button
                    type="button"
                    className="pill pill--ghost pill--lg"
                    onClick={() => {
                      setIsCalibratingLive(false);
                      setShowCalibModal(false);
                    }}
                  >
                    Batal
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="pill pill--dark pill--lg calib-action-start"
                      onClick={run5SecondCalibration}
                    >
                      <Sparkles size={18} />
                      <span>
                        {!cameraActive
                          ? '📸 Aktifkan Kamera & Mulai Kalibrasi (5s)'
                          : baselineCalibrated
                          ? 'Mulai Kalibrasi Ulang (5s)'
                          : 'Mulai Kalibrasi 5 Detik'}
                      </span>
                    </button>

                    <button
                      type="button"
                      className="pill pill--ghost pill--lg"
                      onClick={() => {
                        setShowCalibModal(false);
                        if (!cameraActive) startCamera();
                      }}
                    >
                      {baselineCalibrated ? 'Tutup & Mulai' : 'Lewati (Gunakan Standar Default)'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
