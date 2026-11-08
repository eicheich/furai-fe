/**
 * Furai Biomechanical Posture Engine
 * Diadaptasi dari model/02_deteksi_bungkuk.py dengan sensitivitas tinggi (sub-angle precision)
 *
 * MediaPipe Pose Landmark Indices:
 *   0: NOSE
 *   7: LEFT_EAR
 *   8: RIGHT_EAR
 *   11: LEFT_SHOULDER
 *   12: RIGHT_SHOULDER
 */

export const POSTURE_CONSTANTS = {
  CALIBRATION_DURATION_SEC: 5, // 5 detik duduk tegak untuk baseline
  THRESHOLD_DOWN: 0.965, // jarak kepala/hidung ke bahu turun ~3.5% -> langsung deteksi bungkuk!
  THRESHOLD_FORWARD: 1.04, // lebar bahu bertambah ~4% (condong maju) -> langsung deteksi bungkuk!
  SMOOTHING_WINDOW_SIZE: 8, // responsif ~250ms (8 frame)
  ALERT_TRIGGER_SECONDS: 2, // 2 detik terus-menerus bungkuk -> beri notifikasi suara
  MIN_VISIBILITY: 0.45,
};

/**
 * Ekstraksi fitur biomekanik dari landmark MediaPipe.
 */
export function extractPostureFeatures(landmarks, width, height) {
  if (!landmarks || landmarks.length < 13) return null;

  const nose = landmarks[0];
  const leftEar = landmarks[7];
  const rightEar = landmarks[8];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  // Cek visibility minimal untuk node bahu dan telinga
  const keyNodes = [leftEar, rightEar, leftShoulder, rightShoulder];
  if (
    keyNodes.some(
      (node) => !node || (node.visibility !== undefined && node.visibility < POSTURE_CONSTANTS.MIN_VISIBILITY)
    )
  ) {
    return null;
  }

  // Konversi ke koordinat piksel
  const p = (lm) => ({ x: lm.x * width, y: lm.y * height });

  const bahuKiri = p(leftShoulder);
  const bahuKanan = p(rightShoulder);
  const telingaKiri = p(leftEar);
  const telingaKanan = p(rightEar);
  const hidung = nose && (nose.visibility === undefined || nose.visibility >= 0.4) ? p(nose) : null;

  const lebarBahu = Math.hypot(bahuKiri.x - bahuKanan.x, bahuKiri.y - bahuKanan.y);
  if (lebarBahu < 1) return null;

  const tengahBahu = {
    x: (bahuKiri.x + bahuKanan.x) / 2,
    y: (bahuKiri.y + bahuKanan.y) / 2,
  };
  const tengahTelinga = {
    x: (telingaKiri.x + telingaKanan.x) / 2,
    y: (telingaKiri.y + telingaKanan.y) / 2,
  };

  // Posisi vertikal telinga vs bahu
  const jarakKepalaBahu = (tengahBahu.y - tengahTelinga.y) / lebarBahu;
  // Posisi vertikal hidung vs bahu (saat nunduk leher sedikit, hidung turun lebih cepat)
  const jarakHidungBahu = hidung ? (tengahBahu.y - hidung.y) / lebarBahu : null;

  return {
    jarak_kepala_bahu: jarakKepalaBahu,
    jarak_hidung_bahu: jarakHidungBahu,
    lebar_bahu_rel: lebarBahu / width,
    miring_bahu: Math.abs(bahuKiri.y - bahuKanan.y) / lebarBahu,
    coords: {
      nose: hidung,
      earMid: tengahTelinga,
      shoulderMid: tengahBahu,
      shoulderLeft: bahuKiri,
      shoulderRight: bahuKanan,
      lebarBahu,
    },
  };
}

/**
 * Detektor Postur Berbasis Kalibrasi Adaptif dengan Sensitivitas Tinggi
 */
export class CalibratedPostureDetector {
  constructor(options = {}) {
    this.sensitivity = options.sensitivity || 'medium';
    this.history = [];
    this.slouchStartTime = null;
    this.samples = [];
    this.isCalibrating = false;
    this.calibStartTime = 0;

    // Muat baseline tersimpan dari localStorage bila tersedia
    this.baseline = null;
    try {
      const saved = localStorage.getItem('furai_posture_baseline');
      if (saved) {
        this.baseline = JSON.parse(saved);
      }
    } catch (e) {}
  }

  setSensitivity(s) {
    this.sensitivity = s;
  }

  getThresholds() {
    switch (this.sensitivity) {
      case 'low':
        // Agak toleran (turun ~6% atau maju ~7%)
        return { down: 0.94, forward: 1.07 };
      case 'high':
        // Super sensitif (turun ~2.2% atau maju ~2.5% langsung terdeteksi)
        return { down: 0.978, forward: 1.025 };
      default: // medium (default sensitif tinggi: nunduk ~3.5% langsung terdeteksi)
        return {
          down: POSTURE_CONSTANTS.THRESHOLD_DOWN,
          forward: POSTURE_CONSTANTS.THRESHOLD_FORWARD,
        };
    }
  }

  getEffectiveBaseline() {
    if (this.baseline) return this.baseline;
    // Nilai acuan default realistis sebelum kalibrasi
    return {
      jarak_kepala_bahu: 0.44,
      jarak_hidung_bahu: 0.40,
      lebar_bahu_rel: 0.38,
      miring_bahu: 0.0,
      isDefault: true,
    };
  }

  startCalibration() {
    this.isCalibrating = true;
    this.calibStartTime = Date.now();
    this.samples = [];
    this.history = [];
    this.slouchStartTime = null;
  }

