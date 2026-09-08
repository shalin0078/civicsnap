const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    location: { type: String, required: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    priority: { type: String, default: 'Medium' },
    status: { type: String, default: 'Reported' },
    photo_url: { type: String, default: '' },
    author_name: { type: String, default: 'Citizen' },
    user_id: { type: String, default: null },
    is_guest: { type: Boolean, default: false },
    guest_name: { type: String, default: '' },
    guest_contact: { type: String, default: '' },
    upvotes: { type: Number, default: 1 },
    resolution_notes: { type: String, default: null },
    resolved_at: { type: Date, default: null },
    date: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now }
}, {
    timestamps: true,
    strict: false
});

module.exports = mongoose.model('Complaint', ComplaintSchema);