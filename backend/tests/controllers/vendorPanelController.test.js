const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const loadCommonJsModule = require('../helpers/loadCommonJsModule');
const createMockResponse = require('../helpers/mockResponse');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const controllerPath = path.join(repoRoot, 'backend', 'src', 'controllers', 'vendorPanelController.js');

test('requestSettlement commits once and notifies admins after a successful payout request', async () => {
    const sentEvents = [];
    const executedQueries = [];

    const client = {
        query: async (sql) => {
            executedQueries.push(sql);

            if (sql === 'BEGIN') return {};
            if (sql === 'COMMIT') return {};
            if (/WITH locked_rows AS/.test(sql)) {
                return { rows: [{ updated_count: 2, total_amount: '150.50' }] };
            }
            if (/COALESCE\(MAX\(CASE WHEN id = \$1 THEN full_name END\)/.test(sql)) {
                return { rows: [{ vendor_name: 'Vendor Prime', admin_ids: ['admin-1', 'admin-2'] }] };
            }

            throw new Error(`Unexpected SQL: ${sql}`);
        },
        release: () => {}
    };

    const controller = loadCommonJsModule(controllerPath, {
        '../config/db': {
            pool: {
                connect: async () => client
            }
        },
        '../services/notificationService': {},
        bcryptjs: {},
        '../models/vendorModel': {},
        '../utils/socket': {
            broadcast: () => {},
            sendToUser: (userId, event, payload) => {
                sentEvents.push({ userId, event, payload });
            }
        }
    }, { cwd: repoRoot });

    const req = { user: { id: 'vendor-1' } };
    const res = createMockResponse();

    await controller.requestSettlement(req, res, (error) => {
        throw error;
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(executedQueries.length, 4);
    assert.equal(executedQueries[0], 'BEGIN');
    assert.match(executedQueries[1], /WITH locked_rows AS/);
    assert.match(executedQueries[2], /COALESCE\(MAX\(CASE WHEN id = \$1 THEN full_name END\)/);
    assert.equal(executedQueries[3], 'COMMIT');
    assert.equal(sentEvents.length, 4);
    assert.deepEqual(sentEvents.map((entry) => entry.userId), ['admin-1', 'admin-1', 'admin-2', 'admin-2']);
});

test('requestSettlement returns 409 when a payout request is already pending review', async () => {
    const sentEvents = [];

    const client = {
        query: async (sql) => {
            if (sql === 'BEGIN') return {};
            if (sql === 'ROLLBACK') return {};
            if (/WITH locked_rows AS/.test(sql)) {
                return { rows: [{ updated_count: 0, total_amount: '0' }] };
            }
            if (/status = 'REQUESTED'/.test(sql)) {
                return { rows: [{ total_amount: '80.00' }] };
            }

            throw new Error(`Unexpected SQL: ${sql}`);
        },
        release: () => {}
    };

    const controller = loadCommonJsModule(controllerPath, {
        '../config/db': {
            pool: {
                connect: async () => client
            }
        },
        '../services/notificationService': {},
        bcryptjs: {},
        '../models/vendorModel': {},
        '../utils/socket': {
            broadcast: () => {},
            sendToUser: (...args) => {
                sentEvents.push(args);
            }
        }
    }, { cwd: repoRoot });

    const req = { user: { id: 'vendor-1' } };
    const res = createMockResponse();

    await controller.requestSettlement(req, res, (error) => {
        throw error;
    });

    assert.equal(res.statusCode, 409);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /already pending review/i);
    assert.equal(res.body.requested_amount, 80);
    assert.equal(sentEvents.length, 0);
});
