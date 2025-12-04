const express = require('express');
const { createUser, handleLogin, getUser, getAccount } = require('../controllers/userController');
const { requestPasswordReset, verifyOTP, resetPassword } = require('../controllers/passwordResetController');
const { 
    getCategories, 
    getProducts, 
    getProductById,
    searchProducts,
    addProduct,
    editProduct,
    removeProduct,
    getSimilarProducts
} = require('../controllers/productController');

const {
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    checkFavorite,
} = require('../controllers/favoriteController');

const {
    addReview,
    editReview,
    removeReview,
    getReviews,
    getReviewStats,
} = require('../controllers/reviewController');

const {
    addToViewHistory,
    getViewHistory,
    clearHistory,
    removeFromHistory,
    getViewCount,
} = require('../controllers/viewHistoryController');

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
routerAPI.get("/products/search", searchProducts); // Tìm kiếm & lọc với query params
routerAPI.get("/products/:id/similar", getSimilarProducts); // Sản phẩm tương tự
routerAPI.get("/products/:id/reviews", getReviews); // Reviews của product (public)
routerAPI.get("/products/:id/reviews/stats", getReviewStats); // Thống kê reviews (public)
routerAPI.get("/products/:productId/view-count", getViewCount); // Số lượt xem (public)
routerAPI.get("/products/:id", getProductById);
routerAPI.get("/products", getProducts);

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

// Favorites Routes (Protected)
routerAPI.post("/favorites", isUser, addToFavorites);
routerAPI.delete("/favorites/:productId", isUser, removeFromFavorites);
routerAPI.get("/favorites", isUser, getFavorites);
routerAPI.get("/favorites/check/:productId", isUser, checkFavorite);

// Reviews Routes (Protected)
routerAPI.post("/reviews", isUser, addReview);
routerAPI.put("/reviews/:reviewId", isUser, editReview);
routerAPI.delete("/reviews/:reviewId", isUser, removeReview);

// View History Routes (Protected)
routerAPI.post("/view-history", isUser, addToViewHistory);
routerAPI.get("/view-history", isUser, getViewHistory);
routerAPI.delete("/view-history", isUser, clearHistory);
routerAPI.delete("/view-history/:productId", isUser, removeFromHistory);

// Admin Product Management Routes
routerAPI.post(
    "/products",
    isAdmin,
    addProduct
);

routerAPI.put(
    "/products/:id",
    isAdmin,
    editProduct
);

routerAPI.delete(
    "/products/:id",
    isAdmin,
    removeProduct
);

// 404 handler
routerAPI.use((req, res) => {
    return res.status(404).json({
        EC: 1,
        EM: "API endpoint không tồn tại"
    });
});

module.exports = routerAPI;
