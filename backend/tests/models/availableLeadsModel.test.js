const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const loadCommonJsModule = require('../helpers/loadCommonJsModule');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const modelPath = path.join(repoRoot, 'backend', 'src', 'models', 'availableLeadsModel.js');

test('getAvailableLeads avoids FULL OUTER JOIN and strips total_count from results', async () => {
    let capturedQuery = '';
    let capturedParams = null;

    const model = loadCommonJsModule(modelPath, {
        '../config/db': {
            pool: {
                query: async (text, params) => {
                    capturedQuery = text;
                    capturedParams = params;
                    return {
                        rows: [
                            {
                                id: 'lead-1',
                                lead_id: 'L-1',
                                customer_name: 'Alice',
                                created_at: '2026-05-19T00:00:00.000Z',
                                total_count: '2'
                            },
                            {
                                id: 'lead-2',
                                lead_id: 'L-2',
                                customer_name: 'Bob',
                                created_at: '2026-05-18T00:00:00.000Z',
                                total_count: '2'
                            }
                        ]
                    };
                }
            }
        }
    }, { cwd: repoRoot });

    const result = await model.getAvailableLeads(2, 25, 'mumbai');

    assert.match(capturedQuery, /UNION ALL/);
    assert.doesNotMatch(capturedQuery, /FULL OUTER JOIN/);
    assert.deepEqual(capturedParams, [25, 25, '%mumbai%']);
    assert.equal(result.total, 2);
    assert.deepEqual(result.leads, [
        {
            id: 'lead-1',
            lead_id: 'L-1',
            customer_name: 'Alice',
            created_at: '2026-05-19T00:00:00.000Z'
        },
        {
            id: 'lead-2',
            lead_id: 'L-2',
            customer_name: 'Bob',
            created_at: '2026-05-18T00:00:00.000Z'
        }
    ]);
});

test('getAvailableLeads sends null search param when search is blank', async () => {
    let capturedParams = null;

    const model = loadCommonJsModule(modelPath, {
        '../config/db': {
            pool: {
                query: async (_text, params) => {
                    capturedParams = params;
                    return { rows: [] };
                }
            }
        }
    }, { cwd: repoRoot });

    const result = await model.getAvailableLeads(1, 10, '   ');

    assert.deepEqual(capturedParams, [10, 0, null]);
    assert.equal(result.total, 0);
    assert.deepEqual(result.leads, []);
});
