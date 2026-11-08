/**
 * Furai Biomechanical Posture Engine
 * Directly ported from model/02_deteksi_bungkuk.py
 *
 * MediaPipe Pose Landmark Indices:
 *   7: LEFT_EAR
 *   8: RIGHT_EAR
 *   11: LEFT_SHOULDER
 *   12: RIGHT_SHOULDER
 */

export const POSTURE_CONSTANTS = {
  CALIBRATION_DURATION_SEC: 5, // 5 detik duduk tegak untuk baseline
  THRESHOLD_DOWN: 0.93, // jarak telinga-bahu < 93% baseline -> kepala turun
  THRESHOLD_FORWARD: 1.08, // lebar bahu > 108% baseline -> badan maju ke layar
  SMOOTHING_WINDOW_SIZE: 10, // voting mayoritas dari 10 frame terakhir
  ALERT_TRIGGER_SECONDS: 3, // detik bungkuk terus-menerus sebelum alert
  MIN_VISIBILITY: 0.5,
};

/**
 * Ekstraksi fitur biomekanik dari landmark MediaPipe.
 * Equivalent to `ambil_fitur(lm, w, h)` in 02_deteksi_bungkuk.py
 */
export function extractPostureFeatures(landmarks, width, height) {
  if (!landmarks || landmarks.length < 13) return null;

  const leftEar = landmarks[7];
  const rightEar = landmarks[8];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  // Cek visibility (MIN_VISIBILITY = 0.5)
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

  return {
    // Makin kecil = kepala makin turun mendekati bahu (slouch down)
    jarak_kepala_bahu: (tengahBahu.y - tengahTelinga.y) / lebarBahu,
    // Makin besar = badan makin maju ke kamera (forward slouch)
    lebar_bahu_rel: lebarBahu / width,
    // Kemiringan bahu
    miring_bahu: Math.abs(bahuKiri.y - bahuKanan.y) / lebarBahu,
    // Koordinat mentah untuk visualisasi HUD live
    coords: {
      earMid: tengahTelinga,
      shoulderMid: tengahBahu,
      shoulderLeft: bahuKiri,
      shoulderRight: bahuKanan,
      lebarBahu,
    },
  };
}

/**
 * Detektor Postur Berbasis Kalibrasi Adaptif
 */
export class CalibratedPostureDetector {
  constructor(options = {}) {
    this.sensitivity = options.sensitivity || 'medium';
    this.baseline = null;
    this.history = [];
    this.slouchStartTime = null;
    this.samples = [];
    this.isCalibrating = false;
    this.calibStartTime = 0;
  }

  setSensitivity(s) {
    this.sensitivity = s;
  }

  getThresholds() {
    switch (this.sensitivity) {
      case 'low':
        return { down: 0.88, forward: 1.14 }; // Lebih toleran
      case 'high':
        return { down: 0.96, forward: 1.05 }; // Sangat ketat
      default:
        return {
          down: POSTURE_CONSTANTS.THRESHOLD_DOWN,
          forward: POSTURE_CONSTANTS.THRESHOLD_FORWARD,
        };
    }
  }

  startCalibration() {
    this.isCalibrating = true;
    this.calibStartTime = Date.now();
    this.samples = [];
    this.baseline = null;
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

        this.baseline = {
          jarak_kepala_bahu: avgJarak,
          lebar_bahu_rel: avgLebar,
          miring_bahu: avgMiring,
        };

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

    // 2. Fase Deteksi Normal (Bila Baseline Sudah Ada)
    if (this.baseline) {
      const thresholds = this.getThresholds();
      const turun = features.jarak_kepala_bahu < this.baseline.jarak_kepala_bahu * thresholds.down;
      const maju = features.lebar_bahu_rel > this.baseline.lebar_bahu_rel * thresholds.forward;

      const isFrameSlouch = turun || maju;
      this.history.push(isFrameSlouch ? 1 : 0);
      if (this.history.length > POSTURE_CONSTANTS.SMOOTHING_WINDOW_SIZE) {
        this.history.shift();
      }

      // Majority voting dari 10 frame terakhir
      const isSlouch =
        this.history.length === POSTURE_CONSTANTS.SMOOTHING_WINDOW_SIZE &&
        this.history.reduce((a, b) => a + b, 0) > this.history.length / 2;

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
          turun,
          maju,
          baseline: this.baseline,
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
          baseline: this.baseline,
          coords: features.coords,
        };
      }
    }

    // Baseline belum dikalibrasi
    return {
      state: 'uncalibrated',
      statusText: "Klik 'Start 5s Calibration' untuk baseline",
      color: '#ffffff',
      alertActive: false,
      slouchDuration: 0,
      baseline: null,
      coords: features.coords,
    };
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

