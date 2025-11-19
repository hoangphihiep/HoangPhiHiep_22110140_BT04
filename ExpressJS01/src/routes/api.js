const express = require('express');
const { createUser, handleLogin, getUser, getAccount } = require('../controllers/userController');
const { requestPasswordReset, verifyOTP, resetPassword } = require('../controllers/passwordResetController');
const { getCategories, getProducts, getProductById } = require('../controllers/productController');

const { 
    validateRegister, 
    validateLogin, 
    validateForgotPassword,
    validateVerifyOTP,
    validateResetPassword 
} = require('../middleware/validator');

const { 
    loginLimiter, 
    registerLimiter, 
    forgotPasswordLimiter,
    verifyOTPLimiter,
    apiLimiter,
    strictLimiter
} = require('../middleware/rateLimiter');

const auth = require('../middleware/auth');

const { isAdmin, isUser } = require('../middleware/authorize');

const routerAPI = express.Router();

routerAPI.get("/", (req, res) => {
    return res.status(200).json({
        EC: 0,
        EM: "API is running",
        version: "1.0.0"
    });
});

routerAPI.post(
    "/register", 
    registerLimiter,
    validateRegister,
    createUser
);

routerAPI.post(
    "/login", 
    loginLimiter,
    validateLogin,
    handleLogin
);

routerAPI.post(
    "/forgot-password", 
    forgotPasswordLimiter,
    validateForgotPassword,
    requestPasswordReset
);

routerAPI.post(
    "/verify-otp", 
    verifyOTPLimiter,
    validateVerifyOTP,
    verifyOTP
);

routerAPI.post(
    "/reset-password", 
    strictLimiter,
    validateResetPassword,
    resetPassword
);

routerAPI.get("/categories", getCategories);
routerAPI.get("/products", getProducts);
routerAPI.get("/products/:id", getProductById);

routerAPI.use(auth);

routerAPI.use(apiLimiter);

routerAPI.get(
    "/user", 
    isAdmin,
    getUser
);

routerAPI.get(
    "/account", 
    isUser,
    getAccount
);

// 404 handler
routerAPI.use((req, res) => {
    return res.status(404).json({
        EC: 1,
        EM: "API endpoint không tồn tại"
    });
});

module.exports = routerAPI;
