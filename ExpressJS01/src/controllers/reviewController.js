const {
    createReview,
    updateReview,
    deleteReview,
    getProductReviews,
    getProductReviewStats,
} = require('../services/reviewService');

// POST: Tạo review
const addReview = async (req, res) => {
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;

    console.log('📝 addReview controller:', { userId, productId, rating, comment });

    if (!productId || !rating || !comment) {
        return res.status(400).json({
            EC: 1,
            EM: 'productId, rating và comment là bắt buộc',
        });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            EC: 1,
            EM: 'Rating phải từ 1 đến 5',
        });
    }

    const result = await createReview(userId, productId, rating, comment);
    
    console.log('📝 addReview result:', result);
    
    if (result.EC === 0) {
        return res.status(201).json(result);
    } else {
        return res.status(400).json(result);
    }
};

// PUT: Cập nhật review
const editReview = async (req, res) => {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
        return res.status(400).json({
            EC: 1,
            EM: 'rating và comment là bắt buộc',
        });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            EC: 1,
            EM: 'Rating phải từ 1 đến 5',
        });
    }

    const result = await updateReview(reviewId, userId, rating, comment);
    
    if (result.EC === 0) {
        return res.status(200).json(result);
    } else {
        return res.status(400).json(result);
    }
};

// DELETE: Xóa review
const removeReview = async (req, res) => {
    const userId = req.user.id;
    const { reviewId } = req.params;

    const result = await deleteReview(reviewId, userId);
    
    if (result.EC === 0) {
        return res.status(200).json(result);
    } else {
        return res.status(400).json(result);
    }
};

// GET: Lấy reviews của product
const getReviews = async (req, res) => {
    const productId = req.params.id; // Route dùng :id
    const { page, limit } = req.query;

    console.log('📖 getReviews controller - productId:', productId, 'Type:', typeof productId);

    const result = await getProductReviews(productId, page, limit);
    
    console.log('📖 getReviews result:', JSON.stringify(result, null, 2));
    
    if (result.EC === 0) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
};

// GET: Lấy thống kê reviews của product
const getReviewStats = async (req, res) => {
    const productId = req.params.id; // Route dùng :id

    const result = await getProductReviewStats(productId);
    
    if (result.EC === 0) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
};

module.exports = {
    addReview,
    editReview,
    removeReview,
    getReviews,
    getReviewStats,
};
