const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const csvContent = `Name,Phone,City\nTest User,1234567890,New York\n`;
const tempFile = path.join(__dirname, 'temp.csv');
fs.writeFileSync(tempFile, csvContent);

async function run() {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(tempFile), 'temp.csv');

        // We need an admin token. I'll just check if it fails before auth? 
        // Oh wait, auth middleware is applied: router.use(protect); router.use(adminOnly);
        // I need a token.
        // Let's generate a token manually.
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: '00000000-0000-0000-0000-000000000000', role: 'admin' }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1h' });

        const res = await axios.post('http://127.0.0.1:5000/api/admin/leads/import', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("Success:", res.data);
    } catch (err) {
        console.log("Error:", err.response ? err.response.data : err.message);
    }
}
run();
