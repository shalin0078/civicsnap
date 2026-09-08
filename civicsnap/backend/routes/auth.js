const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// In-memory fallback/demo accounts for development & testing
const demoUsers = [
    {
        _id: 'demo-admin-id',
        username: 'Admin',
        email: 'admin@civicsnap.com',
        password: 'admin123'
    },
    {
        _id: 'demo-user-id',
        username: 'Citizen',
        email: 'user@civicsnap.com',
        password: 'password123'
    }
];

// Register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (mongoose.connection.readyState !== 1) {
        const exists = demoUsers.some(u => u.email === email);
        if (exists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        demoUsers.push({
            _id: 'user_' + Date.now(),
            username: username || 'Citizen',
            email,
            password
        });
        return res.status(201).json({ message: 'User registered successfully' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        return res.status(201).json({ message: 'User registered' });
    } catch (error) {
        // Fallback in-memory registration when MongoDB is offline
        const exists = demoUsers.some(u => u.email === email);
        if (exists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        demoUsers.push({
            _id: 'user_' + Date.now(),
            username: username || 'Citizen',
            email,
            password
        });
        return res.status(201).json({ message: 'User registered successfully' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Check predefined / in-memory demo accounts first
    const demo = demoUsers.find(u => u.email.toLowerCase() === (email || '').trim().toLowerCase());
    if (demo && demo.password === password) {
        return res.json({ message: 'Login success', userId: demo._id, username: demo.username });
    }

    try {
        const user = await User.findOne({ email }).maxTimeMS(2500);
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Wrong password' });

        return res.json({ message: 'Login success', userId: user._id });
    } catch (error) {
        if (demo && demo.password !== password) {
            return res.status(400).json({ message: 'Invalid credentials. Please verify your email and password.' });
        }
        return res.status(400).json({ 
            message: 'Invalid credentials. Please verify your email and password.' 
        });
    }
});

module.exports = router;