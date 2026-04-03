const express = require('express');
const app = express();
const adminRoutes = require('./src/routes/adminRoutes');

console.log('--- ADMIN ROUTES START ---');
adminRoutes.stack.forEach(r => {
    if (r.route && r.route.path) {
        console.log(`${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
    }
});
console.log('--- ADMIN ROUTES END ---');
