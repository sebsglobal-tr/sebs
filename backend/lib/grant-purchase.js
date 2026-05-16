/** Activate a package purchase for a user (shared by free purchase + Iyzico callback). */
async function grantPackagePurchase(pool, userId, category, level, priceNum) {
    let purchaseId;

    try {
        const userPackagePurchaseResult = await pool.query(
            `INSERT INTO user_package_purchases (user_id, category, level, price, payment_status, purchased_at, is_active)
             VALUES ($1, $2, $3, $4, 'completed', CURRENT_TIMESTAMP, TRUE)
             ON CONFLICT (user_id, category, level)
             DO UPDATE SET
                 price = EXCLUDED.price,
                 payment_status = 'completed',
                 is_active = TRUE,
                 purchased_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             RETURNING id`,
            [userId, category, level, priceNum]
        );
        purchaseId = userPackagePurchaseResult.rows[0]?.id;
    } catch (err) {
        console.log('grant-purchase user_package_purchases:', err.message);
    }

    try {
        const purchaseResult = await pool.query(
            `INSERT INTO purchases (user_id, category, level, price, payment_status, purchased_at, is_active)
             VALUES ($1, $2, $3, $4::decimal, 'completed', CURRENT_TIMESTAMP, TRUE)
             ON CONFLICT (user_id, category, level)
             DO UPDATE SET
                 price = EXCLUDED.price,
                 payment_status = 'completed',
                 is_active = TRUE,
                 purchased_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             RETURNING id`,
            [userId, category, level, priceNum]
        );
        if (!purchaseId) purchaseId = purchaseResult.rows[0]?.id;
    } catch (err) {
        console.log('grant-purchase purchases:', err.message);
    }

    try {
        const userPurchasesResult = await pool.query(
            `SELECT level FROM purchases
             WHERE user_id = $1 AND category = $2 AND is_active = TRUE
             AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
             ORDER BY
                 CASE level
                     WHEN 'beginner' THEN 1
                     WHEN 'intermediate' THEN 2
                     WHEN 'advanced' THEN 3
                 END DESC
             LIMIT 1`,
            [userId, category]
        );
        if (userPurchasesResult.rows.length > 0) {
            const highestLevel = userPurchasesResult.rows[0].level;
            await pool.query(
                'UPDATE users SET access_level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [highestLevel, userId]
            );
        } else {
            await pool.query(
                'UPDATE users SET access_level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [level, userId]
            );
        }
    } catch (err) {
        console.error('grant-purchase access_level:', err.message);
    }

    return purchaseId;
}

module.exports = { grantPackagePurchase };
