const jwt = require('jsonwebtoken');
const http = require('http');

const SECRET = 'secretkey123';
const token = jwt.sign({ id: '19e4917a-db2e-43ae-b389-0fed46a9a79c', role: 'admin' }, SECRET);

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/user/available-leads',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};

const req = http.request(options, (res) => {
    console.log('STATUS:', res.statusCode);
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            console.log('RESPONSE:', JSON.parse(data));
        } catch (e) {
            console.log('RAW RESPONSE:', data);
        }
    });
});

req.on('error', (e) => console.error(e));
req.end();
