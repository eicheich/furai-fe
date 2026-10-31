import React, { useState, useEffect } from 'react';
import { Camera, ShieldCheck, Sparkles, Volume2, VolumeX, RefreshCw, CheckCircle2, AlertTriangle, Sprout, WifiOff, X } from 'lucide-react';

export default function InteractiveDemoModal({ isOpen, onClose }) {
  const [step, setStep] = useState('consent'); // 'consent' | 'calibrating' | 'session' | 'report'
  const [calibProgress, setCalibProgress] = useState(0);
  const [simulatedPosture, setSimulatedPosture] = useState('tegak'); // 'tegak' | 'bungkuk' | 'keluar'
  const [soundOn, setSoundOn] = useState(true);
  const [sensitivity, setSensitivity] = useState('medium');
  const [slouchCount, setSlouchCount] = useState(2);
  const [score, setScore] = useState(88);

  useEffect(() => {
    if (step === 'calibrating') {
      setCalibProgress(0);
      const interval = setInterval(() => {
        setCalibProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep('session'), 300);
            return 100;
          }
          return prev + 20;
        });
      }, 450);
      return () => clearInterval(interval);
    }
  }, [step]);

  if (!isOpen) return null;

  const triggerSlouch = (mode) => {
    setSimulatedPosture(mode);
    if (mode === 'bungkuk') {
      setSlouchCount((c) => c + 1);
      setScore((s) => Math.max(55, s - 4));
    } else if (mode === 'tegak') {
      setScore((s) => Math.min(98, s + 2));
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 20, 50, 0.78)',
        backdropFilter: 'blur(6px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="brutal-box"
        style={{
          background: '#F4F3EE',
          borderRadius: '28px',
          maxWidth: '880px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          position: 'relative',
          border: '3px solid #151515',
          boxShadow: '10px 10px 0px #FFE14D',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div
          style={{
            background: '#283897',
            color: '#fff',
            padding: '18px 28px',
            borderBottom: '3px solid #151515',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                background: '#FFE14D',
                color: '#151515',
                padding: '4px 12px',
                borderRadius: '999px',
                fontWeight: 800,
                fontSize: '0.78rem',
                border: '2px solid #151515',
              }}
            >
              INTERACTIVE PROTOTYPE
            </span>
            <h3 className="font-rounded" style={{ fontSize: '1.25rem', letterSpacing: '0.02em' }}>
              Furai Study Buddy Simulation Flow 🍤
            </h3>
          </div>
          <button
            onClick={onClose}
            className="brutal-pill"
            style={{
              background: '#FF6B2B',
              color: '#151515',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
            }}
            title="Close Simulation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stepper Pills */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '14px 28px',
            background: '#EAE8E0',
            borderBottom: '2.5px solid #151515',
            flexWrap: 'wrap',
          }}
        >
          {[
            { id: 'consent', label: '1. Consent & Privacy (FR-01)' },
            { id: 'calibrating', label: '2. 10s Calibration (FR-03)' },
            { id: 'session', label: '3. Live Detection (FR-04)' },
            { id: 'report', label: '4. Session Report (FR-14)' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: '2px solid #151515',
                background: step === s.id ? '#52C597' : '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: step === s.id ? '2px 2px 0px #151515' : 'none',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px' }}>
          {step === 'consent' && (
            <div style={{ textAlign: 'center', maxWidth: '620px', margin: '0 auto' }}>
              <div
                style={{
                  display: 'inline-block',
                  background: '#FFE14D',
                  border: '2.5px solid #151515',
                  borderRadius: '20px',
                  padding: '8px 18px',
                  fontWeight: 800,
                  marginBottom: '16px',
                  transform: 'rotate(-2deg)',
                }}
              >
                🔒 ZERO-LEAK PRIVACY GUARANTEE (FR-01 & NFR-01)
              </div>
              <h2 className="font-display" style={{ fontSize: '2rem', marginBottom: '12px' }}>
                Your Bedroom & Tired Face Stay On Your Device!
              </h2>
              <p style={{ color: '#333', marginBottom: '24px', fontSize: '0.98rem' }}>
                Per the <strong>Study Buddy</strong> specification, all skeletal landmark extraction (Google MediaPipe Pose)
                runs <strong>100% locally in your laptop browser memory</strong> via WebAssembly. Zero video uploads, zero server databases, zero logins required!
              </p>

              <div
                className="brutal-box"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '20px',
                  textAlign: 'left',
                  marginBottom: '24px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <ShieldCheck size={24} color="#283897" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>0 Video Bytes Transmitted</div>
                    <div style={{ fontSize: '0.8rem', color: '#555' }}>Fully verifiable via your browser Network DevTools panel.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <WifiOff size={24} color="#C44828" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Camera-Free Mode (FR-22)</div>
                    <div style={{ fontSize: '0.8rem', color: '#555' }}>Feeling camera-shy? Enjoy structured timers and stretch breaks without webcam access!</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setStep('calibrating')}
                  className="brutal-pill"
                  style={{
                    background: '#52C597',
                    padding: '14px 28px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <Camera size={20} /> Accept & Start 10s Calibration →
                </button>
                <button
                  onClick={() => {
                    setSimulatedPosture('tegak');
                    setStep('session');
                  }}
                  className="brutal-pill"
                  style={{
                    background: '#FFFFFF',
                    padding: '14px 22px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                  }}
                >
                  Test Camera-Free Mode (FR-22)
                </button>
              </div>
            </div>
          )}

          {step === 'calibrating' && (
            <div style={{ textAlign: 'center', maxWidth: '580px', margin: '0 auto', padding: '16px 0' }}>
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  margin: '0 auto 18px',
                  borderRadius: '50%',
                  background: '#9AD9EA',
                  border: '3px solid #151515',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3.2rem',
                  boxShadow: '5px 5px 0px #151515',
                }}
              >
                🧘
              </div>
              <h2 className="font-display" style={{ fontSize: '1.85rem', marginBottom: '8px' }}>
                Sit Up Straight Like A Sentinel... ({calibProgress}%)
              </h2>
              <p style={{ color: '#444', marginBottom: '20px' }}>
                Saving your shoulder & ear <code>baseline_metrics</code> into local <code>IndexedDB</code> as reference data (FR-03)...
              </p>
              <div
                style={{
                  width: '100%',
                  height: '26px',
                  background: '#FFFFFF',
                  border: '3px solid #151515',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    width: `${calibProgress}%`,
                    height: '100%',
                    background: 'repeating-linear-gradient(45deg, #52C597, #52C597 12px, #3eb082 12px, #3eb082 24px)',
                    transition: 'width 0.35s ease',
                  }}
                />
              </div>
              <button
                onClick={() => setStep('session')}
                className="staz-coral-pill"
              >
                Skip to Live Session →
              </button>
            </div>
          )}

          {step === 'session' && (
            <div>
              {/* Supportive Alert Banner */}
              {simulatedPosture === 'bungkuk' && (
                <div
                  className="brutal-box animate-alarm"
                  style={{
                    background: '#FFE14D',
                    borderRadius: '18px',
                    padding: '14px 20px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.8rem' }}>🍤</span>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '0.98rem' }}>
                        Alert: Ebi Furai shrimp curvature triggered! (FR-07)
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#222' }}>
                        Gently draw your shoulders back so your neck does not cramp. Your virtual plant is cheering for you! 🌱
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerSlouch('tegak')}
                    className="brutal-pill"
                    style={{
                      background: '#52C597',
                      padding: '8px 16px',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                    }}
                  >
                    All Good, I&apos;m Upright! ✨
                  </button>
                </div>
              )}

              {simulatedPosture === 'keluar' && (
                <div
                  className="brutal-box"
                  style={{
                    background: '#9AD9EA',
                    borderRadius: '18px',
                    padding: '14px 20px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                    ⏸️ Out of camera frame (grabbing coffee?). Pomodoro timer paused automatically & not penalized as slouching! (FR-06)
                  </div>
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                }}
              >
                {/* Left: Live Visual Stage */}
                <div
                  className="brutal-box"
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '22px',
                    padding: '18px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span
                      style={{
                        background:
                          simulatedPosture === 'tegak'
                            ? '#52C597'
                            : simulatedPosture === 'bungkuk'
                            ? '#FF6B2B'
                            : '#9AD9EA',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        border: '2px solid #151515',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                      }}
                    >
                      STATUS: {simulatedPosture === 'tegak' ? 'UPRIGHT' : simulatedPosture === 'bungkuk' ? 'SLOUCHED' : 'AWAY'}
                    </span>
                    <span className="font-mono-code" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                      MediaPipe: 30 FPS (Local)
                    </span>
                  </div>

                  {/* Mini Posture Stage */}
                  <div
                    style={{
                      position: 'relative',
                      height: '210px',
                      background: simulatedPosture === 'bungkuk' ? '#FFF0E6' : '#EBF9F3',
                      border: '2px dashed #151515',
                      borderRadius: '16px',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src="/assets/desk-monitor.svg"
                      alt="Desk"
                      style={{
                        position: 'absolute',
                        bottom: '-28px',
                        left: '-10px',
                        width: '320px',
                        pointerEvents: 'none',
                      }}
                    />
                    {simulatedPosture !== 'keluar' && (
                      <img
                        src="/assets/shrimp-chair.svg"
                        alt="Shrimp"
                        style={{
                          position: 'absolute',
                          bottom: '-18px',
                          right: '10px',
                          width: '210px',
                          transformOrigin: 'bottom center',
                          transform:
                            simulatedPosture === 'bungkuk'
                              ? 'rotate(-12deg) translateX(-18px) scaleY(0.92)'
                              : 'rotate(8deg) scaleY(1.05)',
                          transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                      />
                    )}
                  </div>

                  {/* Simulator Buttons */}
                  <div style={{ marginTop: '14px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, marginBottom: '8px', color: '#444' }}>
                      CLICK TO TEST DETECTION REACTION (FR-04):
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => triggerSlouch('tegak')}
                        className="brutal-pill"
                        style={{
                          background: simulatedPosture === 'tegak' ? '#52C597' : '#fff',
                          padding: '6px 12px',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                        }}
                      >
                        🗿 Sit Upright
                      </button>
                      <button
                        onClick={() => triggerSlouch('bungkuk')}
                        className="brutal-pill"
                        style={{
                          background: simulatedPosture === 'bungkuk' ? '#FF6B2B' : '#fff',
                          padding: '6px 12px',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                        }}
                      >
                        🍤 Slouch (Shrimp!)
                      </button>
                      <button
                        onClick={() => triggerSlouch('keluar')}
                        className="brutal-pill"
                        style={{
                          background: simulatedPosture === 'keluar' ? '#9AD9EA' : '#fff',
                          padding: '6px 12px',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                        }}
                      >
                        🚶 Leave Frame
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Pomodoro + Plant + Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div
                    className="brutal-box"
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '20px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#666' }}>
                        POMODORO FOCUS (FR-09)
                      </div>
                      <div className="font-mono-code" style={{ fontSize: '2rem', fontWeight: 700 }}>
                        {simulatedPosture === 'keluar' ? '24:12 (PAUSED)' : '24:12'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#666' }}>UPRIGHT SCORE</div>
                      <div
                        className="font-display"
                        style={{
                          fontSize: '1.9rem',
                          color: score >= 80 ? '#2b9368' : '#C44828',
                        }}
                      >
                        {score}%
                      </div>
                    </div>
                  </div>

                  {/* Virtual Plant Card (FR-18) */}
                  <div
                    className="brutal-box"
                    style={{
                      background: score >= 80 ? '#E6F9F0' : '#FFF4E0',
                      borderRadius: '20px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                    }}
                  >
                    <div
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '16px',
                        background: '#FFFFFF',
                        border: '2.5px solid #151515',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.9rem',
                      }}
                    >
                      {score >= 80 ? '🌻' : '🥀'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                        Virtual Garden (FR-18): {score >= 80 ? 'Thriving!' : 'Wilting Gradually...'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#444' }}>
                        Maintain upright score ≥ 80% for 25 minutes to avoid turning into shrimp crackers!
                      </div>
                    </div>
                  </div>

                  {/* Sensitivity & Sound Controls */}
                  <div
                    className="brutal-box"
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '20px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, marginRight: '8px' }}>
                        Sensitivity (FR-05):
                      </span>
                      {['low', 'medium', 'high'].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setSensitivity(lvl)}
                          style={{
                            padding: '3px 10px',
                            marginRight: '4px',
                            borderRadius: '999px',
                            border: '1.5px solid #151515',
                            background: sensitivity === lvl ? '#FFE14D' : '#F4F3EE',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                          }}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setSoundOn(!soundOn)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        borderRadius: '999px',
                        border: '2px solid #151515',
                        background: soundOn ? '#9AD9EA' : '#eee',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
                      {soundOn ? 'Audio On' : 'Mute'}
                    </button>
                  </div>

                  <button
                    onClick={() => setStep('report')}
                    className="brutal-pill"
                    style={{
                      background: '#151515',
                      color: '#FFFFFF',
                      padding: '12px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                    }}
                  >
                    End Session & View Posture Analytics (FR-14) →
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'report' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span
                    style={{
                      background: '#52C597',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      border: '2px solid #151515',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                    }}
                  >
                    SESSION COMPLETED · STORED IN INDEXEDDB
                  </span>
                  <h2 className="font-display" style={{ fontSize: '1.75rem', marginTop: '6px' }}>
                    Your Anti-Shrimp Report Card Today 📊
                  </h2>
                </div>
                <button
                  onClick={() => setStep('session')}
                  className="staz-coral-pill"
                >
                  ← Back to Session
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '14px',
                  marginBottom: '20px',
                }}
              >
                <div className="brutal-box" style={{ background: '#FFE14D', borderRadius: '18px', padding: '16px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>HEALTHY POSTURE SCORE</div>
                  <div className="font-display" style={{ fontSize: '2.2rem' }}>{score}%</div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700 }}>Garden Target ≥ 80% Achieved!</div>
                </div>
                <div className="brutal-box" style={{ background: '#9AD9EA', borderRadius: '18px', padding: '16px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>SHRIMP SLOUCH ALERTS</div>
                  <div className="font-display" style={{ fontSize: '2.2rem' }}>{slouchCount}x</div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700 }}>Vulnerable at minute 14</div>
                </div>
                <div className="brutal-box" style={{ background: '#FFFFFF', borderRadius: '18px', padding: '16px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>PRIVACY AUDIT (NFR-01)</div>
                  <div className="font-display" style={{ fontSize: '2.2rem', color: '#2b9368' }}>0 KB</div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700 }}>Image bytes uploaded over network</div>
                </div>
              </div>

              {/* Simulated Interval Chart */}
              <div className="brutal-box" style={{ background: '#FFFFFF', borderRadius: '20px', padding: '18px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '12px' }}>
                  Slouch Tendency by Time Interval (FR-15):
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '90px', paddingTop: '10px' }}>
                  {[
                    { m: '0-5m', val: 95, status: 'tegak' },
                    { m: '5-10m', val: 92, status: 'tegak' },
                    { m: '10-15m', val: 64, status: 'bungkuk' },
                    { m: '15-20m', val: 88, status: 'tegak' },
                    { m: '20-25m', val: 94, status: 'tegak' },
                  ].map((bar) => (
                    <div key={bar.m} style={{ flex: 1, textAlign: 'center' }}>
                      <div
                        style={{
                          height: `${bar.val * 0.65}px`,
                          background: bar.status === 'tegak' ? '#52C597' : '#FF6B2B',
                          border: '2px solid #151515',
                          borderRadius: '8px 8px 0 0',
                        }}
                      />
                      <div className="font-mono-code" style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: 700 }}>
                        {bar.m}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
