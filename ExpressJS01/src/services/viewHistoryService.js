const ViewHistory = require('../models/viewHistory');
const Product = require('../models/product');
const Review = require('../models/review');
const mongoose = require('mongoose');

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
        const productObj = typeof product.toObject === 'function' ? product.toObject() : product;
        productObj.viewCount = viewCountMap[productObj._id.toString()] || 0;
        const ratingData = ratingMap[productObj._id.toString()];
        productObj.avgRating = ratingData?.avgRating || 0;
        productObj.totalReviews = ratingData?.totalReviews || 0;
        return productObj;
    });
};

// Thêm vào lịch sử xem
const addViewHistory = async (userId, productId) => {
    try {
        // Kiểm tra product có tồn tại không
        const product = await Product.findById(productId);
        if (!product) {
            return {
                EC: 1,
                EM: 'Sản phẩm không tồn tại',
            };
        }

        // Sử dụng findOneAndUpdate với upsert để tránh duplicate
        const viewHistory = await ViewHistory.findOneAndUpdate(
            { userId, productId },
            { 
                userId, 
                productId, 
                viewedAt: new Date() 
            },
            { 
                upsert: true, // Tạo mới nếu chưa tồn tại
                new: true,    // Trả về document sau khi update
                setDefaultsOnInsert: true
            }
        );

        return {
            EC: 0,
            DT: viewHistory,
        };
    } catch (error) {
        console.error('Error in addViewHistory:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi lưu lịch sử xem',
        };
    }
};

// Lấy lịch sử xem của user
const getUserViewHistory = async (userId, page = 1, limit = 12) => {
    try {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 12;
        const skip = (pageNum - 1) * limitNum;

        const history = await ViewHistory
            .find({ userId })
            .sort({ viewedAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('productId');

        const total = await ViewHistory.countDocuments({ userId });

        // Filter out history với product đã bị xóa
        const validHistory = history
            .filter(h => h.productId && h.productId.isActive)
            .map(h => ({
                ...h.productId.toObject(),
                viewedAt: h.viewedAt,
            }));

        // Thêm viewCount và avgRating
        const productsWithStats = await addStatsToProducts(validHistory);

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
        console.error('Error in getUserViewHistory:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi lấy lịch sử xem',
        };
    }
};

// Xóa toàn bộ lịch sử xem của user
const clearViewHistory = async (userId) => {
    try {
        await ViewHistory.deleteMany({ userId });
        return {
            EC: 0,
            EM: 'Đã xóa toàn bộ lịch sử xem',
        };
    } catch (error) {
        console.error('Error in clearViewHistory:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi xóa lịch sử xem',
        };
    }
};

// Xóa 1 item khỏi lịch sử xem
const removeFromViewHistory = async (userId, productId) => {
    try {
        await ViewHistory.deleteOne({ userId, productId });
        return {
            EC: 0,
            EM: 'Đã xóa khỏi lịch sử xem',
        };
    } catch (error) {
        console.error('Error in removeFromViewHistory:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi xóa khỏi lịch sử xem',
        };
    }
};

// Đếm số lượt xem của product
const getProductViewCount = async (productId) => {
    try {
        const count = await ViewHistory.countDocuments({ productId });
        return {
            EC: 0,
            DT: { viewCount: count },
        };
    } catch (error) {
        console.error('Error in getProductViewCount:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi lấy số lượt xem',
        };
    }
};

module.exports = {
    addViewHistory,
    getUserViewHistory,
    clearViewHistory,
    removeFromViewHistory,
    getProductViewCount,
};
