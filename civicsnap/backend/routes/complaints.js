const router = require('express').Router();
const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const dataStore = require('../dataStore');

// Create complaint
router.post('/', async (req, res) => {
    const complaintData = {
        title: req.body.title,
        category: req.body.category,
        description: req.body.description || '',
        location: req.body.location,
        latitude: req.body.latitude || null,
        longitude: req.body.longitude || null,
        priority: req.body.priority || 'Medium',
        status: req.body.status || 'Reported',
        photo_url: req.body.photo_url || '',
        author_name: req.body.author_name || 'Citizen',
        user_id: req.body.user_id || req.body.userId || null,
        is_guest: Boolean(req.body.is_guest),
        guest_name: req.body.guest_name || '',
        guest_contact: req.body.guest_contact || '',
        upvotes: typeof req.body.upvotes === 'number' ? req.body.upvotes : 1,
        resolution_notes: null,
        resolved_at: null,
        date: new Date(),
        created_at: new Date()
    };

    if (mongoose.connection.readyState === 1) {
        try {
            const complaint = new Complaint(complaintData);
            await complaint.save();
            return res.status(201).json(complaint);
        } catch (err) {
            console.warn('MongoDB save fallback to local dataStore:', err.message);
        }
    }

    const newRecord = {
        _id: 'c_' + Date.now(),
        id: 'c_' + Date.now(),
        ...complaintData
    };
    dataStore.addComplaint(newRecord);
    return res.status(201).json(newRecord);
});

// Get all complaints
router.get('/', async (req, res) => {
    if (mongoose.connection.readyState === 1) {
        try {
            const complaints = await Complaint.find().sort({ createdAt: -1, date: -1 }).maxTimeMS(2500);
            if (complaints && complaints.length > 0) {
                return res.json(complaints);
            }
        } catch (err) {
            console.warn('MongoDB query fallback to local dataStore:', err.message);
        }
    }

    return res.json(dataStore.getComplaints());
});

// Update complaint status & resolution notes (Authority action)
router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, resolution_notes } = req.body;
    const resolvedAt = status === 'Resolved' ? new Date() : null;

    if (mongoose.connection.readyState === 1) {
        try {
            const updated = await Complaint.findByIdAndUpdate(
                id,
                { 
                    status, 
                    resolution_notes, 
                    resolved_at: resolvedAt 
                },
                { new: true }
            );
            if (updated) return res.json(updated);
        } catch (err) {
            // Fallback to dataStore
        }
    }

    const updated = dataStore.updateComplaint(id, {
        status,
        resolution_notes,
        resolved_at: resolvedAt,
        updated_at: new Date()
    });

    if (updated) return res.json(updated);
    return res.status(404).json({ message: 'Complaint record not found' });
});

// Upvote complaint
router.patch('/:id/upvote', async (req, res) => {
    const { id } = req.params;
    const delta = typeof req.body.delta === 'number' ? req.body.delta : 1;

    if (mongoose.connection.readyState === 1) {
        try {
            const updated = await Complaint.findByIdAndUpdate(
                id,
                { $inc: { upvotes: delta } },
                { new: true }
            );
            if (updated) return res.json(updated);
        } catch (err) {
            // Fallback to dataStore
        }
    }

    const list = dataStore.getComplaints();
    const item = list.find(c => String(c._id) === String(id) || String(c.id) === String(id));
    if (item) {
        const current = item.upvotes || 1;
        const newCount = Math.max(1, current + delta);
        const updated = dataStore.updateComplaint(id, { upvotes: newCount });
        return res.json(updated);
    }

    return res.status(404).json({ message: 'Complaint not found' });
});

// Remove / clear spam photo (Admin / Authority action)
router.patch('/:id/photo', async (req, res) => {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
        try {
            const updated = await Complaint.findByIdAndUpdate(
                id,
                { photo_url: '', photo_removed: true },
                { new: true }
            );
            if (updated) return res.json(updated);
        } catch (err) {
            // Fallback to dataStore
        }
    }

    const updated = dataStore.removePhoto(id);
    if (updated) {
        return res.json(updated);
    }
    return res.status(404).json({ message: 'Complaint not found' });
});

router.delete('/:id/photo', async (req, res) => {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
        try {
            const updated = await Complaint.findByIdAndUpdate(
                id,
                { photo_url: '', photo_removed: true },
                { new: true }
            );
            if (updated) return res.json(updated);
        } catch (err) {
            // Fallback to dataStore
        }
    }

    const updated = dataStore.removePhoto(id);
    if (updated) {
        return res.json(updated);
    }
    return res.status(404).json({ message: 'Complaint not found' });
});

// Delete entire complaint record (Admin / Authority action)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
        try {
            const deleted = await Complaint.findByIdAndDelete(id);
            if (deleted) return res.json({ success: true, message: 'Complaint deleted', id });
        } catch (err) {
            // Fallback to dataStore
        }
    }

    const deleted = dataStore.deleteComplaint(id);
    if (deleted) {
        return res.json({ success: true, message: 'Complaint deleted', id });
    }
    return res.status(404).json({ message: 'Complaint not found' });
});

module.exports = router;