const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const loadCommonJsModule = require('../helpers/loadCommonJsModule');
const createMockResponse = require('../helpers/mockResponse');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const controllerPath = path.join(repoRoot, 'backend', 'src', 'controllers', 'adminAnalyticsController.js');

const createStreamingResponse = () => {
    const response = createMockResponse();
    response.headers = {};
    response.chunks = [];
    response.ended = false;
    response.setHeader = function setHeader(name, value) {
        this.headers[name] = value;
    };
    response.write = function write(chunk) {
        this.chunks.push(String(chunk));
        return true;
    };
    response.end = function end(chunk = '') {
        if (chunk) {
            this.chunks.push(String(chunk));
        }
        this.ended = true;
        return this;
    };
    response.send = function send(payload) {
        this.body = payload;
        return this;
    };
    return response;
};

test('exportDetailedReports rejects oversized lead xlsx exports', async () => {
    const controller = loadCommonJsModule(controllerPath, {
        '../models/adminAnalyticsModel': {
            countDetailedLeadReports: async () => 6001
        },
        xlsx: {}
    }, { cwd: repoRoot });

    const req = {
        query: {
            format: 'xlsx',
            type: 'leads'
        }
    };
    const res = createStreamingResponse();

    await controller.exportDetailedReports(req, res, (error) => {
        throw error;
    });

    assert.equal(res.statusCode, 413);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /XLSX export is limited to 5000 rows/i);
});

test('exportDetailedReports streams lead csv in batches', async () => {
    const batchCalls = [];

    const controller = loadCommonJsModule(controllerPath, {
        '../models/adminAnalyticsModel': {
            getDetailedLeadReportBatch: async (_filters, options) => {
                batchCalls.push(options);

                if (batchCalls.length === 1) {
                    return [
                        {
                            _cursor_id: 'b0000000-0000-0000-0000-000000000002',
                            lead_id: 'L-2',
                            customer_name: 'Alpha',
                            city: 'Mumbai',
                            state: 'MH',
                            category: 'Insurance',
                            lead_value: 120,
                            created_by_vendor: 'Vendor A',
                            current_status: 'ACTIVE',
                            upload_date: '2026-05-19T10:00:00.000Z',
                            purchase_date: null,
                            buyer_name: null,
                            credits_used: 0
                        },
                        {
                            _cursor_id: 'a0000000-0000-0000-0000-000000000001',
                            lead_id: 'L-1',
                            customer_name: 'Beta',
                            city: 'Delhi',
                            state: 'DL',
                            category: 'Loans',
                            lead_value: 90,
                            created_by_vendor: 'Vendor B',
                            current_status: 'PENDING',
                            upload_date: '2026-05-18T10:00:00.000Z',
                            purchase_date: '2026-05-19T12:00:00.000Z',
                            buyer_name: 'Buyer One',
                            credits_used: 10
                        }
                    ];
                }

                return [];
            }
        },
        xlsx: {}
    }, { cwd: repoRoot });

    const req = {
        query: {
            format: 'csv',
            type: 'leads'
        }
    };
    const res = createStreamingResponse();

    await controller.exportDetailedReports(req, res, (error) => {
        throw error;
    });

    assert.equal(batchCalls.length, 2);
    assert.deepEqual(batchCalls[0], {
        limit: 1000,
        cursorCreatedAt: null,
        cursorId: null
    });
    assert.deepEqual(batchCalls[1], {
        limit: 1000,
        cursorCreatedAt: '2026-05-18T10:00:00.000Z',
        cursorId: 'a0000000-0000-0000-0000-000000000001'
    });
    assert.equal(res.headers['Content-Type'], 'text/csv; charset=utf-8');
    assert.equal(res.ended, true);
    assert.match(res.chunks[0], /Lead ID,Customer Name,City/);
    assert.match(res.chunks.join(''), /L-2,Alpha,Mumbai/);
    assert.match(res.chunks.join(''), /L-1,Beta,Delhi/);
});
