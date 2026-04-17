const { getTransactions } = require('./src/controllers/adminTransactionController');
const httpMocks = require('node-mocks-http');

async function testApi() {
    const req = httpMocks.createRequest({
        method: 'GET',
        url: '/admin/transactions',
        query: {}
    });
    const res = httpMocks.createResponse();

    try {
        await getTransactions(req, res, (err) => { if(err) throw err; });
        const data = res._getJSONData();
        console.log('Result count:', data.data.length);
        if (data.data.length > 0) {
            console.log('First record fields:', Object.keys(data.data[0]));
            console.log('Sample record:', JSON.stringify(data.data[0], null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testApi();
