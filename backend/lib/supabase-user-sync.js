const SUPABASE_PASSWORD_PLACEHOLDER = '[SUPABASE]';

/**
 * Supabase Auth kullanıcısını PostgreSQL users tablosuna yazar veya günceller.
 */
async function ensureUserFromSupabase(pool, supabaseUserId, email, userMetadata = {}) {
    const em = String(email || '').trim();
    if (!em) {
        throw new Error('E-posta yok');
    }
    const emNorm = em.toLowerCase();
    const fullName = userMetadata.full_name || userMetadata.name || '';
    const firstName = (typeof fullName === 'string' ? fullName.split(' ')[0] : '') || null;
    const lastName =
        (typeof fullName === 'string' ? fullName.split(' ').slice(1).join(' ') : '') || null;
    const now = new Date();

    const existing = await pool.query(
        `SELECT id, email, role FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))`,
        [em]
    );

    if (existing.rows.length > 0) {
        const { id } = existing.rows[0];
        await pool.query(
            `UPDATE users SET
                first_name = COALESCE(NULLIF($2::varchar, ''), first_name),
                last_name = COALESCE(NULLIF($3::varchar, ''), last_name),
                last_login = COALESCE(last_login, $4),
                updated_at = $4,
                is_verified = true
             WHERE id = $1::uuid`,
            [id, firstName, lastName, now]
        );
        return { id, created: false };
    }

    await pool.query(
        `INSERT INTO users (id, email, first_name, last_name, password_hash, is_verified, role, is_active, access_level, last_login, created_at, updated_at)
         VALUES ($1::uuid, $2, $3, $4, $5, true, 'user', true, 'beginner', $6, $6, $6)`,
        [supabaseUserId, emNorm, firstName, lastName, SUPABASE_PASSWORD_PLACEHOLDER, now]
    );
    return { id: supabaseUserId, created: true };
}

/**
 * Supabase Auth'taki tüm kullanıcıları users tablosuna aktarır (service role gerekir).
 */
async function syncAllSupabaseUsers(pool) {
    const base = String(process.env.SUPABASE_URL || '')
        .trim()
        .replace(/\/+$/, '');
    const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    if (!base || !key) {
        const err = new Error(
            'Supabase senkronu için SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.'
        );
        err.code = 'SUPABASE_SYNC_NOT_CONFIGURED';
        throw err;
    }

    const perPage = 200;
    let page = 1;
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];

    while (true) {
        const url = `${base}/auth/v1/admin/users?page=${page}&per_page=${perPage}`;
        const r = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${key}`,
                apikey: key
            }
        });
        if (!r.ok) {
            const err = new Error(`Supabase kullanıcı listesi alınamadı (HTTP ${r.status})`);
            err.code = 'SUPABASE_LIST_FAILED';
            throw err;
        }
        const body = await r.json().catch(() => ({}));
        const list = body.users || [];
        if (!list.length) break;

        for (const u of list) {
            const email = u.email || (u.user_metadata && u.user_metadata.email) || '';
            if (!email || !u.id) {
                skipped += 1;
                continue;
            }
            try {
                const before = await pool.query(
                    `SELECT id FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))`,
                    [email]
                );
                const result = await ensureUserFromSupabase(pool, u.id, email, u.user_metadata || {});
                if (result.created) imported += 1;
                else if (before.rows.length) updated += 1;
                else updated += 1;
            } catch (e) {
                errors.push({ email, message: e.message });
            }
        }

        if (list.length < perPage) break;
        page += 1;
    }

    const totalRow = await pool.query('SELECT COUNT(*)::int AS c FROM users');
    return {
        imported,
        updated,
        skipped,
        errors: errors.slice(0, 30),
        usersInDatabase: totalRow.rows[0]?.c || 0
    };
}

module.exports = { ensureUserFromSupabase, syncAllSupabaseUsers };
