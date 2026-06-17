const express = require('express');
const app = express();

const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer();

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// ─── Service URLs ──────────────────────────────────────────────
const AUTH_SERVICE     = 'http://localhost:5001';
const SELLER_SERVICE   = 'http://localhost:5002';
const CUSTOMER_SERVICE = 'http://localhost:5003';

// ─── Middleware: verify JWT ────────────────────────────────────
function verifyToken(req, res, next) {
    const header = req.headers.authorization;
    const token  = header && header.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Please send token' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

// ─── Middleware: check role ────────────────────────────────────
function authorizeRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        next();
    };
}

// ─── Routes ───────────────────────────────────────────────────

// Public — no token needed
app.use('/auth', (req, res) => {
    proxy.web(req, res, { target: AUTH_SERVICE });
});

// Seller only
app.use('/seller', verifyToken, authorizeRole('seller'), (req, res) => {
    proxy.web(req, res, { target: SELLER_SERVICE });
});

// Customer only
app.use('/customer', verifyToken, authorizeRole('customer'), (req, res) => {
    proxy.web(req, res, { target: CUSTOMER_SERVICE });
});

// ─── Proxy error handler ───────────────────────────────────────
proxy.on('error', (err, req, res) => {
    res.status(502).json({ message: 'Service unavailable', error: err.message });
});

app.listen(4000, () => console.log('API Gateway running on port 4000'));