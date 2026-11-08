import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  User,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Laptop,
  BookOpen,
  Coffee,
  Code
} from 'lucide-react';
import { syncUserToDb } from '../utils/db';

const STUDY_ARCHETYPES = [
  {
    id: 'coder',
    title: 'Code & Debug',
    jp: '開発',
    desc: 'Late-night terminal sessions & deep problem solving',
    icon: Code,
  },
  {
    id: 'thesis',
    title: 'Thesis & Paper',
    jp: '論文',
    desc: 'Long reading hours, citation hunts & drafting',
    icon: BookOpen,
  },
  {
    id: 'laptop',
    title: 'Study Sprints',
    jp: '自習',
    desc: 'Pomodoro intervals with guided posture stretch breaks',
    icon: Laptop,
  },
  {
    id: 'chill',
    title: 'Casual Learner',
    jp: 'マイペース',
    desc: 'Gentle nudges when slouching past tolerance',
    icon: Coffee,
  },
];

export default function AuthPage({ initialMode = 'login', onBack, onSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState('coder');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    major: '',
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setError('');
    setSuccessMsg('');
  }, [initialMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && !formData.name.trim()) {
      setError('Please provide a study nickname or alias.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (formData.password.length < 4) {
      setError('Password must contain at least 4 characters.');
      return;
    }

    const archetype = STUDY_ARCHETYPES.find((a) => a.id === selectedArchetype) || STUDY_ARCHETYPES[0];
    const userPayload = {
      name: mode === 'register' ? formData.name.trim() : formData.email.split('@')[0],
      email: formData.email.trim(),
      major: formData.major.trim() || archetype.title,
      archetypeId: archetype.id,
      archetypeTitle: archetype.title,
      archetypeJp: archetype.jp,
    };

    // Sinkronisasi akun ke Neon Database di background
    syncUserToDb({
      email: userPayload.email,
      name: userPayload.name,
      archetype: userPayload.archetypeId,
      archetypeJp: userPayload.archetypeJp,
    }).then((dbUser) => {
      if (dbUser?.id) {
        userPayload.id = dbUser.id;
        localStorage.setItem('furai_user', JSON.stringify(userPayload));
      }
    }).catch((e) => console.warn('Neon sync warning:', e));

    localStorage.setItem('furai_user', JSON.stringify(userPayload));
    setSuccessMsg(
      mode === 'register'
        ? `Welcome to Furai, ${userPayload.name}! Your study profile is ready.`
        : `Welcome back, ${userPayload.name}! Session loaded successfully.`
    );

    setTimeout(() => {
      onSuccess?.(userPayload);
    }, 800);
  };

  const handleDemoFill = () => {
    if (mode === 'login') {
      setFormData({
        name: 'Alex Ebi',
        email: 'alex.ebi@campus.edu',
        password: 'password123',
        major: 'Software Engineering',
      });
    } else {
      setFormData({
        name: 'Alex Ebi',
        email: 'alex.ebi@campus.edu',
        password: 'password123',
        major: 'Computer Science & Human Factors',
      });
      setSelectedArchetype('coder');
    }
    setError('');
  };

  return (
    <div className="auth-view">
      {/* Main Container */}
      <main className="auth-container">
        <div className="auth-subbar">
          <button type="button" className="auth-nav__back" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>← Back to Furai （ホームに戻る）</span>
          </button>

          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              onBack();
            }}
            className="auth-subbar__logo"
          >
            Furai <span className="logo__jp">フライ</span>
          </a>

          <div className="auth-nav__tag">
            <ShieldCheck size={14} />
            <span>SESSION READY // BROWSER APP</span>
          </div>
        </div>

        <div className="card-staz card-staz--auth">
          {/* Subtle STAZ Ornaments */}
          <span className="doodle-plus" style={{ top: 28, left: '26%' }}>+</span>
          <span className="doodle-plus" style={{ bottom: 32, right: '22%' }}>+</span>

          <div className="auth-grid">
            {/* Left Column: Editorial Graphic Stage */}
            <div className="auth-hero-stage">
              <div className="auth-hero-stage__header">
                <span className="jp-label">（姿勢がすべて。）</span>
                <h2 className="auth-hero-stage__title">
                  STAY<br />UPRIGHT.
                </h2>
                <p className="auth-hero-stage__desc">
                  Your personal study buddy that detects slouching in real time using local WebAssembly.
                </p>
              </div>

              {/* Mini Art Showcase */}
              <div className="auth-art-frame">
                <p className="auth-art__vertical">猫背、卒業。</p>
                <img
                  src="/assets/shrimp-chair.svg"
                  alt="Furai study mascot"
                  className="auth-art__shrimp"
                />
                <div className="auth-art__badge">
                  <span className="auth-art__dot" />
                  <span>猫背 · 58°</span>
                </div>
              </div>

              {/* Feature Points */}
              <ul className="auth-perks">
                <li>
                  <div className="auth-perk__icon"><Check size={14} strokeWidth={3} /></div>
                  <span>100% on-device MediaPipe pose landmarker</span>
                </li>
                <li>
                  <div className="auth-perk__icon"><Check size={14} strokeWidth={3} /></div>
                  <span>Zero video frames or camera feeds sent to servers</span>
                </li>
                <li>
                  <div className="auth-perk__icon"><Check size={14} strokeWidth={3} /></div>
                  <span>Pomodoro sessions and posture scores stay in your browser</span>
                </li>
              </ul>

              <div className="auth-starburst" aria-hidden>
                LOCAL
                <br />
                PROOF
              </div>
            </div>

            {/* Right Column: Clean Editorial Form */}
            <div className="auth-form-panel">
              {/* Tab Selector */}
              <div className="auth-tabs" role="tablist">
                <button
                  type="button"
                  className={`auth-tab ${mode === 'login' ? 'is-active' : ''}`}
                  onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                >
                  <span className="auth-tab__en">Log In</span>
                  <span className="auth-tab__jp">ログイン</span>
                </button>
                <button
                  type="button"
                  className={`auth-tab ${mode === 'register' ? 'is-active' : ''}`}
                  onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                >
                  <span className="auth-tab__en">Register</span>
                  <span className="auth-tab__jp">新規登録</span>
                </button>
              </div>

              <div className="auth-form-header">
                <h3 className="auth-form-title">
                  {mode === 'login' ? 'WELCOME BACK' : 'CREATE STUDY PROFILE'}
                </h3>
                <p className="auth-form-sub">
                  {mode === 'login'
                    ? 'Access your saved posture calibration and Pomodoro history.'
                    : 'Set up your student profile to track your upright study habits.'}
                </p>
              </div>

              {error && (
                <div className="auth-alert auth-alert--error" role="alert">
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="auth-alert auth-alert--success" role="status">
                  <Check size={16} strokeWidth={3} />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                {mode === 'register' && (
                  <div className="auth-field">
                    <label className="auth-label">
                      <span>STUDY NICKNAME</span>
                      <small>ニックネーム</small>
                    </label>
                    <div className="auth-input-wrap">
                      <User size={16} className="auth-input-icon" />
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="e.g. Alex Ebi"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="auth-field">
                  <label className="auth-label">
                    <span>EMAIL ADDRESS</span>
                    <small>メールアドレス</small>
                  </label>
                  <div className="auth-input-wrap">
                    <Mail size={16} className="auth-input-icon" />
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="student@campus.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">
                    <span>PASSWORD</span>
                    <small>パスワード</small>
                  </label>
                  <div className="auth-input-wrap">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="At least 4 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <>
                    <div className="auth-field">
                      <label className="auth-label">
                        <span>STUDY FOCUS / MAJOR (OPTIONAL)</span>
                        <small>専攻・課題</small>
                      </label>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="e.g. Computer Science, Thesis, Japanese Lit"
                        value={formData.major}
                        onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      />
                    </div>

                    <div className="auth-field">
                      <label className="auth-label">
                        <span>SELECT STUDY ARCHETYPE</span>
                        <small>学習スタイル</small>
                      </label>
                      <div className="auth-archetype-grid">
                        {STUDY_ARCHETYPES.map((arch) => {
                          const Icon = arch.icon;
                          const isSelected = selectedArchetype === arch.id;
                          return (
                            <button
                              type="button"
                              key={arch.id}
                              className={`auth-arch-card ${isSelected ? 'is-selected' : ''}`}
                              onClick={() => setSelectedArchetype(arch.id)}
                            >
                              <div className="auth-arch-top">
                                <span className="auth-arch-jp">{arch.jp}</span>
                                <Icon size={16} />
                              </div>
                              <span className="auth-arch-title">{arch.title}</span>
                              <span className="auth-arch-desc">{arch.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                <div className="auth-actions">
                  <button type="submit" className="pill pill--dark auth-submit-btn">
                    <span>{mode === 'login' ? 'Sign in to study space' : 'Create study profile'}</span>
                    <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    className="auth-demo-btn"
                    onClick={handleDemoFill}
                  >
                    <span>⚡ Fill demo credentials</span>
                    <small>（ワンクリック入力）</small>
                  </button>
                </div>
              </form>

              <footer className="auth-form-foot">
                <p>
                  {mode === 'login' ? (
                    <>
                      Don't have a profile yet?{' '}
                      <button
                        type="button"
                        className="auth-inline-switch"
                        onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                      >
                        Register here （新規登録）
                      </button>
                    </>
                  ) : (
                    <>
                      Already registered?{' '}
                      <button
                        type="button"
                        className="auth-inline-switch"
                        onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                      >
                        Log in here （ログイン）
                      </button>
                    </>
                  )}
                </p>

              </footer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

