const {
    addFavorite,
    removeFavorite,
    getUserFavorites,
    checkIsFavorite,
} = require('../services/favoriteService');

// POST: Thêm vào yêu thích
const addToFavorites = async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
        return res.status(400).json({
            EC: 1,
            EM: 'productId là bắt buộc',
        });
    }

    const result = await addFavorite(userId, productId);
    
    if (result.EC === 0) {
        return res.status(200).json(result);
    } else {
        return res.status(400).json(result);
    }
};

// DELETE: Xóa khỏi yêu thích
const removeFromFavorites = async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;

    const result = await removeFavorite(userId, productId);
    
    if (result.EC === 0) {
        return res.status(200).json(result);
    } else {
        return res.status(400).json(result);
    }
};

// GET: Lấy danh sách yêu thích
const getFavorites = async (req, res) => {
    const userId = req.user.id;
    const { page, limit } = req.query;

    const result = await getUserFavorites(userId, page, limit);
    
    if (result.EC === 0) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
};

// GET: Kiểm tra product có trong favorites không
const checkFavorite = async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;

    const result = await checkIsFavorite(userId, productId);
    
    if (result.EC === 0) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
};

module.exports = {
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    checkFavorite,
};
