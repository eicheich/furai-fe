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
      {/* HERO SECTION: Pengenalan Singkat Furai               */}
      {/* ---------------------------------------------------- */}
      <section className="about-hero">
        <div className="about-hero__inner">
          <p className="jp-label jp-label--light">（フライについて）</p>
          <h1 className="about-hero__title">
            KENALAN DENGAN FURAI.
          </h1>
          <p className="about-hero__sub">
            Teman belajar cerdas yang membantumu menjaga postur tubuh tetap tegak dan fokus dengan metode Pomodoro — langsung di browser tanpa alat tambahan.
          </p>

          <div className="about-hero__actions">
            <button
              type="button"
              className="pill pill--yellow pill--lg"
              onClick={() => onNavigate?.('study')}
            >
              <span>Mulai Belajar Sekarang</span>
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="pill pill--ghost pill--lg"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
              onClick={onOpenDemo}
            >
              <Play size={16} />
              <span>Coba Demo Interaktif</span>
            </button>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* MAIN CONTENT                                         */}
      {/* ---------------------------------------------------- */}
      <main className="about-content">
        {/* KISAH & MASALAH: Fenomena "Ebi Furai" */}
        <section className="about-section">
          <div className="card-staz card-staz--story">
            <span className="doodle-plus" style={{ top: 24, left: '16%' }}>+</span>
            <span className="doodle-plus" style={{ bottom: 28, right: '14%' }}>+</span>

            <div className="card-staz__head">
              <div>
                <p className="jp-label">（誕生のきっかけ）</p>
                <h2 className="display">KENAPA FURAI DIBUAT?</h2>
              </div>
              <span className="story-chip" style={{ background: 'var(--yellow)' }}>
                LATAR BELAKANG
              </span>
            </div>

            <div className="story-grid">
              <div className="story-body" style={{ maxWidth: '100%' }}>
                <p className="lead-text">
                  Pernahkah kamu melihat pantulan dirimu di layar laptop saat belajar larut malam?
                </p>
                <p className="body">
                  Leher condong belasan sentimeter ke depan, bahu terlipat ke dalam, dan punggung melengkung tajam.
                  Dalam analogi kuliner Jepang: <strong>kamu telah berubah bentuk menjadi <em>Ebi Furai</em> (udang goreng yang melengkung)</strong>.
                </p>
                <p className="body">
                  Kebiasaan bungkuk berjam-jam saat belajar atau coding sering kali menyebabkan pegal leher kronis (*tech neck*), sakit punggung bawah, dan penurunan fokus. Kebanyakan orang tidak sadar mereka sedang bungkuk sampai rasa sakitnya muncul.
                </p>
                <p className="body">
                  <strong>Furai hadir sebagai solusi ramah</strong>: web app yang berfungsi sebagai pengawas postur pribadi yang tenang dan suportif. Tanpa harness mahal, tanpa sensor kabel, dan tanpa menghakimi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3 FITUR UTAMA WEB INI */}
        <section className="about-section">
          <div className="section-head">
            <p className="eyebrow">FITUR UTAMA APLIKASI</p>
            <h2 className="display">APA SAJA YANG ADA DI FURAI?</h2>
            <p className="section-head__jp">（3つのコア機能）</p>
          </div>

          <div className="about-features-grid">
            {/* Feature 1 */}
            <div className="about-feat-card">
              <div className="about-feat-icon" style={{ background: 'var(--yellow)' }}>
                <Eye size={24} />
              </div>
              <div className="about-feat-head">
                <span className="about-feat-step">FITUR 01</span>
                <h3>Deteksi Postur Realtime</h3>
              </div>
              <p>
                Furai menggunakan kamera laptopmu untuk memantau titik telinga dan bahu secara realtime. Saat kamu mulai melengkung atau maju terlalu dekat ke layar, Furai akan memberi tahu dengan ramah.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="about-feat-card">
              <div className="about-feat-icon" style={{ background: 'var(--mint)' }}>
                <Clock size={24} />
              </div>
              <div className="about-feat-head">
                <span className="about-feat-step">FITUR 02</span>
                <h3>Pomodoro Timer Terpadu</h3>
              </div>
              <p>
                Atur ritme belajarmu dengan sprint fokus 25 menit dan jeda istirahat 5 menit. Timer akan otomatis menjeda jika kamu meninggalkan kursi atau tidak terlihat di depan kamera.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="about-feat-card">
              <div className="about-feat-icon" style={{ background: 'var(--sky)' }}>
                <Sparkles size={24} />
              </div>
              <div className="about-feat-head">
                <span className="about-feat-step">FITUR 03</span>
                <h3>Kalibrasi Adaptif 5 Detik</h3>
              </div>
              <p>
                Setiap orang punya postur alami dan tinggi meja yang berbeda. Hanya dengan duduk tegak selama 5 detik di awal sesi, Furai menyesuaikan standar tegak yang pas dengan tubuhmu.
              </p>
            </div>
          </div>
        </section>

        {/* BAGAIMANA CARA KERJANYA */}
        <section className="about-section">
          <div className="card-staz card-staz--how">
            <div className="section-head" style={{ marginBottom: '28px' }}>
              <p className="eyebrow">LANGKAH SEDERHANA</p>
              <h2 className="display">CARA PAKAI FURAI</h2>
              <p className="section-head__jp">（かんたん3ステップ）</p>
            </div>

            <div className="about-steps-row">
              <div className="about-step-col">
                <div className="about-step-num">1</div>
                <h4>Buka Ruang Belajar</h4>
                <p>Klik tombol <em>Study Space</em> dan izinkan akses webcam di browsermu.</p>
              </div>

              <div className="about-step-divider">→</div>

              <div className="about-step-col">
                <div className="about-step-num">2</div>
                <h4>Kalibrasi 5 Detik</h4>
                <p>Duduk tegak dan nyaman selama 5 detik agar Furai mencatat postur acuanmu.</p>
              </div>

              <div className="about-step-divider">→</div>

              <div className="about-step-col">
                <div className="about-step-num">3</div>
                <h4>Fokus Belajar</h4>
                <p>Mulai timer Pomodoro. Furai akan memberikan pengingat lembut jika kamu mulai bungkuk.</p>
              </div>
            </div>
          </div>
        </section>

        {/* PRINSIP PRIVASI: ZERO SURVEILLANCE */}
        <section className="about-section">
          <div className="card-staz card-staz--creed">
            <div className="creed-head">
              <p className="jp-label">（プライバシーの約束）</p>
              <h2 className="display">PRIVASIMU 100% AMAN</h2>
              <p className="creed-sub">
                Kami tidak pernah merekam atau menyimpan video dari webcame-mu:
              </p>
            </div>

            <div className="creed-grid">
              <div className="creed-card">
                <span className="creed-num"><ShieldCheck size={26} color="var(--mint)" /></span>
                <h3 className="creed-title">Diproses Lokal di Browser</h3>
                <p className="creed-desc">
                  Seluruh pemindaian postur dijalankan langsung di perangkatmu (on-device). Tidak ada gambar atau video yang dikirim ke server mana pun.
                </p>
              </div>

              <div className="creed-card">
                <span className="creed-num"><Heart size={26} color="var(--coral)" /></span>
                <h3 className="creed-title">Teguran yang Menenangkan</h3>
                <p className="creed-desc">
                  Bukan alarm sirene yang bikin panik. Furai memberikan nada lembut dan pengingat visual kecil agar konsentrasimu tidak buyar.
                </p>
              </div>

              <div className="creed-card">
                <span className="creed-num"><Zap size={26} color="var(--yellow)" /></span>
                <h3 className="creed-title">Ringan di Semua Laptop</h3>
                <p className="creed-desc">
                  Dirancang hemat baterai dan ringan sumber daya, sehingga tetap lancar digunakan bahkan di laptop spesifikasi sederhana.
                </p>
              </div>
            </div>

            <div className="creed-cta">
              <div className="creed-cta__text">
                <h3>Sudah siap belajar dengan punggung tegak?</h3>
                <p>Masuk ke ruang belajar Furai dan rasakan perbedaannya hari ini.</p>
              </div>
              <button
                type="button"
                className="pill pill--dark pill--lg"
                onClick={() => onNavigate?.('study')}
              >
                <span>Masuk ke Study Space</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
