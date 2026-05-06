const { parseCsv } = require('./env');

const DEFAULT_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
];

const getAllowedOrigins = () => {
    const explicitOrigins = parseCsv(process.env.ALLOWED_ORIGINS);
    const configuredPublicOrigin = process.env.FRONTEND_PUBLIC_URL?.trim();

    const origins = explicitOrigins.length > 0
        ? explicitOrigins
        : [...DEFAULT_ALLOWED_ORIGINS];

    if (configuredPublicOrigin && !origins.includes(configuredPublicOrigin)) {
        origins.push(configuredPublicOrigin);
    }

    return origins;
};

const isOriginAllowed = (origin) => !origin || getAllowedOrigins().includes(origin);

module.exports = {
    getAllowedOrigins,
    isOriginAllowed
};
