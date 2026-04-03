const { pool } = require('../config/db');

const submitContactMessage = async (full_name, email, subject, message) => {
    const result = await pool.query(
        `INSERT INTO contact_messages (full_name, email, subject, message, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'Unread', NOW(), NOW()) RETURNING *`,
        [full_name, email, subject, message]
    );
    return result.rows[0];
};

const getContactMessages = async () => {
    const result = await pool.query(
        `SELECT * FROM contact_messages ORDER BY created_at DESC`
    );
    return result.rows;
};

const updateContactMessageStatus = async (id, status) => {
    const result = await pool.query(
        `UPDATE contact_messages SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, id]
    );
    return result.rows[0];
};

const deleteContactMessage = async (id) => {
    const result = await pool.query(
        `DELETE FROM contact_messages WHERE id = $1 RETURNING id`,
        [id]
    );
    return result.rows[0];
};

module.exports = {
    submitContactMessage,
    getContactMessages,
    updateContactMessageStatus,
    deleteContactMessage
};
