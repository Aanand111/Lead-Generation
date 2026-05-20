const { pool } = require('./src/config/db');
const customerDb = require('./src/models/customerModel');
require('dotenv').config();

async function testQuery() {
    try {
        console.log('Testing getCustomerById with ID: a901ad8c-e934-4bff-8eff-0c52e58c2599');
        const customer = await customerDb.getCustomerById('a901ad8c-e934-4bff-8eff-0c52e58c2599');
        console.log('Query success! Result:', customer);
        process.exit(0);
    } catch (err) {
        console.error('Query failed with error:');
        console.error(err);
        process.exit(1);
    }
}

testQuery();
