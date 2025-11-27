const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100, // Giảm giá theo %
    },
    views: {
        type: Number,
        default: 0,
        min: 0,
    },
    stock: {
        type: Number,
        default: 0,
        min: 0,
    },
    image: {
        type: String,
        default: 'https://via.placeholder.com/300',
    },
    category: {
        type: String,
        required: true,
        index: true, // Index để filter nhanh
    },
    tags: [{
        type: String,
    }],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Tạo text index cho fuzzy search (name, description, tags)
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Index compound để tối ưu query
productSchema.index({ category: 1, price: 1 });
productSchema.index({ discount: -1 });
productSchema.index({ views: -1 });
productSchema.index({ createdAt: -1 });

// Virtual field: Giá sau giảm
productSchema.virtual('finalPrice').get(function() {
    return Math.round(this.price - (this.price * this.discount / 100));
});

// Để hiển thị virtual fields khi convert to JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Method: Tăng lượt xem
productSchema.methods.incrementViews = async function() {
    this.views += 1;
    await this.save();
};

const Product = mongoose.model('product', productSchema);

module.exports = Product;
