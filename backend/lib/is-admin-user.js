/**
 * @param {{ userId?: string, email?: string, role?: string } | null} user
 * @param {string} [fullAccessEmail]
 */
function isAdminUser(user, fullAccessEmail) {
    if (!user || !user.userId) return false;
    const email = String(user.email || '')
        .toLowerCase()
        .trim();
    const superEmail = String(fullAccessEmail || '')
        .toLowerCase()
        .trim();
    if (superEmail && email === superEmail) return true;
    return user.role === 'admin';
}

module.exports = { isAdminUser };
