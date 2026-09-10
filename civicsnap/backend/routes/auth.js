const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const dataStore = require('../dataStore');

// Register
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    if (mongoose.connection.readyState === 1) {
        try {
            const existing = await User.findOne({ email: cleanEmail }).maxTimeMS(2500);
            if (existing) {
                return res.status(400).json({ message: 'User already exists' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const assignedRole = cleanEmail === 'admin@civicsnap.com' ? 'authority' : 'citizen';
            const user = new User({ 
                username: username || 'Citizen', 
                email: cleanEmail, 
                password: hashedPassword,
                role: assignedRole
            });
            await user.save();
            return res.status(201).json({ message: 'User registered successfully', userId: user._id });
        } catch (error) {
            console.warn('MongoDB register fallback to local dataStore:', error.message);
        }
    }

    // Fallback store
    const users = dataStore.getUsers();
    const exists = users.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const assignedRole = cleanEmail === 'admin@civicsnap.com' ? 'authority' : 'citizen';
    const newUser = {
        _id: 'user_' + Date.now(),
        id: 'user_' + Date.now(),
        username: username || 'Citizen',
        email: cleanEmail,
        password: password,
        role: assignedRole,
        created_at: new Date()
    };
    dataStore.addUser(newUser);
    return res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Check dataStore users (includes demo accounts & newly registered users)
    const localUser = dataStore.getUsers().find(u => u.email.toLowerCase() === cleanEmail);
    if (localUser && localUser.password === password) {
        const role = cleanEmail === 'admin@civicsnap.com' ? 'authority' : 'citizen';
        return res.json({ 
            message: 'Login success', 
            userId: localUser._id || localUser.id, 
            username: localUser.username,
            role: role
        });
    }

    // 2. Try MongoDB if connected
    if (mongoose.connection.readyState === 1) {
        try {
            const user = await User.findOne({ email: cleanEmail }).maxTimeMS(2500);
            if (user) {
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    const role = cleanEmail === 'admin@civicsnap.com' ? 'authority' : 'citizen';
                    return res.json({ 
                        message: 'Login success', 
                        userId: user._id, 
                        username: user.username,
                        role: role
                    });
                }
            }
        } catch (error) {
            // Handled below
        }
    }

    return res.status(400).json({ 
        message: 'Invalid credentials. Please verify your email and password.' 
    });
});

module.exports = router;