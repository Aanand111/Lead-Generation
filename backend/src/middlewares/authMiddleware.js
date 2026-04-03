const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = async (req, res, next) => {
    let token;

    console.log(`[DEBUG] Incoming request: ${req.method} ${req.originalUrl}`);
    
    // Skip auth for OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
        return next();
    }

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        console.log(`[DEBUG] Authorization Header found: ${req.headers.authorization.substring(0, 20)}...`);
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log(`[DEBUG] Token found: ${token.substring(0, 10)}...`);

            const secret = process.env.JWT_SECRET || 'secretkey123';
            const decoded = jwt.verify(token, secret);
            console.log(`[DEBUG] Token verified. User:`, decoded);

            req.user = {
                id: decoded.id,
                role: decoded.role
            };

            return next();
        } catch (error) {
            console.error('[DEBUG] Token Verification Failed:', error.message);
            console.log('[DEBUG] Secret being used (masked):', (process.env.JWT_SECRET || 'secretkey123').slice(0, 4) + '***');
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    }
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
        
        console.log(`[DEBUG] Role Check: User Role="${req.user?.role}", Expected One Of=${JSON.stringify(roles)}`);
        
        if (req.user && roles.includes(req.user.role)) {
            next();
        } else {
            console.warn(`[DEBUG] Role Check FAILED for User: ${req.user?.id}. Role: ${req.user?.role}`);
            res.status(403).json({ success: false, message: `Access denied. Role "${req.user?.role}" not authorized.` });
        }
    };
};

module.exports = { 
    protect, 
    authenticateToken: protect, // Alias for consistency
    adminOnly, 
    vendorOnly,
    authorizeRole
};
