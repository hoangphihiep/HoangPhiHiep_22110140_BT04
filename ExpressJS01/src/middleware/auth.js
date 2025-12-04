require("dotenv").config();
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret_key_change_this';
if (!process.env.JWT_SECRET) {
    console.warn('⚠️  Warning: JWT_SECRET not set in .env — using development default');
}

const auth = (req, res, next) => {
    // Danh sách public routes (không cần authentication)
    const publicPaths = [
        '/v1/api',
        '/v1/api/',
        '/v1/api/register',
        '/v1/api/login',
        '/v1/api/forgot-password',
        '/v1/api/verify-otp',
        '/v1/api/reset-password',
    ];

    // Cho phép public routes
    if (publicPaths.includes(req.originalUrl)) {
        return next();
    }

    // Lấy token từ header
    const authHeader = req?.headers?.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            EC: 1,
            EM: "Không tìm thấy Access Token. Vui lòng đăng nhập" 
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ 
            EC: 1,
            EM: "Token không hợp lệ" 
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, jwtSecret);
        
        // Gắn thông tin user vào request
        req.user = {
            id: decoded.userId || decoded.id, // Thống nhất dùng 'id'
            email: decoded.email,
            name: decoded.name,
            role: decoded.role || 'User'
        };
        
        console.log('✅ Token verified:', {
            email: decoded.email,
            role: decoded.role
        });
        
        return next();
    } catch (error) {
        console.error('❌ Token verification failed:', error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                EC: 1,
                EM: "Token đã hết hạn. Vui lòng đăng nhập lại" 
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                EC: 1,
                EM: "Token không hợp lệ" 
            });
        }
        
        return res.status(401).json({ 
            EC: 1,
            EM: "Xác thực thất bại" 
        });
    }
};

module.exports = auth;