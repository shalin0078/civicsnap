const router = require('express').Router();
const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');

// In-memory store fallback for development and offline testing
let inMemoryComplaints = [
    {
        _id: 'c1',
        title: 'Overflowing Garbage Bin',
        category: 'Garbage & Waste Dumps',
        description: 'The garbage bin near the central park entrance has been overflowing for 3 days.',
        location: 'Central Park East Gate',
        priority: 'High',
        status: 'Reported',
        author: 'John Citizen',
        date: new Date(Date.now() - 3600000 * 18)
    },
    {
        _id: 'c2',
        title: 'Deep Pothole on Arterial Road',
        category: 'Potholes',
        description: 'Deep road pothole causing dangerous vehicle swerves.',
        location: 'Green Avenue cross section',
        priority: 'Emergency',
        status: 'In Progress',
        author: 'Commuter Daily',
        date: new Date(Date.now() - 3600000 * 36)
    }
];

// Create complaint
router.post('/', async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        const newRecord = {
            _id: 'c_' + Date.now(),
            ...req.body,
            status: req.body.status || 'Reported',
            date: new Date()
        };
        inMemoryComplaints.unshift(newRecord);
        return res.status(201).json(newRecord);
    }

    try {
        const complaint = new Complaint(req.body);
        await complaint.save();
        return res.status(201).json(complaint);
    } catch (err) {
        const newRecord = {
            _id: 'c_' + Date.now(),
            ...req.body,
            status: req.body.status || 'Reported',
            date: new Date()
        };
        inMemoryComplaints.unshift(newRecord);
        return res.status(201).json(newRecord);
    }
});

// Get all complaints
router.get('/', async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.json(inMemoryComplaints);
    }

    try {
        const complaints = await Complaint.find().sort({ date: -1 }).maxTimeMS(2500);
        return res.json(complaints);
    } catch (err) {
        return res.json(inMemoryComplaints);
    }
});

// Update complaint status & resolution notes (Authority action)
router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, resolution_notes } = req.body;

    if (mongoose.connection.readyState !== 1) {
        const item = inMemoryComplaints.find(c => String(c._id) === id || String(c.id) === id);
        if (item) {
            item.status = status;
            item.resolution_notes = resolution_notes;
            if (status === 'Resolved') item.resolved_at = new Date();
            return res.json(item);
        }
        return res.status(404).json({ message: 'Complaint record not found' });
    }

    try {
        const updated = await Complaint.findByIdAndUpdate(
            id,
            { 
                status, 
                resolution_notes, 
                resolved_at: status === 'Resolved' ? new Date() : null 
            },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Complaint not found' });
        return res.json(updated);
    } catch (err) {
        const item = inMemoryComplaints.find(c => String(c._id) === id || String(c.id) === id);
        if (item) {
            item.status = status;
            item.resolution_notes = resolution_notes;
            if (status === 'Resolved') item.resolved_at = new Date();
            return res.json(item);
        }
        return res.status(404).json({ message: 'Complaint record not found' });
    }
});

module.exports = router;