import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Sliders, X, RotateCcw, LogOut, User } from 'lucide-react';
import { syncUserToDb, saveUserPreferencesToDb, getUserSummaryStatsFromDb } from '../utils/db';

const ARCHETYPES = [
  { id: 'coder', title: 'Code & Debug', jp: '開発' },
  { id: 'thesis', title: 'Thesis & Paper', jp: '論文' },
  { id: 'laptop', title: 'Study Sprints', jp: '自習' },
  { id: 'chill', title: 'Casual Learner', jp: 'マイペース' },
];

const BADGES = [
  { kanji: '守', color: 'var(--yellow)', name: 'Spine Defender', meta: '≥ 85% × 3 sprints' },
  { kanji: '続', color: 'var(--coral)', name: 'Streak Pioneer', meta: '3-day streak' },
  { kanji: '完', color: 'var(--mint)', name: 'Zero Slouch', meta: '25 min, 0 nudges' },
  { kanji: '柔', color: '#fff', name: 'Zen Stretcher', meta: 'All 3 stretches' },
];

const STATS = [
  { no: 'STREAK', val: '3', unit: 'days' },
  { no: 'AVG SCORE', val: '91', unit: '%' },
  { no: 'SPRINTS', val: '14', unit: 'done' },
  { no: 'BADGES', val: '4', unit: '/ 4' },
];

const pref = (k, d) => localStorage.getItem(k) ?? d;

