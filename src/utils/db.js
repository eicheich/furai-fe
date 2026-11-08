import { neon } from '@neondatabase/serverless';

const DEFAULT_CONN = 'postgresql://neondb_owner:npg_YHRmP81oIZpe@ep-summer-glitter-aozuqsxo-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

export const NEON_URL = import.meta.env.VITE_NEON_DATABASE_URL || DEFAULT_CONN;

export const sql = neon(NEON_URL);

/**
 * 1. Simpan atau perbarui data user (Login / Register / Update Profile)
 */
export async function syncUserToDb({
  email,
  name,
  avatarUrl = null,
  archetype = 'shibuya_student',
  archetypeJp = '自習',
  targetDailyFocusMin = 120,
}) {
  try {
    const res = await sql`
      INSERT INTO users (email, name, avatar_url, archetype, archetype_jp, target_daily_focus_min)
      VALUES (${email}, ${name}, ${avatarUrl}, ${archetype}, ${archetypeJp}, ${targetDailyFocusMin})
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        archetype = EXCLUDED.archetype,
        archetype_jp = EXCLUDED.archetype_jp,
        target_daily_focus_min = EXCLUDED.target_daily_focus_min,
        updated_at = NOW()
      RETURNING *;
    `;
    const user = res[0];

    // Buat preferensi bawaan jika belum ada
    if (user?.id) {
      await sql`
        INSERT INTO user_preferences (user_id)
        VALUES (${user.id})
        ON CONFLICT (user_id) DO NOTHING;
      `;
    }

    return user;
  } catch (err) {
    console.warn('Neon DB syncUser error:', err);
    return null;
  }
}

/**
 * 2. Ambil data user berdasarkan email
 */
export async function getUserByEmail(email) {
  try {
    const res = await sql`
      SELECT u.*, p.sound_enabled, p.sound_type, p.sensitivity, p.potato_mode, p.theme
      FROM users u
      LEFT JOIN user_preferences p ON u.id = p.user_id
      WHERE u.email = ${email}
      LIMIT 1;
    `;
    return res[0] || null;
  } catch (err) {
    console.warn('Neon DB getUserByEmail error:', err);
    return null;
  }
}

/**
 * 3. Simpan Hasil Kalibrasi 5 Detik ke Neon DB
 */
export async function saveCalibrationToDb({
  userId,
  ratio,
  widthRel,
  tilt = 0.0,
  sensitivity = 'medium',
}) {
  try {
    if (!userId) return null;

    // Nonaktifkan kalibrasi lama
    await sql`
      UPDATE user_calibrations
      SET is_active = FALSE
      WHERE user_id = ${userId};
    `;

    // Simpan kalibrasi baru sebagai yang aktif
    const res = await sql`
      INSERT INTO user_calibrations (
        user_id,
        baseline_head_shoulder_ratio,
        baseline_shoulder_width_rel,
        baseline_shoulder_tilt,
        sensitivity,
        is_active
      )
      VALUES (
        ${userId},
        ${ratio},
        ${widthRel},
        ${tilt},
        ${sensitivity},
        TRUE
      )
      RETURNING *;
    `;
    return res[0];
  } catch (err) {
    console.warn('Neon DB saveCalibration error:', err);
    return null;
  }
}

/**
 * 4. Ambil Kalibrasi Aktif
 */
export async function getActiveCalibrationFromDb(userId) {
  try {
    if (!userId) return null;
    const res = await sql`
      SELECT * FROM user_calibrations
      WHERE user_id = ${userId} AND is_active = TRUE
      ORDER BY calibrated_at DESC
      LIMIT 1;
    `;
    return res[0] || null;
  } catch (err) {
    console.warn('Neon DB getActiveCalibration error:', err);
    return null;
  }
}

/**
 * 5. Simpan Sesi Pomodoro / Belajar yang Selesai
 */
