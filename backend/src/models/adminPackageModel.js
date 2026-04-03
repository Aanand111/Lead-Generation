const { pool } = require('../config/db');

const createPackage = async (packageData) => {
    const { name, type, category, price, credits, lead_limit, validity_days, description, features, is_active, sort_order } = packageData;
    const result = await pool.query(
        `INSERT INTO packages (name, type, category, price, credits, lead_limit, validity_days, description, features, is_active, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [name, type, category, price, credits, lead_limit, validity_days, description, features, is_active, sort_order]
    );
    return result.rows[0];
};

const updatePackage = async (id, packageData) => {
    const { name, type, category, price, credits, lead_limit, validity_days, description, features, is_active, sort_order } = packageData;
    const result = await pool.query(
        `UPDATE packages 
     SET name = $1, type = $2, category = $3, price = $4, credits = $5, lead_limit = $6, validity_days = $7, description = $8, features = $9, is_active = $10, sort_order = $11
     WHERE id = $12 RETURNING *`,
        [name, type, category, price, credits, lead_limit, validity_days, description, features, is_active, sort_order, id]
    );
    return result.rows[0];
};

const getAllPackages = async (activeOnly = false) => {
    let queryStr = `SELECT * FROM packages`;
    if (activeOnly) {
        queryStr += ` WHERE is_active = true`;
    }
    queryStr += ` ORDER BY sort_order ASC, created_at DESC`;

    const result = await pool.query(queryStr);
    return result.rows;
};

const deletePackage = async (id) => {
    // Soft delete to preserve history if users already bought it
    const result = await pool.query(`UPDATE packages SET is_active = false WHERE id = $1 RETURNING id`, [id]);
    return result.rows[0];
};

module.exports = {
    createPackage,
    updatePackage,
    getAllPackages,
    deletePackage
};
