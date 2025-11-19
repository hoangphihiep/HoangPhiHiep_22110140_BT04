const { body, validationResult } = require('express-validator');

// Middleware để xử lý kết quả validation
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            EC: 1,
            EM: 'Dữ liệu không hợp lệ',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Validation rules cho Register
const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Họ tên không được để trống')
        .isLength({ min: 2, max: 50 }).withMessage('Họ tên phải từ 2-50 ký tự')
        .matches(/^[a-zA-ZÀ-ỹ\s]+$/).withMessage('Họ tên chỉ được chứa chữ cái'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Mật khẩu không được để trống')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
        .matches(/[a-zA-Z]/).withMessage('Mật khẩu phải chứa chữ cái')
        .matches(/[0-9]/).withMessage('Mật khẩu phải chứa số'),
    
    validate
];

// Validation rules cho Login
const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Mật khẩu không được để trống')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    
    validate
];

// Validation cho Forgot Password
const validateForgotPassword = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail(),
    
    validate
];

// Validation cho Verify OTP
const validateVerifyOTP = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail(),
    
    body('otp')
        .notEmpty().withMessage('OTP không được để trống')
        .isLength({ min: 6, max: 6 }).withMessage('OTP phải có 6 ký tự')
        .isNumeric().withMessage('OTP chỉ được chứa số'),
    
    validate
];

// Validation cho Reset Password
const validateResetPassword = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail(),
    
    body('otp')
        .notEmpty().withMessage('OTP không được để trống')
        .isLength({ min: 6, max: 6 }).withMessage('OTP phải có 6 ký tự')
        .isNumeric().withMessage('OTP chỉ được chứa số'),
    
    body('newPassword')
        .notEmpty().withMessage('Mật khẩu mới không được để trống')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
        .matches(/[a-zA-Z]/).withMessage('Mật khẩu phải chứa chữ cái')
        .matches(/[0-9]/).withMessage('Mật khẩu phải chứa số'),
    
    body('confirmPassword')
        .notEmpty().withMessage('Xác nhận mật khẩu không được để trống')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Mật khẩu xác nhận không khớp');
            }
            return true;
        }),
    
    validate
];

module.exports = {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateVerifyOTP,
    validateResetPassword
};