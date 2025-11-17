require("dotenv").config();
const jwt = require("jsonwebtoken");

// Use same development fallback secret as signing logic to avoid verify failures
const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret_key_change_this';
if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET not set in .env — using development default for verification');
}

const auth = (req, res, next) => {
    // allow public routes for this router: both with and without trailing slash
    const publicPaths = [
        '/v1/api',
        '/v1/api/',
        '/v1/api/register',
        '/v1/api/login',
        '/v1/api/forgot-password',
        '/v1/api/verify-otp',
        '/v1/api/reset-password',
    ];

    if (publicPaths.includes(req.originalUrl)) {
        return next();
    }

    const token = req?.headers?.authorization?.split(" ")?.[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, jwtSecret);
            req.user = {
                email: decoded.email,
                name: decoded.name,
                createdBy: "hoidanit"
            };
            console.log('>>> check token (decoded):', decoded);
            return next();
        } catch (error) {
            console.warn('Token verify failed:', error && error.message);
            return res.status(401).json({ message: "Token bị hết hạn/hoặc không hợp lệ" });
        }
    } else {
        return res.status(401).json({ message: "Bạn chưa truyền Access Token ở header/Hoặc token bị hết hạn" });
    }
}

module.exports = auth;