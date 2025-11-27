const Product = require('../models/product');

// Tìm kiếm và lọc sản phẩm với nhiều điều kiện
const searchAndFilterProducts = async (filters = {}) => {
    try {
        const {
            search = '',           // Text search (fuzzy)
            category = '',         // Lọc theo category
            minPrice = 0,          // Giá tối thiểu
            maxPrice = Infinity,   // Giá tối đa
            hasDiscount = false,   // Chỉ lấy sản phẩm có giảm giá
            minViews = 0,          // Lượt xem tối thiểu
            minRating = 0,         // Đánh giá tối thiểu
            sortBy = 'createdAt',  // Sắp xếp theo: createdAt, price, views, rating, discount
            sortOrder = 'desc',    // asc hoặc desc
            page = 1,              // Trang hiện tại
            limit = 12,            // Số sản phẩm mỗi trang
        } = filters;

        // Xây dựng query conditions
        const queryConditions = {
            isActive: true, // Chỉ lấy sản phẩm active
        };

        // Text search (fuzzy search với MongoDB text index)
        if (search && search.trim()) {
            queryConditions.$text = { 
                $search: search.trim(),
                $caseSensitive: false,
                $diacriticSensitive: false,
            };
        }

        // Lọc theo category (bỏ qua nếu là 'all')
        if (category && category !== 'all') {
            queryConditions.category = category;
        }

        // Lọc theo giá
        queryConditions.price = {
            $gte: Number(minPrice) || 0,
            $lte: Number(maxPrice) || Infinity,
        };

        // Lọc chỉ sản phẩm có giảm giá
        if (hasDiscount === 'true' || hasDiscount === true) {
            queryConditions.discount = { $gt: 0 };
        }

        // Lọc theo lượt xem
        if (minViews > 0) {
            queryConditions.views = { $gte: Number(minViews) };
        }

        // Lọc theo rating
        if (minRating > 0) {
            queryConditions.rating = { $gte: Number(minRating) };
        }

        // Xây dựng sort options
        const sortOptions = {};
        
        // Nếu có text search, sort theo text score trước
        if (search && search.trim()) {
            sortOptions.score = { $meta: 'textScore' };
        }
        
        // Thêm sort theo field được chọn
        const sortField = sortBy || 'createdAt';
        const order = sortOrder === 'asc' ? 1 : -1;
        sortOptions[sortField] = order;

        // Pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 12;
        const skip = (pageNum - 1) * limitNum;

        // Execute query
        const products = await Product
            .find(queryConditions)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);

        // Đếm tổng số sản phẩm match
        const total = await Product.countDocuments(queryConditions);

        return {
            EC: 0,
            DT: {
                products,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
                filters: {
                    search,
                    category,
                    minPrice,
                    maxPrice,
                    hasDiscount,
                    minViews,
                    minRating,
                    sortBy,
                    sortOrder,
                },
            },
        };
    } catch (error) {
        console.error('Error in searchAndFilterProducts:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi tìm kiếm sản phẩm',
        };
    }
};

// Lấy danh sách categories
const getCategories = async () => {
    try {
        const categories = await Product.distinct('category');
        return {
            EC: 0,
            DT: categories.sort(),
        };
    } catch (error) {
        console.error('Error in getCategories:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi lấy danh mục',
        };
    }
};

// Lấy chi tiết sản phẩm và tăng lượt xem
const getProductById = async (id) => {
    try {
        const product = await Product.findById(id);
        
        if (!product) {
            return {
                EC: 1,
                EM: 'Sản phẩm không tồn tại',
            };
        }

        // Tăng lượt xem
        await product.incrementViews();

        return {
            EC: 0,
            DT: product,
        };
    } catch (error) {
        console.error('Error in getProductById:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi lấy thông tin sản phẩm',
        };
    }
};

// Tạo sản phẩm mới
const createProduct = async (productData) => {
    try {
        const product = await Product.create(productData);
        return {
            EC: 0,
            DT: product,
            EM: 'Tạo sản phẩm thành công',
        };
    } catch (error) {
        console.error('Error in createProduct:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi tạo sản phẩm',
        };
    }
};

// Cập nhật sản phẩm
const updateProduct = async (id, productData) => {
    try {
        productData.updatedAt = Date.now();
        const product = await Product.findByIdAndUpdate(
            id,
            productData,
            { new: true, runValidators: true }
        );

        if (!product) {
            return {
                EC: 1,
                EM: 'Sản phẩm không tồn tại',
            };
        }

        return {
            EC: 0,
            DT: product,
            EM: 'Cập nhật sản phẩm thành công',
        };
    } catch (error) {
        console.error('Error in updateProduct:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi cập nhật sản phẩm',
        };
    }
};

// Xóa sản phẩm (soft delete)
const deleteProduct = async (id) => {
    try {
        const product = await Product.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return {
                EC: 1,
                EM: 'Sản phẩm không tồn tại',
            };
        }

        return {
            EC: 0,
            EM: 'Xóa sản phẩm thành công',
        };
    } catch (error) {
        console.error('Error in deleteProduct:', error);
        return {
            EC: -1,
            EM: 'Lỗi khi xóa sản phẩm',
        };
    }
};

module.exports = {
    searchAndFilterProducts,
    getCategories,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
