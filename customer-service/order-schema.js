const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    customerEmail: { type: String, required: true },
    books: [
        {
            bookId:   { type: mongoose.Schema.Types.ObjectId, ref: 'books' },
            title:    { type: String },
            quantity: { type: Number },
            price:    { type: Number }
        }
    ],
    totalPrice: { type: Number, required: true, default: 0 },
    status:     { type: String, default: 'cart' }
}, { timestamps: true });

module.exports = mongoose.model('orders', OrderSchema);