const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log('Customer service connected to MongoDB Atlas');
    } catch (err) {
        console.error(err);
    }
}

run();
module.exports = mongoose;