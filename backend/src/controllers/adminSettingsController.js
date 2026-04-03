const { pool, query } = require('../config/db');

// GET all settings
const getSettings = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT setting_key, setting_value, setting_type, description FROM system_settings ORDER BY id ASC'
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('getSettings error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
};

// UPDATE multiple settings at once (bulk update)
const updateSettings = async (req, res) => {
    const { settings } = req.body; // Array of { setting_key, setting_value }

    if (!settings || !Array.isArray(settings) || settings.length === 0) {
        return res.status(400).json({ success: false, message: 'No settings provided' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (const { setting_key, setting_value } of settings) {
            await client.query(
                `UPDATE system_settings 
                 SET setting_value = $1, updated_at = NOW() 
                 WHERE setting_key = $2`,
                [String(setting_value), setting_key]
            );
        }

        await client.query('COMMIT');
        res.json({ success: true, message: 'System settings updated successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('updateSettings error:', err);
        res.status(500).json({ success: false, message: 'Failed to update settings' });
    } finally {
        client.release();
    }
};

// GET a single setting by key (utility)
const getSettingByKey = async (req, res) => {
    const { key } = req.params;
    try {
        const result = await pool.query(
            'SELECT setting_key, setting_value, setting_type, description FROM system_settings WHERE setting_key = $1',
            [key]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Setting not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('getSettingByKey error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch setting' });
    }
};

module.exports = { getSettings, updateSettings, getSettingByKey };
