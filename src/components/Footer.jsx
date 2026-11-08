import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function Footer({
  user = null,
  onNavigate,
  onOpenDemo,
  showCta = true,
}) {
  const handleSectionClick = (e, sectionId) => {
    e.preventDefault();
    onNavigate?.('landing', sectionId);
  };

  return (
    <footer className="footer">
      {/* Big CTA Banner */}
      {showCta && (
        <div className="footer__cta">
          <div>
            <p className="jp-label jp-label--light">（さあ、背筋をのばそう）</p>
            <h2 className="footer__title">
              Sit up straight,
              <br />
              little shrimp.
            </h2>
          </div>
          <button
            type="button"
            className="pill pill--light pill--lg"
            onClick={onOpenDemo}
          >
            {user ? 'Study Space' : 'Get started'} <ArrowUpRight size={18} />
          </button>
        </div>
      )}

      {/* Footer Bottom Bar */}
      <div className="footer__bar">
        <span>© 2026 Furai — 姿勢、大事。</span>
        <nav>
          <button type="button" onClick={() => onNavigate?.('about')}>
            About
          </button>
          <a href="#how" onClick={(e) => handleSectionClick(e, 'how')}>
            How it works
          </a>
          <a href="#privacy" onClick={(e) => handleSectionClick(e, 'privacy')}>
            Privacy
          </a>
          {user ? (
            <button type="button" onClick={() => onNavigate?.('study')}>
              Study Space （学習室）
            </button>
          ) : (
            <>
              <button type="button" onClick={() => onNavigate?.('login')}>
                Log in
              </button>
              <button type="button" onClick={() => onNavigate?.('register')}>
                Sign up
              </button>
            </>
          )}
        </nav>
        <span>For SDG 3 & SDG 4</span>
      </div>

      {/* Giant Wordmark */}
      <div className="footer__wordmark" aria-hidden>
        Furai
      </div>
    </footer>
  );
}

