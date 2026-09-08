const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    title: String,
    category: String,
    description: String,
    location: String,
    userId: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);