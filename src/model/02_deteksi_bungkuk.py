"""
Tahap 2: deteksi bungkuk berbasis kalibrasi (kamera depan).

Cara pakai:
  1. Duduk tegak, wajah dan kedua bahu terlihat.
  2. Tekan 'c' -> tahan postur tegak selama 5 detik (kalibrasi).
  3. Setelah itu program menilai: TEGAK atau BUNGKUK.
  Tekan 'c' lagi untuk kalibrasi ulang, 'q' untuk keluar.
"""
import time
from collections import deque

import cv2
import numpy as np
import mediapipe as mp


DURASI_KALIBRASI = 5      # detik
BATAS_TURUN = 0.93        # jarak telinga-bahu < 93% baseline -> kepala turun
BATAS_MAJU = 1.08         # lebar bahu > 108% baseline -> badan maju ke layar
JUMLAH_SMOOTHING = 10     # rata-rata/voting dari N frame terakhir
DURASI_ALERT = 3          # detik bungkuk terus-menerus sebelum alert
MIN_VISIBILITY = 0.5

mp_pose = mp.solutions.pose
mp_draw = mp.solutions.drawing_utils
L = mp_pose.PoseLandmark


def ambil_fitur(lm, w, h):
    """Hitung fitur postur dari landmark. Return None kalau landmark kurang jelas."""
    idx = [L.LEFT_EAR, L.RIGHT_EAR, L.LEFT_SHOULDER, L.RIGHT_SHOULDER]
    if any(lm[i].visibility < MIN_VISIBILITY for i in idx):
        return None

    def p(i):
        return np.array([lm[i].x * w, lm[i].y * h])

    bahu_kiri, bahu_kanan = p(L.LEFT_SHOULDER), p(L.RIGHT_SHOULDER)
    telinga_kiri, telinga_kanan = p(L.LEFT_EAR), p(L.RIGHT_EAR)

    lebar_bahu = np.linalg.norm(bahu_kiri - bahu_kanan)
    if lebar_bahu < 1:
        return None

    tengah_bahu = (bahu_kiri + bahu_kanan) / 2
    tengah_telinga = (telinga_kiri + telinga_kanan) / 2

    return {
        # makin kecil = kepala makin turun mendekati bahu
        "jarak_kepala_bahu": (tengah_bahu[1] - tengah_telinga[1]) / lebar_bahu,
        # makin besar = badan makin maju ke kamera
        "lebar_bahu_rel": lebar_bahu / w,
        # kemiringan bahu (info tambahan)
        "miring_bahu": abs(bahu_kiri[1] - bahu_kanan[1]) / lebar_bahu,
    }


def main():
    cap = cv2.VideoCapture(0)
    baseline = None
    sedang_kalibrasi = False
    waktu_mulai_kalibrasi = 0
    sampel = []
    riwayat = deque(maxlen=JUMLAH_SMOOTHING)
    mulai_bungkuk = None

    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while cap.isOpened():
            ok, frame = cap.read()
            if not ok:
                break
            frame = cv2.flip(frame, 1)
            h, w = frame.shape[:2]
            hasil = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

            status, warna = "Tekan 'c' untuk kalibrasi", (255, 255, 255)

            if hasil.pose_landmarks:
                mp_draw.draw_landmarks(frame, hasil.pose_landmarks, mp_pose.POSE_CONNECTIONS)
                fitur = ambil_fitur(hasil.pose_landmarks.landmark, w, h)

                if fitur is None:
                    status, warna = "Wajah/bahu tidak terlihat jelas", (0, 165, 255)
                    mulai_bungkuk = None

                elif sedang_kalibrasi:
                    sisa = DURASI_KALIBRASI - (time.time() - waktu_mulai_kalibrasi)
                    sampel.append(fitur)
                    status, warna = f"Kalibrasi... duduk TEGAK ({max(sisa, 0):.0f}s)", (255, 200, 0)
                    if sisa <= 0:
                        baseline = {k: np.mean([s[k] for s in sampel]) for k in sampel[0]}
                        sedang_kalibrasi = False
                        riwayat.clear()
                        print("Baseline:", baseline)

                elif baseline is not None:
                    turun = fitur["jarak_kepala_bahu"] < baseline["jarak_kepala_bahu"] * BATAS_TURUN
                    maju = fitur["lebar_bahu_rel"] > baseline["lebar_bahu_rel"] * BATAS_MAJU
                    riwayat.append(1 if (turun or maju) else 0)

                    # voting mayoritas supaya tidak berkedip
                    bungkuk = len(riwayat) == riwayat.maxlen and sum(riwayat) > len(riwayat) / 2

                    if bungkuk:
                        mulai_bungkuk = mulai_bungkuk or time.time()
                        lama = time.time() - mulai_bungkuk
                        status, warna = f"BUNGKUK ({lama:.0f}s)", (0, 0, 255)
                        if lama >= DURASI_ALERT:
                            cv2.putText(frame, "LURUSKAN PUNGGUNG!", (20, 90),
                                        cv2.FONT_HERSHEY_SIMPLEX, 1.1, (0, 0, 255), 3)
                    else:
                        mulai_bungkuk = None
                        status, warna = "TEGAK", (0, 200, 0)
            else:
                status, warna = "Orang tidak terdeteksi", (0, 165, 255)

            cv2.putText(frame, status, (20, 45), cv2.FONT_HERSHEY_SIMPLEX, 1, warna, 2)
            cv2.imshow("Deteksi Bungkuk (c=kalibrasi, q=keluar)", frame)

            tombol = cv2.waitKey(1) & 0xFF
            if tombol == ord("q"):
                break
            if tombol == ord("c"):
                sedang_kalibrasi = True
                waktu_mulai_kalibrasi = time.time()
                sampel = []
                baseline = None

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()