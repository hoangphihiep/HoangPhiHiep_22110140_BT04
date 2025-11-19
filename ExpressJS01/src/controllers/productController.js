const Product = require('../models/product');
const Category = require('../models/category');

// Get all categories
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.status(200).json({
            EC: 0,
            EM: "Lấy danh mục thành công",
            DT: categories
        });
    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({
            EC: 1,
            EM: "Lỗi server",
            DT: null
        });
    }
};

const getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        let query = {};
        if (category && category !== 'all') {
            query.category = category;
        }

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate('category')
            .limit(limitNum)
            .skip(skip)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            EC: 0,
            EM: "Lấy sản phẩm thành công",
            DT: {
                products,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });
    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({
            EC: 1,
            EM: "Lỗi server",
            DT: null
        });
    }
};

// Get product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id).populate('category');
        
        if (!product) {
            return res.status(404).json({
                EC: 1,
                EM: "Sản phẩm không tìm thấy",
                DT: null
            });
        }

        return res.status(200).json({
            EC: 0,
            EM: "Lấy sản phẩm thành công",
            DT: product
        });
    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({
            EC: 1,
            EM: "Lỗi server",
            DT: null
        });
    }
};

module.exports = {
    getCategories,
    getProducts,
    getProductById
};
