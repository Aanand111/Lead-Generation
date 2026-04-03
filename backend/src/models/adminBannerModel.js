const { pool } = require('../config/db');

const createBanner = async (bannerData) => {
    const { title, image, link, type, placement, start_date, end_date, is_active } = bannerData;
    const result = await pool.query(
        `INSERT INTO banners (title, image, link, type, placement, start_date, end_date, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [title, image, link, type, placement, start_date, end_date, is_active]
    );
    return result.rows[0];
};

const updateBanner = async (id, bannerData) => {
    const { title, image, link, type, placement, start_date, end_date, is_active } = bannerData;
    const result = await pool.query(
        `UPDATE banners 
     SET title = $1, image = $2, link = $3, type = $4, placement = $5, start_date = $6, end_date = $7, is_active = $8
     WHERE id = $9 RETURNING *`,
        [title, image, link, type, placement, start_date, end_date, is_active, id]
    );
    return result.rows[0];
};

const getAllBanners = async (activeOnly = false) => {
    let queryStr = `SELECT * FROM banners`;
    if (activeOnly) {
        queryStr += ` WHERE is_active = true AND (end_date IS NULL OR end_date > NOW())`;
    }
    queryStr += ` ORDER BY created_at DESC`;

    const result = await pool.query(queryStr);
    return result.rows;
};

const trackBannerClick = async (id) => {
    const result = await pool.query(
        `UPDATE banners SET clicks = clicks + 1 WHERE id = $1 RETURNING clicks`,
        [id]
    );
    return result.rows[0];
};

const deleteBanner = async (id) => {
    const result = await pool.query(`DELETE FROM banners WHERE id = $1 RETURNING id`, [id]);
    return result.rows[0];
};

module.exports = {
    createBanner,
    updateBanner,
    getAllBanners,
    trackBannerClick,
    deleteBanner
};
