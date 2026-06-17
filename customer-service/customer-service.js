const express = require('express');
const app = express();
app.use(express.json());
require('./dbconnect');

const BookModel  = require('./book-schema');
const OrderModel = require('./order-schema');

// GET /customer/books — browse all available books
app.get('/books', async (req, res) => {
    try {
        const books = await BookModel.find({ stock: { $gt: 0 } });
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /customer/cart/add — add a book to cart
app.post('/cart/add', async (req, res) => {
    try {
        const { bookId, quantity, customerEmail } = req.body;

        const book = await BookModel.findById(bookId);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        if (book.stock < quantity) return res.status(400).json({ message: 'Not enough stock' });

        // find existing cart or create a new one
        let cart = await OrderModel.findOne({ customerEmail, status: 'cart' });
        if (!cart) {
            cart = new OrderModel({ customerEmail, books: [], totalPrice: 0, status: 'cart' });
        }

        // check if book already in cart
        const existingItem = cart.books.find(b => b.bookId.toString() === bookId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.books.push({ bookId, title: book.title, quantity, price: book.price });
        }

        cart.totalPrice = cart.books.reduce((sum, b) => sum + b.price * b.quantity, 0);
        await cart.save();
        res.status(200).json({ message: 'Book added to cart', cart });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /customer/cart — view current cart
app.get('/cart', async (req, res) => {
    try {
        const { customerEmail } = req.query;
        const cart = await OrderModel.findOne({ customerEmail, status: 'cart' });
        if (!cart) return res.status(404).json({ message: 'Cart is empty' });
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /customer/cart/remove — remove a book from cart
app.delete('/cart/remove', async (req, res) => {
    try {
        const { bookId, customerEmail } = req.body;

        const cart = await OrderModel.findOne({ customerEmail, status: 'cart' });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.books = cart.books.filter(b => b.bookId.toString() !== bookId);
        cart.totalPrice = cart.books.reduce((sum, b) => sum + b.price * b.quantity, 0);
        await cart.save();
        res.status(200).json({ message: 'Book removed from cart', cart });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /customer/order/place — confirm cart into a real order
app.post('/order/place', async (req, res) => {
    try {
        const { customerEmail } = req.body;

        const cart = await OrderModel.findOne({ customerEmail, status: 'cart' });
        if (!cart || cart.books.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // reduce stock for each book
        for (const item of cart.books) {
            await BookModel.findByIdAndUpdate(
                item.bookId,
                { $inc: { stock: -item.quantity } }
            );
        }

        cart.status = 'confirmed';
        await cart.save();
        res.status(200).json({ message: 'Order placed successfully', order: cart });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /customer/orders — view all confirmed orders for this customer
app.get('/orders', async (req, res) => {
    try {
        const { customerEmail } = req.query;
        const orders = await OrderModel.find({ customerEmail, status: 'confirmed' });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(5003, () => console.log('Customer service running on port 5003'));