const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(express.json());

// Database Connection
const db = new sqlite3.Database(':memory:'); // Using an in-memory database for demonstration.

// Create Tables and Insert Dummy Data
db.serialize(() => {
    // Create tables
    db.run(`
        CREATE TABLE technicians (
            technician_id INTEGER PRIMARY KEY,
            name TEXT,
            photo TEXT,
            specialization TEXT,
            rating REAL,
            description TEXT,
            location TEXT
        )
    `);

    db.run(`
        CREATE TABLE appliance_types (
            type_id INTEGER PRIMARY KEY,
            type_name TEXT
        )
    `);

    db.run(`
        CREATE TABLE users (
            user_id INTEGER PRIMARY KEY,
            email TEXT,
            password TEXT
        )
    `);

    // Insert dummy data for technicians
    const technicians = [
        ['Alice Johnson', '/images/alice.jpg', 'Refrigerator Repair', 4.5, 'Experienced in all types of refrigerator repairs.', 'New York'],
        ['Bob Smith', '/images/bob.jpg', 'Washing Machine Repair', 4.8, 'Specialist in washing machine diagnostics and repair.', 'Los Angeles'],
        ['Charlie Brown', '/images/charlie.jpg', 'Microwave Repair', 4.0, 'Quick and reliable microwave services.', 'Chicago'],
    ];

    technicians.forEach(tech => {
        db.run(`
            INSERT INTO technicians (name, photo, specialization, rating, description, location)
            VALUES (?, ?, ?, ?, ?, ?)
        `, tech);
    });

    // Insert dummy data for appliance types
    const appliances = ['Refrigerator', 'Washing Machine', 'Microwave', 'Dishwasher', 'Air Conditioner'];
    appliances.forEach(type => {
        db.run(`
            INSERT INTO appliance_types (type_name)
            VALUES (?)
        `, [type]);
    });

    // Insert 15 dummy users
    const users = [
        ['john.doe@example.com', 'Password@123'],
        ['jane.doe@example.com', 'securepass'],
        ['mark.smith@example.com', 'mypass123'],
        ['lisa.brown@example.com', 'mypassword'],
        ['emma.johnson@example.com', 'testpass'],
        ['oliver.jones@example.com', 'admin123'],
        ['noah.garcia@example.com', 'guestpass'],
        ['ava.martin@example.com', 'passkey'],
        ['liam.moore@example.com', 'password456'],
        ['sophia.taylor@example.com', 'letmein123'],
        ['mason.anderson@example.com', 'myp@ssword'],
        ['mia.white@example.com', 'welcome123'],
        ['logan.martinez@example.com', 'qwerty123'],
        ['isabella.rodriguez@example.com', 'access123'],
        ['lucas.thompson@example.com', 'pass1234'],
    ];

    users.forEach(([email, password]) => {
        const hashedPassword = bcrypt.hashSync(password, 10);
        db.run(`
            INSERT INTO users (email, password)
            VALUES (?, ?)
        `, [email, hashedPassword]);
    });
});

// API Endpoints

// Get all locations (dummy data)
app.get('/locations', (req, res) => {
    const query = 'SELECT DISTINCT location FROM technicians';
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching locations' });
        } else {
            res.json(rows.map(row => row.location));
        }
    });
});

// Get appliance suggestions (dummy data)
app.get('/appliances', (req, res) => {
    const { query } = req.query;
    const sql = `
        SELECT type_name FROM appliance_types
        WHERE type_name LIKE ?
    `;
    db.all(sql, [`%${query}%`], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching appliances' });
        } else {
            res.json(rows.map(row => row.type_name));
        }
    });
});

// Get featured technicians (dummy data)
app.get('/featured-technicians', (req, res) => {
    const query = `
        SELECT name, photo, specialization, rating, description, location
        FROM technicians
        WHERE rating >= 4.0
        LIMIT 10
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching technicians' });
        } else {
            res.json(rows);
        }
    });
});

// User login (dummy data)
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    const sql = `
        SELECT user_id, password FROM users
        WHERE email = ?
    `;

    db.get(sql, [email], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error during login' });
        } else if (row && bcrypt.compareSync(password, row.password)) {
            res.json({ success: true, message: 'Login successful', token: 'dummy-token' });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

// User registration (dummy data)
app.post('/register', (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = `
        INSERT INTO users (email, password)
        VALUES (?, ?)
    `;

    db.run(sql, [email, hashedPassword], (err) => {
        if (err) {
            res.status(500).json({ error: 'Error during registration' });
        } else {
            res.json({ success: true, message: 'Registration successful' });
        }
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});