  processFrame(features) {
    if (!features) {
      this.slouchStartTime = null;
      return {
        state: 'out_of_frame',
        statusText: 'Wajah/bahu tidak terlihat jelas',
        color: '#ff9800',
        alertActive: false,
        slouchDuration: 0,
        baseline: this.baseline,
      };
    }

    const now = Date.now();

    // 1. Fase Kalibrasi (5 Detik)
    if (this.isCalibrating) {
      const elapsedSec = (now - this.calibStartTime) / 1000;
      const remainingSec = Math.max(0, POSTURE_CONSTANTS.CALIBRATION_DURATION_SEC - elapsedSec);

      this.samples.push(features);

      if (remainingSec <= 0 && this.samples.length > 0) {
        const n = this.samples.length;
        const avgJarak = this.samples.reduce((acc, s) => acc + s.jarak_kepala_bahu, 0) / n;
        const avgLebar = this.samples.reduce((acc, s) => acc + s.lebar_bahu_rel, 0) / n;
        const avgMiring = this.samples.reduce((acc, s) => acc + s.miring_bahu, 0) / n;

        const validNoseSamples = this.samples.filter((s) => s.jarak_hidung_bahu !== null);
        const avgHidung = validNoseSamples.length > 0
          ? validNoseSamples.reduce((acc, s) => acc + s.jarak_hidung_bahu, 0) / validNoseSamples.length
          : null;

        this.baseline = {
          jarak_kepala_bahu: avgJarak,
          jarak_hidung_bahu: avgHidung,
          lebar_bahu_rel: avgLebar,
          miring_bahu: avgMiring,
        };

        try {
          localStorage.setItem('furai_posture_baseline', JSON.stringify(this.baseline));
        } catch (e) {}

        this.isCalibrating = false;
        this.history = [];
        this.slouchStartTime = null;

        return {
          state: 'calibrated',
          statusText: 'Kalibrasi selesai! Baseline tersimpan',
          color: 'var(--mint)',
          alertActive: false,
          slouchDuration: 0,
          baseline: this.baseline,
          justFinishedCalibration: true,
          coords: features.coords,
        };
      }

      const progress = Math.min(
        100,
        ((POSTURE_CONSTANTS.CALIBRATION_DURATION_SEC - remainingSec) / POSTURE_CONSTANTS.CALIBRATION_DURATION_SEC) * 100
      );

      return {
        state: 'calibrating',
        statusText: `Kalibrasi... duduk TEGAK (${remainingSec.toFixed(0)}s)`,
        color: 'var(--yellow)',
        progress,
        alertActive: false,
        slouchDuration: 0,
        baseline: null,
        coords: features.coords,
      };
    }

    // 2. Fase Deteksi Postur (Baseline Kalibrasi atau Default)
    const base = this.getEffectiveBaseline();
    const thresholds = this.getThresholds();

    // Deteksi apakah kepala turun (telinga atau hidung mendekat ke bahu)
    const turunTelinga = features.jarak_kepala_bahu < base.jarak_kepala_bahu * thresholds.down;
    const turunHidung = features.jarak_hidung_bahu && base.jarak_hidung_bahu
      ? features.jarak_hidung_bahu < base.jarak_hidung_bahu * thresholds.down
      : false;

    // Deteksi apakah condong maju ke layar (lebar bahu membesar di kamera)
    const maju = features.lebar_bahu_rel > base.lebar_bahu_rel * thresholds.forward;

    // Cukup salah satu terdeteksi (nunduk sedikit atau maju sedikit)
    const isFrameSlouch = turunTelinga || turunHidung || maju;

    this.history.push(isFrameSlouch ? 1 : 0);
    if (this.history.length > POSTURE_CONSTANTS.SMOOTHING_WINDOW_SIZE) {
      this.history.shift();
    }

    // Cepat tanggap: jika minimal 3 dari 8 frame terakhir terdeteksi bungkuk (~100ms)
    const isSlouch =
      this.history.length >= 4 &&
      this.history.reduce((a, b) => a + b, 0) >= 3;

    if (isSlouch) {
      if (!this.slouchStartTime) {
        this.slouchStartTime = now;
      }
      const durationSec = (now - this.slouchStartTime) / 1000;
      const alertActive = durationSec >= POSTURE_CONSTANTS.ALERT_TRIGGER_SECONDS;

      return {
        state: 'slouching',
        statusText: `BUNGKUK (${durationSec.toFixed(0)}s)`,
        color: 'var(--shrimp)',
        alertActive,
        alertMessage: alertActive ? 'LURUSKAN PUNGGUNG!' : '',
        slouchDuration: durationSec,
        turun: turunTelinga || turunHidung,
        maju,
        baseline: base,
        coords: features.coords,
      };
    } else {
      this.slouchStartTime = null;
      return {
        state: 'aligned',
        statusText: 'TEGAK',
        color: 'var(--mint)',
        alertActive: false,
        slouchDuration: 0,
        baseline: base,
        coords: features.coords,
      };
    }
  }
}

/**
 * Injeksi dinamis library MediaPipe Pose ke DOM bila belum dimuat
 */
export function ensureMediaPipeLoaded() {
  return new Promise((resolve) => {
    if (window.Pose) {
      resolve(true);
      return;
    }

    const script1 = document.createElement('script');
    script1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
    script1.crossOrigin = 'anonymous';

    const script2 = document.createElement('script');
    script2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
    script2.crossOrigin = 'anonymous';

    script1.onload = () => {
      document.head.appendChild(script2);
    };
    script2.onload = () => {
      resolve(true);
    };
    script1.onerror = () => resolve(false);
    script2.onerror = () => resolve(false);

    document.head.appendChild(script1);
  });
}
