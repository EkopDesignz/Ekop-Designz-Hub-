// server.js

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // CORS support
app.use(morgan('dev')); // Logging
app.use(express.json()); // Body parsing

// PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.connect()
    .then(() => console.log('PostgreSQL connected'))
    .catch(err => console.error('Connection error', err.stack));

// JWT authentication middleware
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Define routes
app.use('/auth', authRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});