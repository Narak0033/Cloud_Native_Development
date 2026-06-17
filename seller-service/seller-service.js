const express = require('express');
const app = express();
app.use(express.json());
require('./dbconnect');

const BookModel  = require('./book-schema');
const OrderModel = require('./order-schema');

// POST /seller/books — add a new book
app.post('/books', async (req, res) => {
    try {
        const book = new BookModel({
            title:       req.body.title,
            author:      req.body.author,
            price:       req.body.price,
            stock:       req.body.stock,
            description: req.body.description
        });
        await book.save();
        res.status(201).json({ message: 'Book added successfully', book });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /seller/books — view all books
app.get('/books', async (req, res) => {
    try {
        const books = await BookModel.find();
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /seller/books/:id — update book info or stock
app.put('/books/:id', async (req, res) => {
    try {
        const updated = await BookModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Book not found' });
        res.status(200).json({ message: 'Book updated successfully', book: updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /seller/books/:id — remove a book
app.delete('/books/:id', async (req, res) => {
    try {
        const deleted = await BookModel.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Book not found' });
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /seller/orders — view all customer orders
app.get('/orders', async (req, res) => {
    try {
        const orders = await OrderModel.find();
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(5002, () => console.log('Seller service running on port 5002'));