const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const loadCommonJsModule = require('../helpers/loadCommonJsModule');
const createMockResponse = require('../helpers/mockResponse');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const controllerPath = path.join(repoRoot, 'backend', 'src', 'controllers', 'customerController.js');

test('addCustomer rejects requests without a password', async () => {
    let createCustomerCalled = false;

    const controller = loadCommonJsModule(controllerPath, {
        '../models/customerModel': {
            createCustomer: async () => {
                createCustomerCalled = true;
                return { id: 'should-not-run' };
            }
        }
    }, { cwd: repoRoot });

    const req = {
        body: {
            name: 'Test Customer',
            phone: '9876543210',
            password: ''
        }
    };
    const res = createMockResponse();
    let nextCalled = false;

    await controller.addCustomer(req, res, () => {
        nextCalled = true;
    });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /password is required/i);
    assert.equal(createCustomerCalled, false);
    assert.equal(nextCalled, false);
});

test('addCustomer creates a customer when payload is valid', async () => {
    const createdCustomer = { id: 'cust-1', full_name: 'Valid Customer' };
    let receivedPayload = null;

    const controller = loadCommonJsModule(controllerPath, {
        '../models/customerModel': {
            createCustomer: async (payload) => {
                receivedPayload = payload;
                return createdCustomer;
            }
        }
    }, { cwd: repoRoot });

    const req = {
        body: {
            name: 'Valid Customer',
            phone: '9876543210',
            password: 'secure123'
        }
    };
    const res = createMockResponse();

    await controller.addCustomer(req, res, () => {
        throw new Error('next should not be called for a valid request');
    });

    assert.deepEqual(receivedPayload, req.body);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.deepEqual(res.body.data, createdCustomer);
});
