const {
    addViewHistory,
    getUserViewHistory,
    clearViewHistory,
    removeFromViewHistory,
    getProductViewCount,
} = require('../services/viewHistoryService');

// POST: Thêm vào lịch sử xem
const addToViewHistory = async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
        return res.status(400).json({
            EC: 1,
            EM: 'productId là bắt buộc',
        });
    }

    const result = await addViewHistory(userId, productId);
    
    if (result.EC === 0) {
        return res.status(200).json(result);
    } else {
        return res.status(400).json(result);
    }
};

// GET: Lấy lịch sử xem
const getViewHistory = async (req, res) => {
    const userId = req.user.id;
    const { page, limit } = req.query;

    const result = await getUserViewHistory(userId, page, limit);
    
    if (result.EC === 0) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
};

// DELETE: Xóa toàn bộ lịch sử xem
const clearHistory = async (req, res) => {
    const userId = req.user.id;

    const result = await clearViewHistory(userId);
    
    if (result.EC === 0) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
};

// DELETE: Xóa 1 item khỏi lịch sử
const removeFromHistory = async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;

    const result = await removeFromViewHistory(userId, productId);
    
    if (result.EC === 0) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
};

// GET: Lấy số lượt xem của product (public)
const getViewCount = async (req, res) => {
    const { productId } = req.params;

    const result = await getProductViewCount(productId);
    
    if (result.EC === 0) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
};

module.exports = {
    addToViewHistory,
    getViewHistory,
    clearHistory,
    removeFromHistory,
    getViewCount,
};
