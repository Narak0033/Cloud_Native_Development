const mongoose = require('mongoose');

const BookSchema = mongoose.Schema({
    title:       { type: String, required: true },
    author:      { type: String, required: true },
    price:       { type: Number, required: true },
    stock:       { type: Number, required: true, default: 0 },
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('books', BookSchema);