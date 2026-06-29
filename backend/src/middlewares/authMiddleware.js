const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = async (req, res, next) => {
    let token;

    // Skip auth for OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
        return next();
    }

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                console.error('[FATAL] JWT_SECRET not set in environment variables!');
                return res.status(500).json({ success: false, message: 'Server configuration error.' });
            }
            const decoded = jwt.verify(token, secret);

            // Verify if the token has been revoked (Task 6)
            try {
                const { redisConnection } = require('../config/redis');
                if (redisConnection && typeof redisConnection.get === 'function') {
                    const revokedAt = await redisConnection.get(`jwt_revoked_at:${decoded.id}`);
                    if (revokedAt && decoded.iat < parseInt(revokedAt, 10)) {
                        return res.status(401).json({ success: false, message: 'Session expired due to password change. Please log in again.' });
                    }
                }
            } catch (rErr) {
                console.error('[REDIS REVOCATION CHECK ERROR]', rErr.message);
            }

            req.user = {
                id: decoded.id,
                role: decoded.role
            };

            return next();
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

// FIXED: Was a complete bypass - literally just called next() with no check (CRITICAL BUG)
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
    });
};

const vendorOnly = (req, res, next) => {
    if (req.user && req.user.role === 'vendor') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as a vendor' });
    }
};

const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (req.method === 'OPTIONS') return next();
        
        if (req.user && roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ success: false, message: `Access denied. Role "${req.user?.role}" not authorized.` });
        }
    };
};

const subVendorOnly = (req, res, next) => {
    if (req.user && req.user.role === 'sub-vendor') {
        return next();
    }
    return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Sub-vendor privileges required.' 
    });
};

module.exports = { 
    protect, 
    authenticateToken: protect,
    adminOnly, 
    vendorOnly,
    subVendorOnly,
    authorizeRole
};

