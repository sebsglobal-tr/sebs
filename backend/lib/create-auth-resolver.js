const jwt = require('jsonwebtoken');

const SUPABASE_PASSWORD_PLACEHOLDER = '[SUPABASE]';

function createAuthResolver({ pool, fullAccessEmail, verifySupabaseAccessTokenViaApi, logger }) {
    async function ensureUserFromSupabase(supabaseUserId, email, userMetadata = {}) {
        const em = String(email || '').trim();
        if (!em) throw new Error('Supabase JWT içinde email yok');
        const emNorm = em.toLowerCase();
        const fullName = userMetadata.full_name || userMetadata.name || '';
        const firstName = (typeof fullName === 'string' ? fullName.split(' ')[0] : '') || null;
        const lastName =
            (typeof fullName === 'string' ? fullName.split(' ').slice(1).join(' ') : '') || null;
        const now = new Date();

        const existing = await pool.query(
            `SELECT id, email, role, access_level FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))`,
            [em]
        );

        if (existing.rows.length > 0) {
            const row = existing.rows[0];
            await pool.query(
                `UPDATE users SET
                    first_name = COALESCE(NULLIF($2::varchar, ''), first_name),
                    last_name = COALESCE(NULLIF($3::varchar, ''), last_name),
                    last_login = $4,
                    updated_at = $4,
                    is_verified = true
                 WHERE id = $1::uuid`,
                [row.id, firstName, lastName, now]
            );
            return row;
        }

        await pool.query(
            `INSERT INTO users (id, email, first_name, last_name, password_hash, is_verified, role, is_active, access_level, last_login, created_at, updated_at)
             VALUES ($1::uuid, $2, $3, $4, $5, true, 'user', true, 'beginner', $6, $6, $6)`,
            [supabaseUserId, emNorm, firstName, lastName, SUPABASE_PASSWORD_PLACEHOLDER, now]
        );
        const inserted = await pool.query(
            'SELECT id, email, role, access_level FROM users WHERE id = $1::uuid',
            [supabaseUserId]
        );
        return inserted.rows[0];
    }

    async function resolveSupabaseDecoded(supabaseDecoded) {
        const supaEmail =
            supabaseDecoded.email ||
            (supabaseDecoded.user_metadata && supabaseDecoded.user_metadata.email) ||
            '';
        const row = await ensureUserFromSupabase(
            supabaseDecoded.sub,
            supaEmail,
            supabaseDecoded.user_metadata || {}
        );
        return normalizeUserRow(row, fullAccessEmail);
    }

    function normalizeUserRow(row, superEmail) {
        if (!row) return null;
        const email = row.email || '';
        let role = row.role || 'user';
        let accessLevel = row.access_level || 'beginner';
        const superNorm = (superEmail || '').toLowerCase().trim();
        if (superNorm && email.toLowerCase().trim() === superNorm) {
            role = 'admin';
            accessLevel = 'advanced';
        }
        return {
            userId: row.id,
            email,
            role,
            accessLevel
        };
    }

    async function resolveUserFromToken(token) {
        if (!token || typeof token !== 'string') return null;
        const trimmed = token.trim();
        if (trimmed.length < 20) return null;

        const jwtSecret = (process.env.JWT_SECRET || '').trim();
        const supaSecret = (process.env.SUPABASE_JWT_SECRET || '').trim();

        if (jwtSecret) {
            try {
                const decoded = jwt.verify(trimmed, jwtSecret);
                if (decoded && decoded.userId) {
                    if (decoded.email) {
                        const r = await pool.query(
                            `SELECT id, email, role, access_level FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))`,
                            [String(decoded.email).trim()]
                        );
                        if (r.rows.length > 0) {
                            return normalizeUserRow(r.rows[0], fullAccessEmail);
                        }
                    }
                    return {
                        userId: decoded.userId,
                        email: decoded.email || '',
                        role: decoded.role || 'user',
                        accessLevel: decoded.accessLevel || 'beginner'
                    };
                }
            } catch (e) {
                /* try supabase */
            }
        }

        if (supaSecret) {
            try {
                const supabaseDecoded = jwt.verify(trimmed, supaSecret);
                if (supabaseDecoded && supabaseDecoded.sub) {
                    return resolveSupabaseDecoded(supabaseDecoded);
                }
            } catch (e) {
                /* api fallback */
            }
        }

        if (verifySupabaseAccessTokenViaApi) {
            const supaUser = await verifySupabaseAccessTokenViaApi(trimmed);
            if (supaUser && supaUser.id) {
                return resolveSupabaseDecoded({
                    sub: supaUser.id,
                    email: supaUser.email || '',
                    user_metadata: supaUser.user_metadata || {}
                });
            }
        }

        return null;
    }

    function parseCookies(req) {
        const header = req.headers.cookie;
        if (!header) return {};
        const out = {};
        header.split(';').forEach((part) => {
            const idx = part.indexOf('=');
            if (idx < 0) return;
            const key = part.slice(0, idx).trim();
            const val = part.slice(idx + 1).trim();
            if (key) out[key] = decodeURIComponent(val);
        });
        return out;
    }

    function extractTokenFromRequest(req) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.slice(7).trim();
        }
        const cookies = parseCookies(req);
        if (cookies.sebs_at) return cookies.sebs_at;
        return null;
    }

    async function resolveUserFromRequest(req) {
        const token = extractTokenFromRequest(req);
        if (!token) return null;
        try {
            return await resolveUserFromToken(token);
        } catch (err) {
            if (logger) logger.warn('resolveUserFromRequest:', err.message);
            return null;
        }
    }

    return {
        resolveUserFromToken,
        resolveUserFromRequest,
        extractTokenFromRequest,
        parseCookies
    };
}

module.exports = { createAuthResolver };
