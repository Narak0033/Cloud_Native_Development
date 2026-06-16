const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ['customer', 'seller'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('users', UserSchema);
