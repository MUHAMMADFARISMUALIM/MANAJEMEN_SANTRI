const jwt = require('jsonwebtoken');

// Middleware untuk verifikasi token JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(403).json({ 
            success: false, 
            message: 'Token tidak ditemukan, akses ditolak' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token tidak valid atau kadaluarsa' 
        });
    }
};

// Middleware untuk cek role tertentu
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User tidak terautentikasi' 
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Akses ditolak. Role Anda tidak memiliki izin untuk aksi ini' 
            });
        }

        next();
    };
};

module.exports = { verifyToken, checkRole };