export async function saveStudySessionToDb({
  userId,
  mode = 'focus',
  sprintNumber = 1,
  plannedDurationSec = 1500,
  actualDurationSec = 0,
  status = 'completed',
  uprightSeconds = 0,
  slouchSeconds = 0,
  outOfFrameSeconds = 0,
  uprightScore = 100,
  slouchAlertCount = 0,
}) {
  try {
    if (!userId) return null;

    const res = await sql`
      INSERT INTO study_sessions (
        user_id,
        mode,
        sprint_number,
        planned_duration_sec,
        actual_duration_sec,
        status,
        upright_seconds,
        slouch_seconds,
        out_of_frame_seconds,
        upright_score,
        slouch_alert_count,
        started_at,
        ended_at
      )
      VALUES (
        ${userId},
        ${mode},
        ${sprintNumber},
        ${plannedDurationSec},
        ${actualDurationSec},
        ${status},
        ${uprightSeconds},
        ${slouchSeconds},
        ${outOfFrameSeconds},
        ${uprightScore},
        ${slouchAlertCount},
        NOW() - (${actualDurationSec} || ' seconds')::INTERVAL,
        NOW()
      )
      RETURNING *;
    `;

    // Perbarui rekap harian secara otomatis
    const today = new Date().toISOString().split('T')[0];
    const focusSecToAdd = mode === 'focus' ? actualDurationSec : 0;
    const breakSecToAdd = mode === 'break' ? actualDurationSec : 0;
    const sprintToAdd = mode === 'focus' && status === 'completed' ? 1 : 0;

    await sql`
      INSERT INTO daily_stats (
        user_id,
        stat_date,
        total_focus_seconds,
        total_break_seconds,
        completed_sprints,
        avg_upright_score,
        total_slouch_alerts
      )
      VALUES (
        ${userId},
        ${today}::DATE,
        ${focusSecToAdd},
        ${breakSecToAdd},
        ${sprintToAdd},
        ${uprightScore},
        ${slouchAlertCount}
      )
      ON CONFLICT (user_id, stat_date) DO UPDATE SET
        total_focus_seconds = daily_stats.total_focus_seconds + ${focusSecToAdd},
        total_break_seconds = daily_stats.total_break_seconds + ${breakSecToAdd},
        completed_sprints = daily_stats.completed_sprints + ${sprintToAdd},
        total_slouch_alerts = daily_stats.total_slouch_alerts + ${slouchAlertCount},
        avg_upright_score = ROUND((daily_stats.avg_upright_score + ${uprightScore}) / 2),
        updated_at = NOW();
    `;

    return res[0];
  } catch (err) {
    console.warn('Neon DB saveStudySession error:', err);
    return null;
  }
}

/**
 * 6. Ambil Riwayat Sesi Belajar Terbaru
 */
export async function getRecentSessionsFromDb(userId, limit = 5) {
  try {
    if (!userId) return [];
    const res = await sql`
      SELECT * FROM study_sessions
      WHERE user_id = ${userId}
      ORDER BY started_at DESC
      LIMIT ${limit};
    `;
    return res;
  } catch (err) {
    console.warn('Neon DB getRecentSessions error:', err);
    return [];
  }
}

/**
 * 7. Ambil Statistik Ringkasan User (Streak, Total Sprints, Avg Score)
 */
export async function getUserSummaryStatsFromDb(userId) {
  try {
    if (!userId) return null;

    const res = await sql`
      SELECT 
        COALESCE(SUM(total_focus_seconds), 0) AS total_focus_sec,
        COALESCE(SUM(completed_sprints), 0) AS total_sprints,
        COALESCE(ROUND(AVG(avg_upright_score)), 94) AS avg_score,
        COALESCE(COUNT(DISTINCT stat_date), 1) AS streak_days,
        COALESCE(SUM(total_slouch_alerts), 0) AS total_alerts
      FROM daily_stats
      WHERE user_id = ${userId};
    `;

    return res[0] || null;
  } catch (err) {
    console.warn('Neon DB getUserSummaryStats error:', err);
    return null;
  }
}

/**
 * 8. Simpan Preferensi User
 */
export async function saveUserPreferencesToDb(userId, prefs) {
  try {
    if (!userId) return null;
    const res = await sql`
      INSERT INTO user_preferences (
        user_id,
        sound_enabled,
        sound_type,
        sensitivity,
        potato_mode,
        updated_at
      )
      VALUES (
        ${userId},
        ${prefs.soundEnabled ?? true},
        ${prefs.soundType ?? 'chime'},
        ${prefs.sensitivity ?? 'medium'},
        ${prefs.potatoMode ?? false},
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        sound_enabled = EXCLUDED.sound_enabled,
        sound_type = EXCLUDED.sound_type,
        sensitivity = EXCLUDED.sensitivity,
        potato_mode = EXCLUDED.potato_mode,
        updated_at = NOW()
      RETURNING *;
    `;
    return res[0];
  } catch (err) {
    console.warn('Neon DB saveUserPreferences error:', err);
    return null;
  }
}

