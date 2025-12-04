const Favorite = require('../models/favorite');
const Product = require('../models/product');
const ViewHistory = require('../models/viewHistory');
const Review = require('../models/review');

// Helper: Thêm viewCount và avgRating cho products
const addStatsToProducts = async (products) => {
    const productIds = products.map(p => p._id);
    
    // Aggregate viewCount
    const viewCounts = await ViewHistory.aggregate([
        { $match: { productId: { $in: productIds } } },
        { $group: { _id: '$productId', count: { $sum: 1 } } }
    ]);
    
    // Aggregate avgRating và totalReviews
    const ratings = await Review.aggregate([
        { $match: { productId: { $in: productIds } } },
        { 
            $group: { 
                _id: '$productId', 
                avgRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            } 
        }
    ]);
    
    const viewCountMap = {};
    viewCounts.forEach(vc => {
        viewCountMap[vc._id.toString()] = vc.count;
    });
    
    const ratingMap = {};
    ratings.forEach(r => {
        ratingMap[r._id.toString()] = {
            avgRating: Math.round(r.avgRating * 10) / 10,
            totalReviews: r.totalReviews
        };
    });
    
    return products.map(product => {
        const productObj = product.toObject ? product.toObject() : product;
        productObj.viewCount = viewCountMap[productObj._id.toString()] || 0;
        const ratingData = ratingMap[productObj._id.toString()];
        productObj.avgRating = ratingData?.avgRating || 0;
        productObj.totalReviews = ratingData?.totalReviews || 0;
        return productObj;
    });
};

// Thêm sản phẩm vào danh sách yêu thích
const addFavorite = async (userId, productId) => {
    try {
        // Kiểm tra product có tồn tại không
        const product = await Product.findById(productId);
        if (!product) {
            return {
                EC: 1,
                EM: 'Sản phẩm không tồn tại',
            };
        }

        // Thêm vào favorites (unique index sẽ prevent duplicate)
        const favorite = await Favorite.create({ userId, productId });
        
        return {
            EC: 0,
            DT: favorite,
            EM: 'Đã thêm vào yêu thích',
        };
    } catch (error) {
        if (error.code === 11000) {
            return {
                EC: 1,
                EM: 'Sản phẩm đã có trong danh sách yêu thích',
            };
        }
        console.error('Error in addFavorite:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi thêm vào yêu thích',
        };
    }
};

// Xóa sản phẩm khỏi danh sách yêu thích
const removeFavorite = async (userId, productId) => {
    try {
        const result = await Favorite.findOneAndDelete({ userId, productId });
        
        if (!result) {
            return {
                EC: 1,
                EM: 'Sản phẩm không có trong danh sách yêu thích',
            };
        }

        return {
            EC: 0,
            EM: 'Đã xóa khỏi yêu thích',
        };
    } catch (error) {
        console.error('Error in removeFavorite:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi xóa khỏi yêu thích',
        };
    }
};

// Lấy danh sách sản phẩm yêu thích của user
const getUserFavorites = async (userId, page = 1, limit = 12) => {
    try {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 12;
        const skip = (pageNum - 1) * limitNum;

        const favorites = await Favorite
            .find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('productId');

        const total = await Favorite.countDocuments({ userId });

        // Filter out favorites với product đã bị xóa
        const validFavorites = favorites
            .filter(fav => fav.productId && fav.productId.isActive)
            .map(fav => fav.productId);

        // Thêm viewCount và avgRating
        const productsWithStats = await addStatsToProducts(validFavorites);

        return {
            EC: 0,
            DT: {
                products: productsWithStats,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            },
        };
    } catch (error) {
        console.error('Error in getUserFavorites:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi lấy danh sách yêu thích',
        };
    }
};

// Kiểm tra product có trong favorites của user không
const checkIsFavorite = async (userId, productId) => {
    try {
        const favorite = await Favorite.findOne({ userId, productId });
        return {
            EC: 0,
            DT: { isFavorite: !!favorite },
        };
    } catch (error) {
        console.error('Error in checkIsFavorite:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi kiểm tra yêu thích',
        };
    }
};

module.exports = {
    addFavorite,
    removeFavorite,
    getUserFavorites,
    checkIsFavorite,
};
