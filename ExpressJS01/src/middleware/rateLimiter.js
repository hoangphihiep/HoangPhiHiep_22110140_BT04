const rateLimit = require('express-rate-limit');

// Rate limiter cho Login - chống brute force
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5, // Giới hạn 5 request
    message: {
        EC: 1,
        EM: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút'
    },
    standardHeaders: true, // Trả về rate limit info trong `RateLimit-*` headers
    legacyHeaders: false, // Tắt `X-RateLimit-*` headers
    skipSuccessfulRequests: true, // Không đếm request thành công
});

// Rate limiter cho Register - chống spam tạo tài khoản
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 giờ
    max: 3, // Giới hạn 3 tài khoản/IP/giờ
    message: {
        EC: 1,
        EM: 'Quá nhiều tài khoản được tạo từ IP này. Vui lòng thử lại sau 1 giờ'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter cho Forgot Password - chống spam gửi email
const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 giờ
    max: 3, // Giới hạn 3 request/IP/giờ
    message: {
        EC: 1,
        EM: 'Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau 1 giờ'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter cho Verify OTP - chống brute force OTP
const verifyOTPLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5, // Giới hạn 5 lần thử OTP
    message: {
        EC: 1,
        EM: 'Quá nhiều lần thử OTP sai. Vui lòng thử lại sau 15 phút'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter chung cho tất cả API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // Giới hạn 100 request/IP/15 phút
    message: {
        EC: 1,
        EM: 'Quá nhiều request từ IP này. Vui lòng thử lại sau'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter nghiêm ngặt cho sensitive operations
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 giờ
    max: 10, // Giới hạn 10 request/giờ
    message: {
        EC: 1,
        EM: 'Quá nhiều request. Vui lòng thử lại sau'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    loginLimiter,
    registerLimiter,
    forgotPasswordLimiter,
    verifyOTPLimiter,
    apiLimiter,
    strictLimiter
};