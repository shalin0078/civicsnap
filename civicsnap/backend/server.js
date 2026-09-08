const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check for Render Deployment
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'civicsnap-backend', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.json({ message: 'CivicSnap API is running', health: '/health' });
});

// Connect MongoDB (Optional if using Supabase or local development)
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('MongoDB Connected successfully'))
        .catch(err => console.log('MongoDB connection notice:', err.message));
} else {
    console.log('Notice: MONGO_URI not provided. Running in memory / Supabase client mode.');
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));

// Server Binding (0.0.0.0 for Render cloud hosting)
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`CivicSnap Backend running on http://${HOST}:${PORT}`);
});