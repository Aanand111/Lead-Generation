const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const loadCommonJsModule = require('../helpers/loadCommonJsModule');
const createMockResponse = require('../helpers/mockResponse');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const controllerPath = path.join(repoRoot, 'backend', 'src', 'controllers', 'availableLeadsController.js');

test('getAvailableLeads clamps page and limit before calling the model', async () => {
    let receivedArgs = null;

    const controller = loadCommonJsModule(controllerPath, {
        '../models/availableLeadsModel': {
            getAvailableLeads: async (...args) => {
                receivedArgs = args;
                return {
                    leads: [{ id: 'lead-1' }],
                    total: 1
                };
            }
        }
    }, { cwd: repoRoot });

    const req = {
        query: {
            page: '-4',
            limit: '500',
            search: 'delhi'
        }
    };
    const res = createMockResponse();

    await controller.getAvailableLeads(req, res, (error) => {
        throw error;
    });

    assert.deepEqual(receivedArgs, [1, 100, 'delhi']);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.pagination.page, 1);
    assert.equal(res.body.pagination.limit, 100);
});
