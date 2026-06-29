// Triggered nodemon restart to run corrected migrations.
const { pool, readPool } = require('../../config/db');
const { buildLeadPurchaseInsert, loadLeadPurchaseColumns } = require('../../utils/leadPurchaseSchema');

class LeadsRepository {
    async findById(id, client = readPool) {
        const result = await client.query('SELECT * FROM leads WHERE id = $1', [id]);
        return result.rows[0];
    }

    async findByIdWithLock(id, client) {
        const result = await client.query('SELECT * FROM leads WHERE id = $1 FOR UPDATE', [id]);
        return result.rows[0];
    }

    async getAvailableLeads(userId, filters, pagination) {
        const { city, state, pincode, category } = filters;
        const { limit, offset } = pagination;

        let query = `
            SELECT
                l.*,
                l.category as category_name,
                COALESCE(l.credit_cost, 10) as credit_cost,
                u.wallet_balance,
                COUNT(*) OVER() as total_count
            FROM leads l
            JOIN users u ON u.id = $1
            LEFT JOIN lead_purchases lp ON lp.lead_id = l.id AND lp.user_id = $1
            WHERE lp.id IS NULL
            AND l.status = 'ACTIVE'
        `;
        const values = [userId];

        if (city) {
            values.push(`%${city}%`);
            query += ` AND l.city ILIKE $${values.length}`;
        }
        if (state) {
            values.push(`%${state}%`);
            query += ` AND l.state ILIKE $${values.length}`;
        }
        if (pincode) {
            values.push(pincode);
            query += ` AND l.pincode = $${values.length}`;
        }
        if (category) {
            values.push(`%${category}%`);
            query += ` AND l.category ILIKE $${values.length}`;
        }

        query += ` ORDER BY l.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
        values.push(limit, offset);

        const result = await readPool.query(query, values);
        const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;
        const walletBalance = result.rows[0]?.wallet_balance ?? null;
        const leads = result.rows.map(({ total_count, wallet_balance, ...lead }) => lead);

        return { leads, total, walletBalance };
    }

    async checkPurchaseExists(userId, leadId, client = readPool) {
        const result = await client.query(
            'SELECT id FROM lead_purchases WHERE user_id = $1 AND lead_id = $2',
            [userId, leadId]
        );
        return result.rows.length > 0;
    }

    async recordPurchase(purchaseData, client) {
        const { user_id, lead_id, cost, status, lead_value } = purchaseData;

        const leadPurchaseColumns = await loadLeadPurchaseColumns(client);
        const leadPurchaseInsert = buildLeadPurchaseInsert(leadPurchaseColumns, lead_value);
        const insertParams = [user_id, lead_id, cost, status, ...leadPurchaseInsert.values];
        const placeholders = insertParams.map((_, index) => `$${index + 1}`).join(', ');

        const result = await client.query(
            `INSERT INTO lead_purchases (${leadPurchaseInsert.insertColumns.join(', ')}) 
             VALUES (${placeholders}) RETURNING *`,
            insertParams
        );
        return result.rows[0];
    }
}

module.exports = new LeadsRepository();
