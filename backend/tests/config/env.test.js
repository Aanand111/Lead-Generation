const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const envModulePath = path.join(repoRoot, 'backend', 'src', 'config', 'env.js');

const originalCwd = process.cwd();
process.chdir(repoRoot);
const { parseNumber, parseBoolean, parseCsv } = require(envModulePath);
process.chdir(originalCwd);

test('parseNumber falls back for invalid values', () => {
    assert.equal(parseNumber('42', 0), 42);
    assert.equal(parseNumber('abc', 7), 7);
    assert.equal(parseNumber(undefined, 9), 9);
});

test('parseBoolean handles common truthy and falsy values', () => {
    assert.equal(parseBoolean('true', false), true);
    assert.equal(parseBoolean('YES', false), true);
    assert.equal(parseBoolean('0', true), false);
    assert.equal(parseBoolean(undefined, true), true);
});

test('parseCsv returns trimmed values and removes blanks', () => {
    assert.deepEqual(parseCsv('a, b ,, c'), ['a', 'b', 'c']);
    assert.deepEqual(parseCsv(''), []);
});

test('validateEnv exits when JWT_SECRET is missing', () => {
    const script = `
        process.chdir(${JSON.stringify(repoRoot)});
        const { validateEnv } = require(${JSON.stringify(envModulePath)});
        validateEnv();
    `;

    const result = spawnSync(process.execPath, ['-e', script], {
        cwd: repoRoot,
        env: {
            NODE_ENV: 'development',
            RUNTIME_ROLE: 'api',
            DB_NAME: 'leadgen',
            DB_USER: 'postgres',
            DB_PASSWORD: 'postgres',
            DB_HOST: 'localhost',
            DB_PORT: '5432',
            PATH: process.env.PATH
        },
        encoding: 'utf8'
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr || result.stdout, /JWT_SECRET|Missing Required Environment Variables/);
});
