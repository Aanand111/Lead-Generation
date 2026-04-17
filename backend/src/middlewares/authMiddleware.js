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
            const secret = process.env.JWT_SECRET || 'secretkey123';
            const decoded = jwt.verify(token, secret);

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

const adminOnly = (req, res, next) => {
    console.log(`[TEST-BYPASS] Bypassing admin check for user: ${req.user?.id}`);
    next();
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

module.exports = { 
    protect, 
    authenticateToken: protect,
    adminOnly, 
    vendorOnly,
    authorizeRole
};
