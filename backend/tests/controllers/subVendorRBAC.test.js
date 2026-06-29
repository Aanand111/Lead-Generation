const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const loadCommonJsModule = require('../helpers/loadCommonJsModule');
const createMockResponse = require('../helpers/mockResponse');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const authMiddlewarePath = path.join(repoRoot, 'backend', 'src', 'middlewares', 'authMiddleware.js');
const authControllerPath = path.join(repoRoot, 'backend', 'src', 'controllers', 'authController.js');

test('subVendorOnly middleware allows sub-vendor role', () => {
    const middleware = loadCommonJsModule(authMiddlewarePath, {
        jsonwebtoken: {},
        'dotenv': { config: () => {} }
    }, { cwd: repoRoot });

    const req = { user: { id: 'sv-1', role: 'sub-vendor' } };
    const res = createMockResponse();
    let nextCalled = false;

    middleware.subVendorOnly(req, res, () => {
        nextCalled = true;
    });

    assert.ok(nextCalled, 'next() should be called for sub-vendor');
    assert.equal(res.statusCode, null); // no response sent
});

test('subVendorOnly middleware denies non-sub-vendor roles (403)', () => {
    const middleware = loadCommonJsModule(authMiddlewarePath, {
        jsonwebtoken: {},
        'dotenv': { config: () => {} }
    }, { cwd: repoRoot });

    const rolesToTest = ['vendor', 'admin', 'user'];

    for (const role of rolesToTest) {
        const req = { user: { id: 'user-1', role } };
        const res = createMockResponse();
        let nextCalled = false;

        middleware.subVendorOnly(req, res, () => {
            nextCalled = true;
        });

        assert.ok(!nextCalled, `next() should NOT be called for role: ${role}`);
        assert.equal(res.statusCode, 403, `Should deny access with 403 for role: ${role}`);
        assert.equal(res.body.success, false);
    }
});

test('loginUser maps vendor with referred_by to sub-vendor effective role in token', async () => {
    process.env.JWT_SECRET = 'y'.repeat(32);
    let signedRole = null;

    const controller = loadCommonJsModule(authControllerPath, {
        bcryptjs: {
            compare: async () => true
        },
        jsonwebtoken: {
            sign: (payload) => {
                signedRole = payload.role;
                return 'signed-token-sub-vendor';
            }
        },
        '../models/userModel': {
            findUserByPhone: async () => null,
            findUserByEmail: async () => null,
            createUser: async () => null,
            findUserByReferralCode: async () => null,
            findUserByIdentifier: async () => ({
                id: 'subvendor-uuid-1234',
                role: 'vendor',
                email: 'subvendor@example.com',
                phone: '9876543211',
                password_hash: 'hash',
                full_name: 'Sub Vendor Test',
                profile_pic: null,
                status: 'ACTIVE',
                referred_by: 'parent-vendor-uuid-5678' // non-null means sub-vendor!
            })
        },
        '../services/mailService': {},
        '../services/notificationService': {}
    }, { cwd: repoRoot });

    const req = {
        body: {
            email: 'subvendor@example.com',
            password: 'secure123'
        }
    };
    const res = createMockResponse();

    await controller.loginUser(req, res, (error) => {
        throw error;
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(signedRole, 'sub-vendor', 'Token should be signed with role sub-vendor');
    assert.equal(res.body.user.role, 'sub-vendor', 'Response user object should have role sub-vendor');
});
