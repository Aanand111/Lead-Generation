const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const loadCommonJsModule = require('../helpers/loadCommonJsModule');
const createMockResponse = require('../helpers/mockResponse');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const controllerPath = path.join(repoRoot, 'backend', 'src', 'controllers', 'authController.js');

test('loginUser surfaces a configuration error when JWT_SECRET is missing', async () => {
    delete process.env.JWT_SECRET;

    const controller = loadCommonJsModule(controllerPath, {
        bcryptjs: {
            compare: async () => true
        },
        jsonwebtoken: {
            sign: () => 'should-not-be-used'
        },
        '../models/userModel': {
            findUserByPhone: async () => null,
            findUserByEmail: async () => null,
            createUser: async () => null,
            findUserByReferralCode: async () => null,
            findUserByIdentifier: async () => ({
                id: 'user-1',
                role: 'user',
                email: 'user@example.com',
                phone: '9876543210',
                password_hash: 'hash',
                full_name: 'User One',
                status: 'ACTIVE'
            })
        },
        '../services/mailService': {},
        '../services/notificationService': {}
    }, { cwd: repoRoot });

    const req = {
        body: {
            email: 'user@example.com',
            password: 'secure123'
        }
    };
    const res = createMockResponse();
    let forwardedError = null;

    await controller.loginUser(req, res, (error) => {
        forwardedError = error;
    });

    assert.equal(res.body, null);
    assert.ok(forwardedError instanceof Error);
    assert.match(forwardedError.message, /JWT_SECRET is not configured/i);
});

test('loginUser returns a token when configuration and credentials are valid', async () => {
    process.env.JWT_SECRET = 'x'.repeat(32);

    const controller = loadCommonJsModule(controllerPath, {
        bcryptjs: {
            compare: async () => true
        },
        jsonwebtoken: {
            sign: () => 'signed-token'
        },
        '../models/userModel': {
            findUserByPhone: async () => null,
            findUserByEmail: async () => null,
            createUser: async () => null,
            findUserByReferralCode: async () => null,
            findUserByIdentifier: async () => ({
                id: 'user-2',
                role: 'vendor',
                email: 'vendor@example.com',
                phone: '9876543210',
                password_hash: 'hash',
                full_name: 'Vendor User',
                profile_pic: null,
                status: 'ACTIVE',
                referred_by: null
            })
        },
        '../services/mailService': {},
        '../services/notificationService': {}
    }, { cwd: repoRoot });

    const req = {
        body: {
            email: 'vendor@example.com',
            password: 'secure123'
        }
    };
    const res = createMockResponse();

    await controller.loginUser(req, res, (error) => {
        throw error;
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.token, 'signed-token');
    assert.equal(res.body.user.role, 'vendor');
});