export default function ProfilePage({ user, onUpdateUser, onLogout, onBackToStudy, onBackToHome }) {
  const [form, setForm] = useState({
    name: user?.name || 'Alex Ebi',
    email: user?.email || 'alex.ebi@campus.edu',
    major: user?.major || 'Computer Science',
    archetypeId: user?.archetypeId || 'coder',
  });
  const [saved, setSaved] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(() => {
    return window.location.hash === '#settings';
  });
  const [modalTab, setModalTab] = useState(() => {
    return window.location.hash === '#settings' ? 'preferences' : 'profile';
  });
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const [sound, setSound] = useState(pref('furai_pref_sound', 'true') === 'true');
  const [sens, setSens] = useState(pref('furai_pref_sens', 'medium'));
  const [focus, setFocus] = useState(pref('furai_pref_focus', '25'));
  const [brk, setBrk] = useState(pref('furai_pref_break', '5'));
  const [potato, setPotato] = useState(pref('furai_pref_potato', 'false') === 'true');

  const [dbStats, setDbStats] = useState({
    streakDays: 3,
    avgScore: 94,
    totalSprints: 14,
    badges: 4,
  });

  // Muat statistik nyata dari Neon DB bila user terhubung
  useEffect(() => {
    if (user?.id) {
      getUserSummaryStatsFromDb(user.id).then((st) => {
        if (st) {
          setDbStats({
            streakDays: Math.max(1, Number(st.streak_days) || 1),
            avgScore: Math.round(Number(st.avg_score)) || 94,
            totalSprints: Number(st.total_sprints) || 0,
            badges: 4,
          });
        }
      }).catch((e) => console.warn('Neon stats load error:', e));
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || 'Alex Ebi',
        email: user.email || 'alex.ebi@campus.edu',
        major: user.major || 'Computer Science',
        archetypeId: user.archetypeId || 'coder',
      });
    }
  }, [user]);

  const set = (key, val, setter) => {
    setter(val);
    localStorage.setItem(key, String(val));
    if (user?.id) {
      saveUserPreferencesToDb(user.id, {
        soundEnabled: key === 'furai_pref_sound' ? val : sound,
        sensitivity: key === 'furai_pref_sens' ? val : sens,
        potatoMode: key === 'furai_pref_potato' ? val : potato,
      }).catch((e) => console.warn('Neon save pref error:', e));
    }
  };

  const initial = (form.name.trim().charAt(0) || 'U').toUpperCase();
  const arch = ARCHETYPES.find((a) => a.id === form.archetypeId) || ARCHETYPES[0];

  /* Close modal on ESC key */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && settingsOpen) {
        setSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settingsOpen]);

  const openSettingsModal = (tab = 'preferences') => {
    setModalTab(tab);
    setSettingsOpen(true);
  };

  const save = (e) => {
    e.preventDefault();
    const updated = {
      ...user,
      name: form.name.trim() || 'Alex Ebi',
      email: form.email.trim(),
      major: form.major.trim() || arch.title,
      archetypeId: arch.id,
      archetypeTitle: arch.title,
      archetypeJp: arch.jp,
    };

    // Sinkronisasi pembaruan profil ke Neon DB
    syncUserToDb({
      email: updated.email,
      name: updated.name,
      archetype: updated.archetypeId,
      archetypeJp: updated.archetypeJp,
    }).then((dbUser) => {
      if (dbUser?.id && !updated.id) {
        updated.id = dbUser.id;
        localStorage.setItem('furai_user', JSON.stringify(updated));
      }
    }).catch((e) => console.warn('Neon sync user profile error:', e));

    localStorage.setItem('furai_user', JSON.stringify(updated));
    onUpdateUser?.(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const handleResetData = () => {
    localStorage.removeItem('furai_sessions');
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2500);
  };

  const Seg = ({ value, options, onChange }) => (
    <div className="pf-seg">
      {options.map(([v, label]) => (
        <button
          type="button"
          key={v}
          className={value === v ? 'is-on' : ''}
          onClick={() => onChange(v)}
        >
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="pf">
      {/* Hero — cobalt frame + white stage */}
      <section className="pf-hero">
        <header className="pf-bar">
          <button type="button" className="pf-bar__back" onClick={onBackToStudy || onBackToHome}>
            <ArrowLeft size={15} /> Study space
          </button>

          <a
            href="#top"
            className="logo"
            onClick={(e) => {
              e.preventDefault();
              onBackToHome?.();
            }}
          >
            Furai <span className="logo__jp">フライ</span>
          </a>

          <button
            type="button"
            className="pill pill--light pf-bar__settings-btn"
            onClick={() => openSettingsModal('preferences')}
            title="Open Settings Menu"
          >
            <Sliders size={14} />
            <span>Settings （設定）</span>
          </button>
        </header>

        <div className="pf-stage">
          <p className="pf-stage__vertical">背筋、のびてる？</p>

          <div className="pf-stage__id">
            <div className="pf-initial">{initial}</div>
            <div>
              <p className="jp-label">（プロフィール）</p>
              <h1 className="pf-name">{form.name}</h1>
              <p className="pf-meta">
                <span className="pf-tag">{arch.jp}</span>
                {form.major} — {form.email}
              </p>

              <div className="pf-stage__actions">
                <button
                  type="button"
                  className="pill pill--dark pf-stage__btn"
                  onClick={() => openSettingsModal('profile')}
                >
                  <User size={13} /> Edit Profile （編集）
                </button>
                <button
                  type="button"
                  className="pill pill--light pf-stage__btn"
                  onClick={() => openSettingsModal('preferences')}
                >
                  <Sliders size={13} /> Settings （設定）
                </button>
              </div>
            </div>
          </div>

          <div className="pf-stats">
            <div className="pf-stat">
              <span className="pf-stat__no">STREAK</span>
              <span className="pf-stat__val">
                {dbStats.streakDays}
                <small>days</small>
              </span>
            </div>
            <div className="pf-stat">
              <span className="pf-stat__no">AVG SCORE</span>
              <span className="pf-stat__val">
                {dbStats.avgScore}
                <small>%</small>
              </span>
            </div>
            <div className="pf-stat">
              <span className="pf-stat__no">SPRINTS</span>
              <span className="pf-stat__val">
                {dbStats.totalSprints}
                <small>done</small>
              </span>
            </div>
            <div className="pf-stat">
              <span className="pf-stat__no">BADGES</span>
              <span className="pf-stat__val">
                {dbStats.badges}
                <small>/ 4</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Badges — dōzo sky band */}
      <div className="band band--sky pf-band">
        <section className="section">
          <div className="section-head">
            <span className="eyebrow">EARNED, NOT BOUGHT</span>
            <h2 className="display">Badges</h2>
            <p className="section-head__jp">（獲得バッジ）</p>
          </div>
          <div className="pf-badges">
            {BADGES.map((b) => (
              <div className="pf-badge" key={b.name}>
                <div className="pf-badge__circle" style={{ background: b.color }}>
                  {b.kanji}
                </div>
                <h3>{b.name}</h3>
                <span>{b.meta}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ======================================================== */}
      {/* POPUP MODAL: SETTINGS & EDIT PROFILE                     */}
      {/* ======================================================== */}
      {settingsOpen && (
        <div
          className="pf-modal-backdrop"
          onClick={() => setSettingsOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="pf-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="pf-modal__head">
              <div>
                <p className="jp-label">
                  {modalTab === 'profile' ? '（プロフィール編集）' : '（環境設定メニュー）'}
                </p>
                <h2 className="display" style={{ fontSize: '24px' }}>
                  {modalTab === 'profile' ? 'EDIT PROFILE' : 'SETTINGS'}
                </h2>
              </div>
              <button
                type="button"
                className="pf-modal__close"
                onClick={() => setSettingsOpen(false)}
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tab Switcher */}
            <div className="pf-modal__tabs">
              <button
                type="button"
                className={`pf-modal__tab ${modalTab === 'profile' ? 'is-active' : ''}`}
                onClick={() => setModalTab('profile')}
              >
                <User size={14} /> Profile （プロフ）
              </button>
              <button
                type="button"
                className={`pf-modal__tab ${modalTab === 'preferences' ? 'is-active' : ''}`}
                onClick={() => setModalTab('preferences')}
              >
                <Sliders size={14} /> Preferences （設定）
              </button>
            </div>

            {/* Modal Content */}
            <div className="pf-modal__body">
              {modalTab === 'profile' ? (
                /* TAB 1: Edit Profile Form */
                <form className="pf-modal__profile-form" onSubmit={save}>
                  <div className="pf-rows">
                    <label className="pf-row">
                      <span className="pf-row__label">Name</span>
                      <input
                        className="pf-input"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        placeholder="Your full name"
                      />
                    </label>
                    <label className="pf-row">
                      <span className="pf-row__label">Email</span>
                      <input
                        type="email"
                        className="pf-input"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        placeholder="you@campus.edu"
                      />
                    </label>
                    <label className="pf-row">
                      <span className="pf-row__label">Studying</span>
                      <input
                        className="pf-input"
                        value={form.major}
                        onChange={(e) => setForm({ ...form, major: e.target.value })}
                        placeholder="e.g. Computer Science"
                      />
                    </label>
                    <div className="pf-row">
                      <span className="pf-row__label">Style</span>
                      <Seg
                        value={form.archetypeId}
                        options={ARCHETYPES.map((a) => [a.id, a.jp])}
                        onChange={(v) => setForm({ ...form, archetypeId: v })}
                      />
                    </div>
                  </div>

                  <div className="pf-modal__action-row">
                    <button type="submit" className="pill pill--dark pf-modal-save">
                      {saved ? (
                        <>
                          <Check size={15} /> Changes saved!
                        </>
                      ) : (
                        <>
                          Save changes <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* TAB 2: App Preferences & Telemetry */
                <>
                  <div className="pf-rows">
                    <div className="pf-row">
                      <span className="pf-row__label">Sound nudge</span>
                      <Seg
                        value={sound}
                        options={[[true, 'On'], [false, 'Off']]}
                        onChange={(v) => set('furai_pref_sound', v, setSound)}
                      />
                    </div>
                    <div className="pf-row">
                      <span className="pf-row__label">Sensitivity</span>
                      <Seg
                        value={sens}
                        options={[['low', 'Low'], ['medium', 'Mid'], ['high', 'High']]}
                        onChange={(v) => set('furai_pref_sens', v, setSens)}
                      />
                    </div>
                    <div className="pf-row">
                      <span className="pf-row__label">Focus sprint</span>
                      <Seg
                        value={focus}
                        options={[['25', '25 min'], ['50', '50 min']]}
                        onChange={(v) => set('furai_pref_focus', v, setFocus)}
                      />
                    </div>
                    <div className="pf-row">
                      <span className="pf-row__label">Stretch break</span>
                      <Seg
                        value={brk}
                        options={[['5', '5 min'], ['10', '10 min']]}
                        onChange={(v) => set('furai_pref_break', v, setBrk)}
                      />
                    </div>
                    <div className="pf-row">
                      <span className="pf-row__label">
                        Potato mode <small>15 fps</small>
                      </span>
                      <Seg
                        value={potato}
                        options={[[true, 'On'], [false, 'Off']]}
                        onChange={(v) => set('furai_pref_potato', v, setPotato)}
                      />
                    </div>
                  </div>

                  {/* Data Reset (SRS FR-24) */}
                  <div className="pf-modal__subrow">
                    <div className="pf-modal__subrow-info">
                      <strong>Reset session telemetry</strong>
                      <p>Clear temporary sprint logs and history.</p>
                    </div>
                    <button
                      type="button"
                      className="pf-btn-sub"
                      onClick={handleResetData}
                    >
                      <RotateCcw size={13} />
                      <span>{resetDone ? 'Reset done!' : 'Reset data'}</span>
                    </button>
                  </div>

                  {/* Logout Area */}
                  <div className="pf-modal__logout">
                    {confirmLogout ? (
                      <div className="pf-logout-confirm">
                        <span>Leaving this workstation?</span>
                        <button
                          type="button"
                          className="pill-coral"
                          onClick={() => {
                            setSettingsOpen(false);
                            onLogout?.();
                          }}
                        >
                          <LogOut size={14} /> yes, log out
                        </button>
                        <button
                          type="button"
                          className="pf-link"
                          onClick={() => setConfirmLogout(false)}
                        >
                          stay
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="pf-link"
                        onClick={() => setConfirmLogout(true)}
                      >
                        Log out of Furai （ログアウト） →
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
