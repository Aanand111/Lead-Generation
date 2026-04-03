const { pool } = require('./src/config/db');

const posters = [
    { title: 'Dream Home Listing', category_id: 1, thumbnail: '/uploads/posters/real_estate.png' },
    { title: 'Healthcare Clinic Promo', category_id: 2, thumbnail: '/uploads/posters/healthcare.png' },
    { title: 'Wealth Management Expert', category_id: 3, thumbnail: '/uploads/posters/finance.png' },
    { title: 'University Admission 2026', category_id: 4, thumbnail: '/uploads/posters/education.png' }
];

async function insert() {
    try {
        console.log('INSERTING POSTER TEMPLATES...');
        for (const p of posters) {
            await pool.query(
                'INSERT INTO posters (title, thumbnail, category_id, language, is_premium, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())',
                [p.title, p.thumbnail, p.category_id, 'English', false, 'Published']
            );
            console.log(`Added Poster: ${p.title}`);
        }
        console.log('SUCCESS');
        process.exit();
    } catch (err) {
        console.error('ERROR:', err.message);
        process.exit(1);
    }
}

insert();
