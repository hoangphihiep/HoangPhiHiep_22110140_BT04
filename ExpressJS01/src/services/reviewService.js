const Review = require('../models/review');
const Product = require('../models/product');
const mongoose = require('mongoose');

// Tạo review mới
const createReview = async (userId, productId, rating, comment) => {
    try {
        console.log('📝 Creating review:', { userId, productId, rating, comment });
        
        // Kiểm tra product có tồn tại không
        const product = await Product.findById(productId);
        if (!product) {
            console.log('❌ Product not found:', productId);
            return {
                EC: 1,
                EM: 'Sản phẩm không tồn tại',
            };
        }

        const review = await Review.create({
            userId,
            productId,
            rating: Number(rating),
            comment,
        });

        console.log('✅ Review created:', review._id);

        // Populate user info
        await review.populate('userId', 'name email');

        // Cập nhật rating trung bình của product
        await updateProductRating(productId);

        console.log('✅ Review service completed successfully');

        return {
            EC: 0,
            DT: review,
            EM: 'Đánh giá thành công',
        };
    } catch (error) {
        console.error('❌ Error in createReview:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi tạo đánh giá',
        };
    }
};

// Cập nhật review
const updateReview = async (reviewId, userId, rating, comment) => {
    try {
        const review = await Review.findOne({ _id: reviewId, userId });
        
        if (!review) {
            return {
                EC: 1,
                EM: 'Không tìm thấy đánh giá hoặc bạn không có quyền chỉnh sửa',
            };
        }

        review.rating = Number(rating);
        review.comment = comment;
        await review.save();

        await review.populate('userId', 'name email');

        // Cập nhật rating trung bình của product
        await updateProductRating(review.productId);

        return {
            EC: 0,
            DT: review,
            EM: 'Cập nhật đánh giá thành công',
        };
    } catch (error) {
        console.error('Error in updateReview:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi cập nhật đánh giá',
        };
    }
};

// Xóa review
const deleteReview = async (reviewId, userId) => {
    try {
        const review = await Review.findOne({ _id: reviewId, userId });
        
        if (!review) {
            return {
                EC: 1,
                EM: 'Không tìm thấy đánh giá hoặc bạn không có quyền xóa',
            };
        }

        const productId = review.productId;
        await Review.findByIdAndDelete(reviewId);

        // Cập nhật rating trung bình của product
        await updateProductRating(productId);

        return {
            EC: 0,
            EM: 'Xóa đánh giá thành công',
        };
    } catch (error) {
        console.error('Error in deleteReview:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi xóa đánh giá',
        };
    }
};

// Lấy reviews của product
const getProductReviews = async (productId, page = 1, limit = 10) => {
    try {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        console.log('📖 Getting reviews for product:', productId, { page: pageNum, limit: limitNum });

        const reviews = await Review
            .find({ productId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('userId', 'name email');

        const total = await Review.countDocuments({ productId });

        console.log('📖 Found reviews:', reviews.length, 'Total:', total);

        return {
            EC: 0,
            DT: {
                reviews,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            },
        };
    } catch (error) {
        console.error('Error in getProductReviews:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi lấy danh sách đánh giá',
        };
    }
};

// Lấy thống kê reviews của product
const getProductReviewStats = async (productId) => {
    try {
        console.log('📊 Getting review stats for product:', productId);
        
        // Convert to ObjectId if string
        const productObjectId = mongoose.Types.ObjectId.isValid(productId) 
            ? new mongoose.Types.ObjectId(productId) 
            : productId;

        const totalReviews = await Review.countDocuments({ productId: productObjectId });
        
        console.log('📊 Total reviews count:', totalReviews);
        
        const stats = await Review.aggregate([
            { $match: { productId: productObjectId } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    ratingDistribution: {
                        $push: '$rating'
                    }
                }
            }
        ]);

        console.log('📊 Aggregation result:', stats);

        if (stats.length === 0) {
            return {
                EC: 0,
                DT: {
                    totalReviews: 0,
                    avgRating: 0,
                    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                }
            };
        }

        // Tính distribution
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        stats[0].ratingDistribution.forEach(rating => {
            distribution[rating] = (distribution[rating] || 0) + 1;
        });

        return {
            EC: 0,
            DT: {
                totalReviews,
                avgRating: Math.round(stats[0].avgRating * 10) / 10,
                ratingDistribution: distribution,
            },
        };
    } catch (error) {
        console.error('Error in getProductReviewStats:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi lấy thống kê đánh giá',
        };
    }
};

// Helper: Cập nhật rating trung bình của product
const updateProductRating = async (productId) => {
    try {
        const stats = await Review.aggregate([
            { $match: { productId: productId } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' }
                }
            }
        ]);

        const avgRating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
        
        await Product.findByIdAndUpdate(productId, { rating: avgRating });
    } catch (error) {
        console.error('Error in updateProductRating:', error);
    }
};

module.exports = {
    createReview,
    updateReview,
    deleteReview,
    getProductReviews,
    getProductReviewStats,
};
