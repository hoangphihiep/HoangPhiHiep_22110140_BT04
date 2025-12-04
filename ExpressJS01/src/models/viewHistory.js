const mongoose = require('mongoose');

const viewHistorySchema = new mongoose.Schema({
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
    viewedAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound unique index để đảm bảo một user chỉ có 1 bản ghi cho mỗi product
viewHistorySchema.index({ userId: 1, productId: 1 }, { unique: true });

// Compound index để query history của user, sort by viewedAt
viewHistorySchema.index({ userId: 1, viewedAt: -1 });

const ViewHistory = mongoose.model('viewHistory', viewHistorySchema);

module.exports = ViewHistory;
