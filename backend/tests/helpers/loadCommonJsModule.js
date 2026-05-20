const Module = require('node:module');

const loadCommonJsModule = (modulePath, mocks = {}, options = {}) => {
    const originalLoad = Module._load;
    const originalCwd = process.cwd();

    if (options.cwd) {
        process.chdir(options.cwd);
    }

    const resolvedModulePath = require.resolve(modulePath);
    delete require.cache[resolvedModulePath];

    Module._load = function patchedLoad(request, parent, isMain) {
        if (Object.prototype.hasOwnProperty.call(mocks, request)) {
            return mocks[request];
        }

        return originalLoad.call(this, request, parent, isMain);
    };

    try {
        return require(modulePath);
    } finally {
        Module._load = originalLoad;
        process.chdir(originalCwd);
    }
};

module.exports = loadCommonJsModule;
