const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const loadCommonJsModule = require('../helpers/loadCommonJsModule');
const createMockResponse = require('../helpers/mockResponse');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const controllerPath = path.join(repoRoot, 'backend', 'src', 'controllers', 'vendorPanelController.js');

test('getVendorReferrals clamps pagination and avoids correlated per-row subqueries', async () => {
    const executedQueries = [];

    const controller = loadCommonJsModule(controllerPath, {
        '../config/db': {
            pool: {
                query: async (sql, params) => {
                    executedQueries.push({ sql, params });

                    if (/WITH paged_referrals AS/.test(sql)) {
                        return {
                            rows: [{
                                id: 'user-1',
                                phone: '9999999999',
                                full_name: 'Test User',
                                role: 'user',
                                status: 'ACTIVE',
                                created_at: '2026-01-01T00:00:00.000Z',
                                last_login: '2026-01-02T00:00:00.000Z',
                                last_activity: '2026-01-03T00:00:00.000Z',
                                total_revenue: '450.00',
                                child_referrals: 2
                            }]
                        };
                    }

                    if (/SELECT COUNT\(\*\) FROM users WHERE referred_by = \$1/.test(sql)) {
                        return { rows: [{ count: '12' }] };
                    }

                    throw new Error(`Unexpected SQL: ${sql}`);
                }
            }
        },
        '../services/notificationService': {},
        bcryptjs: {},
        '../utils/socket': {
            broadcast: () => {},
            sendToUser: () => {}
        }
    }, { cwd: repoRoot });

    const req = {
        user: { id: 'vendor-1' },
        query: { page: '-4', limit: '500' }
    };
    const res = createMockResponse();

    await controller.getVendorReferrals(req, res, (error) => {
        throw error;
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.pagination.page, 1);
    assert.equal(res.body.pagination.limit, 100);
    assert.equal(res.body.pagination.pages, 1);

    assert.equal(executedQueries.length, 2);
    assert.match(executedQueries[0].sql, /WITH paged_referrals AS/);
    assert.doesNotMatch(executedQueries[0].sql, /\(SELECT MAX\(created_at\)/);
    assert.doesNotMatch(executedQueries[0].sql, /\(SELECT COALESCE\(SUM\(amount\), 0\)/);
    assert.deepEqual(executedQueries[0].params, ['vendor-1', 100, 0]);
    assert.deepEqual(executedQueries[1].params, ['vendor-1']);
});
