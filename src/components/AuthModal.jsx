import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, ArrowRight, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';

const SHRIMP_AVATARS = [
  { id: 'tempura', emoji: '🍤', label: 'Ebi Tempura', desc: 'Slouches during late-night debugging' },
  { id: 'shrimp', emoji: '🦐', label: 'Boiled Shrimp', desc: 'Starts tilting around minute 15' },
  { id: 'lobster', emoji: '🦞', label: 'Sigma Lobster', desc: 'Aims for 85%+ upright discipline' },
  { id: 'sprout', emoji: '🌻', label: 'Focus Gardener', desc: 'Protects the virtual garden at all costs' },
];

export default function AuthModal({ isOpen, initialMode = 'login', onClose, onSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('tempura');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    major: '',
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  React.useEffect(() => {
    setMode(initialMode);
    setError('');
    setSuccessMsg('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && !formData.name.trim()) {
      setError('Please enter your nickname so we don’t have to call you "Hey Shrimp"!');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid email (e.g. shrimp@campus.edu)');
      return;
    }
    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters long!');
      return;
    }

    const chosen = SHRIMP_AVATARS.find((a) => a.id === selectedAvatar) || SHRIMP_AVATARS[0];
    const userPayload = {
      name: mode === 'register' ? formData.name.trim() : formData.email.split('@')[0],
      email: formData.email.trim(),
      major: formData.major.trim() || 'Thesis & Code Warrior',
      avatar: chosen.emoji,
      persona: chosen.label,
    };

    localStorage.setItem('furai_user', JSON.stringify(userPayload));
    setSuccessMsg(
      mode === 'register'
        ? `🎉 Welcome aboard, ${userPayload.name}! Your Anti-Shrimp account is ready!`
        : `🍤 Welcome back, ${userPayload.name}! Ready to maintain upright posture today?`
    );

    setTimeout(() => {
      onSuccess?.(userPayload);
      onClose();
    }, 900);
  };

  const handleQuickDemoLogin = () => {
    const demoUser = {
      name: 'Alex Ebi Furai',
      email: 'alex.tempura@campus.edu',
      major: 'Computer Science · Senior Year',
      avatar: '🍤',
      persona: 'Ebi Tempura',
    };
    localStorage.setItem('furai_user', JSON.stringify(demoUser));
    onSuccess?.(demoUser);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(17, 24, 74, 0.82)',
        backdropFilter: 'blur(7px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="brutal-box"
        style={{
          background: '#F4F3EE',
          borderRadius: '30px',
          maxWidth: '920px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          border: '3px solid #151515',
          boxShadow: '10px 10px 0px #FFE14D',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* LEFT COLUMN: Visual & Value Prop */}
        <div
          style={{
            background: '#283897',
            color: '#FFFFFF',
            padding: '32px 28px',
            borderRight: '3px solid #151515',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FFE14D',
                color: '#151515',
                padding: '5px 14px',
                borderRadius: '999px',
                border: '2px solid #151515',
                fontWeight: 900,
                fontSize: '0.75rem',
                marginBottom: '16px',
                transform: 'rotate(-2deg)',
                boxShadow: '3px 3px 0px #151515',
              }}
            >
              🍤 FURAI CLUB · ANTI TECH-NECK
            </div>

            <h2
              className="font-display"
              style={{
                fontSize: '2.1rem',
                lineHeight: 1.08,
                marginBottom: '12px',
              }}
            >
              {mode === 'login'
                ? 'Sign In to Your Ergonomic Sanctuary!'
                : 'Join the Anti-Slouch Member Club!'}
            </h2>

            <p style={{ fontSize: '0.9rem', color: '#E0E7FF', lineHeight: 1.55, marginBottom: '20px' }}>
              Track your <strong>Daily Streak (FR-19)</strong>, nurture your <strong>Virtual Garden (FR-18)</strong>, and review <strong>7-Day Posture Trends (FR-16)</strong> so your spine stays aligned until graduation!
            </p>
          </div>

          {/* Mini Illustration Stage */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '22px',
              border: '2.5px solid #151515',
              padding: '16px',
              position: 'relative',
              height: '210px',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 24px rgba(0,0,0,0.15), 5px 5px 0px #151515',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '12px',
                background: '#52C597',
                color: '#151515',
                border: '2px solid #151515',
                borderRadius: '999px',
                padding: '2px 10px',
                fontWeight: 900,
                fontSize: '0.68rem',
                zIndex: 5,
              }}
            >
              posture reveal · member preview
            </div>

            <img
              src="/assets/desk-monitor.svg"
              alt="Study Desk"
              style={{
                position: 'absolute',
                width: '390px',
                left: '44%',
                bottom: '-34px',
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
              }}
            />
            <img
              src="/assets/shrimp-chair.svg"
              alt="Chair Shrimp"
              style={{
                position: 'absolute',
                width: '195px',
                right: '14px',
                bottom: '-8px',
                pointerEvents: 'none',
                transition: 'transform 0.3s ease',
                transform: mode === 'register' ? 'rotate(6deg)' : 'rotate(-4deg)',
              }}
            />
          </div>

          {/* Privacy Guarantee */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255,255,255,0.12)',
              padding: '10px 14px',
              borderRadius: '14px',
              border: '1.5px solid rgba(255,255,255,0.25)',
              fontSize: '0.78rem',
            }}
          >
            <ShieldCheck size={20} color="#FFE14D" style={{ flexShrink: 0 }} />
            <span>
              <strong>100% On-Device Privacy:</strong> Local profile data never transmits or stores webcam frames anywhere on external servers.
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Form */}
        <div style={{ padding: '28px 30px', position: 'relative' }}>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="brutal-pill"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '36px',
              height: '36px',
              background: '#FF6B2B',
              color: '#151515',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Close"
          >
            <X size={18} />
          </button>

          {/* Mode Tabs */}
          <div
            style={{
              display: 'inline-flex',
              background: '#EAE8E0',
              padding: '4px',
              borderRadius: '999px',
              border: '2.5px solid #151515',
              marginBottom: '22px',
            }}
          >
            <button
              type="button"
              onClick={() => setMode('login')}
              style={{
                padding: '8px 22px',
                borderRadius: '999px',
                border: mode === 'login' ? '2px solid #151515' : '2px solid transparent',
                background: mode === 'login' ? '#FFE14D' : 'transparent',
                fontWeight: 900,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: mode === 'login' ? '2px 2px 0px #151515' : 'none',
              }}
            >
              LOGIN
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              style={{
                padding: '8px 22px',
                borderRadius: '999px',
                border: mode === 'register' ? '2px solid #151515' : '2px solid transparent',
                background: mode === 'register' ? '#52C597' : 'transparent',
                fontWeight: 900,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: mode === 'register' ? '2px 2px 0px #151515' : 'none',
              }}
            >
              REGISTER
            </button>
          </div>

          {error && (
            <div
              className="brutal-box"
              style={{
                background: '#FFE4E4',
                borderColor: '#151515',
                borderRadius: '14px',
                padding: '10px 14px',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#B91C1C',
                marginBottom: '14px',
              }}
            >
              🚨 {error}
            </div>
          )}

          {successMsg && (
            <div
              className="brutal-box"
              style={{
                background: '#D1FAE5',
                borderColor: '#151515',
                borderRadius: '14px',
                padding: '12px 14px',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#065F46',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={18} /> {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'register' && (
              <>
                <div>
                  <label style={{ display: 'block', fontWeight: 800, fontSize: '0.8rem', marginBottom: '5px' }}>
                    YOUR NICKNAME / SHRIMP ALIAS *
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#FFFFFF',
                      border: '2.5px solid #151515',
                      borderRadius: '14px',
                      padding: '0 12px',
                      boxShadow: '3px 3px 0px #151515',
                    }}
                  >
                    <User size={17} color="#555" />
                    <input
                      type="text"
                      placeholder="e.g. Alex The Spine Keeper"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        padding: '11px 10px',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        background: 'transparent',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </div>

                {/* Choose Shrimp Persona */}
                <div>
                  <label style={{ display: 'block', fontWeight: 800, fontSize: '0.8rem', marginBottom: '6px' }}>
                    CHOOSE YOUR CURRENT POSTURE SPECIES:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {SHRIMP_AVATARS.map((av) => (
                      <div
                        key={av.id}
                        onClick={() => setSelectedAvatar(av.id)}
                        style={{
                          background: selectedAvatar === av.id ? '#FFE14D' : '#FFFFFF',
                          border: '2px solid #151515',
                          borderRadius: '12px',
                          padding: '8px 10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: selectedAvatar === av.id ? '2px 2px 0px #151515' : 'none',
                        }}
                      >
                        <span style={{ fontSize: '1.4rem' }}>{av.emoji}</span>
                        <div>
                          <div style={{ fontWeight: 900, fontSize: '0.76rem' }}>{av.label}</div>
                          <div style={{ fontSize: '0.66rem', color: '#444', lineHeight: 1.2 }}>{av.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.8rem', marginBottom: '5px' }}>
                CAMPUS OR PERSONAL EMAIL *
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#FFFFFF',
                  border: '2.5px solid #151515',
                  borderRadius: '14px',
                  padding: '0 12px',
                  boxShadow: '3px 3px 0px #151515',
                }}
              >
                <Mail size={17} color="#555" />
                <input
                  type="email"
                  placeholder="fried.shrimp@campus.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    padding: '11px 10px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    background: 'transparent',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.8rem', marginBottom: '5px' }}>
                SECRET PASSWORD *
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#FFFFFF',
                  border: '2.5px solid #151515',
                  borderRadius: '14px',
                  padding: '0 12px',
                  boxShadow: '3px 3px 0px #151515',
                }}
              >
                <Lock size={17} color="#555" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 4 characters..."
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    padding: '11px 10px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    background: 'transparent',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#555',
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="brutal-pill"
              style={{
                background: mode === 'login' ? '#151515' : '#52C597',
                color: mode === 'login' ? '#FFFFFF' : '#151515',
                padding: '13px 20px',
                fontWeight: 900,
                fontSize: '0.95rem',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {mode === 'login' ? 'Sign In Now 🍤' : 'Create Anti-Shrimp Account ✨'} <ArrowRight size={18} />
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: '16px 0',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#666',
            }}
          >
            <span style={{ flex: 1, height: '1.5px', background: '#ccc' }} />
            <span>OR TOO TIRED TO TYPE?</span>
            <span style={{ flex: 1, height: '1.5px', background: '#ccc' }} />
          </div>

          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="brutal-pill"
            style={{
              width: '100%',
              background: '#9AD9EA',
              color: '#151515',
              padding: '10px 16px',
              fontWeight: 800,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Sparkles size={16} /> 1-Click Instant Demo Login (Skip Typing)
          </button>
        </div>
      </div>
    </div>
  );
}
