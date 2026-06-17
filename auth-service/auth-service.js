const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
app.use(express.json());

const UserModel = require('./user-schema');
require('./dbconnect');

const JWT_SECRET = process.env.JWT_SECRET;

// POST /auth/register
app.post('/register', async (req, res) => {
    try {
        const existing = await UserModel.findOne({ email: req.body.email });
        if (existing) return res.status(400).json({ message: 'Email already registered' });

        const user = new UserModel({
            name:     req.body.name,
            email:    req.body.email,
            password: req.body.password,
            role:     req.body.role
        });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /auth/login
app.post('/login', async (req, res) => {
    try {
        const user = await UserModel.findOne({
            email:    req.body.email,
            password: req.body.password,
            role:     req.body.role
        });
        if (!user) return res.status(400).json({ message: 'Invalid email, password, or role' });

        const token = jwt.sign(
            { email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(5001, () => console.log('Auth service running on port 5001'));