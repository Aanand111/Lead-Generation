const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const isAbsoluteUrl = (value = '') => /^https?:\/\//i.test(value);

const ensureLeadingSlash = (value = '') => (value.startsWith('/') ? value : `/${value}`);

const normalizeConfiguredUrl = (value = '') => trimTrailingSlash(String(value || '').trim());

export const getApiBaseUrl = () => {
    const configured = normalizeConfiguredUrl(import.meta.env.VITE_API_URL);
    return configured || '/api';
};

export const getSocketBaseUrl = () => {
    const configuredSocketUrl = normalizeConfiguredUrl(import.meta.env.VITE_SOCKET_URL);
    if (configuredSocketUrl) {
        return configuredSocketUrl;
    }

    const configuredApiUrl = normalizeConfiguredUrl(import.meta.env.VITE_API_URL);
    if (configuredApiUrl && isAbsoluteUrl(configuredApiUrl)) {
        return configuredApiUrl.replace(/\/api$/, '');
    }

    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    return '';
};

export const toPublicAssetUrl = (assetPath) => {
    if (!assetPath) {
        return '';
    }

    if (isAbsoluteUrl(assetPath)) {
        return assetPath;
    }

    const configuredBaseUrl = normalizeConfiguredUrl(import.meta.env.VITE_BASE_URL);
    const normalizedPath = ensureLeadingSlash(String(assetPath).replace(/^\.\//, ''));

    return configuredBaseUrl ? `${configuredBaseUrl}${normalizedPath}` : normalizedPath;
};
