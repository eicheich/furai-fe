import React from 'react';
import { LogOut } from 'lucide-react';

const TICKER = [
  ['猫背注意', 'Slouch alert'],
  ['ブラウザだけで動く', 'Runs in your browser'],
  ['動画は送信しません', 'Zero video uploads'],
  ['ずっと無料', 'Free forever'],
  ['低スペPCでもOK', 'Potato-laptop friendly'],
];

export default function Navbar({
  currentView = 'landing',
  user = null,
  onNavigate,
  onLogout,
  onOpenDemo,
  showTicker = true,
}) {
  const handleSectionClick = (e, sectionId) => {
    e.preventDefault();
    if (currentView === 'landing') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = sectionId;
      }
    } else {
      onNavigate?.('landing', sectionId);
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    onNavigate?.('landing', 'top');
  };

  return (
    <div className="site-header">
      {/* Ticker */}
      {showTicker && (
        <div className="ticker" aria-hidden>
          <div className="ticker__track">
            {[0, 1].map((loop) =>
              TICKER.map(([jp, en]) => (
                <span className="ticker__item" key={`${loop}-${en}`}>
                  <b>{jp}</b> {en} <span style={{ marginLeft: 24 }}>✦</span>
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <header className="nav">
        <a href="#top" onClick={handleLogoClick} className="logo">
          Furai <span className="logo__jp">フライ</span>
        </a>

        <nav className="nav__links">
          <button
            type="button"
            className={`nav__link-btn ${currentView === 'about' ? 'is-active' : ''}`}
            onClick={() => onNavigate?.('about')}
          >
            About
          </button>
          <a
            href="#how"
            onClick={(e) => handleSectionClick(e, 'how')}
          >
            How it works
          </a>
          <a
            href="#features"
            onClick={(e) => handleSectionClick(e, 'features')}
          >
            Features
          </a>
          <a
            href="#privacy"
            onClick={(e) => handleSectionClick(e, 'privacy')}
          >
            Privacy
          </a>
        </nav>

        <div className="nav__right">
          {user ? (
            <>
              <button
                type="button"
                className="pill pill--yellow"
                onClick={() => onNavigate?.('study')}
              >
                Study Space （学習室）
              </button>
              <button
                type="button"
                className={`nav__avatar-btn ${currentView === 'profile' ? 'is-active' : ''}`}
                onClick={() => onNavigate?.('profile')}
                title={`Profile: ${user.name || 'User'}`}
                aria-label="User Profile"
              >
                {(user.name ? user.name.trim().charAt(0) : 'U').toUpperCase()}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={currentView === 'login' ? 'nav__active-link' : ''}
                onClick={() => onNavigate?.('login')}
              >
                Log in
              </button>
              <button
                type="button"
                className={`pill pill--light ${currentView === 'register' ? 'is-active' : ''}`}
                onClick={() => onNavigate?.('register')}
              >
                Sign up
              </button>
              <button
                type="button"
                className="pill pill--yellow"
                onClick={onOpenDemo}
              >
                Try it now
              </button>
            </>
          )}
        </div>
      </header>
    </div>
  );
}

