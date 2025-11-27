const {
    searchAndFilterProducts,
    getCategories: getCategoriesService,
    getProductById: getProductByIdService,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../services/productService');

// GET: Tìm kiếm và lọc sản phẩm với nhiều điều kiện
const searchProducts = async (req, res) => {
    const filters = {
        search: req.query.search || req.query.q,
        category: req.query.category,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        hasDiscount: req.query.hasDiscount,
        minViews: req.query.minViews,
        minRating: req.query.minRating,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        page: req.query.page,
        limit: req.query.limit,
    };

    const result = await searchAndFilterProducts(filters);
    
    if (result.EC === 0) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
};

// GET: Lấy danh sách categories
const getCategories = async (req, res) => {
    const result = await getCategoriesService();
    
    if (result.EC === 0) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
};

// GET: Lấy chi tiết sản phẩm theo ID (tự động tăng views)
const getProductById = async (req, res) => {
    const { id } = req.params;
    
    const result = await getProductByIdService(id);
    
    if (result.EC === 0) {
        return res.status(200).json(result);
    } else if (result.EC === 1) {
        return res.status(404).json(result);
    } else {
        return res.status(500).json(result);
    }
};

// POST: Tạo sản phẩm mới (Admin only)
const addProduct = async (req, res) => {
    const productData = req.body;
    
    const result = await createProduct(productData);
    
    if (result.EC === 0) {
        return res.status(201).json(result);
    } else {
        return res.status(500).json(result);
    }
};

// PUT: Cập nhật sản phẩm (Admin only)
const editProduct = async (req, res) => {
    const { id } = req.params;
    const productData = req.body;
    
    const result = await updateProduct(id, productData);
    
    if (result.EC === 0) {
        return res.status(200).json(result);
    } else if (result.EC === 1) {
        return res.status(404).json(result);
    } else {
        return res.status(500).json(result);
    }
};

// DELETE: Xóa sản phẩm (Admin only - soft delete)
const removeProduct = async (req, res) => {
    const { id } = req.params;
    
    const result = await deleteProduct(id);
    
    if (result.EC === 0) {
        return res.status(200).json(result);
    } else if (result.EC === 1) {
        return res.status(404).json(result);
    } else {
        return res.status(500).json(result);
    }
};

// Backward compatibility: alias cho searchProducts
const getProducts = searchProducts;

module.exports = {
    searchProducts,
    getProducts,
    getCategories,
    getProductById,
    addProduct,
    editProduct,
    removeProduct,
};
