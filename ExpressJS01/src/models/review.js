const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true,
        index: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        maxlength: 1000,
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

// Index để query reviews của product
reviewSchema.index({ productId: 1, createdAt: -1 });

// Method để update timestamp khi edit
reviewSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Review = mongoose.model('review', reviewSchema);

module.exports = Review;
