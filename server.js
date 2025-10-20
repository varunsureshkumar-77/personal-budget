const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');
require('dotenv').config();
const Budget = require('./models/Budget');

const mongoUri = process.env.MONGODB_URI;

async function connectMongoose() {
    if (!mongoUri) throw new Error('MONGODB_URI not configured in environment');
    await mongoose.connect(mongoUri, { dbName: 'financialdata' });
    console.log('Connected to MongoDB via mongoose');
}

// Utility to generate a random hex color
function randomHexColor() {
    const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    return `#${hex.toUpperCase()}`;
}

app.get('/budget', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            await connectMongoose();
        }

        let docs = await Budget.find().lean();

        // Ensure every doc has a valid color; if not, set one and persist
        const ops = [];
        docs = docs.map(doc => {
            const color = doc.color && /^#[0-9A-Fa-f]{6}$/.test(doc.color) ? doc.color : randomHexColor();
            if (color !== doc.color) ops.push(Budget.updateOne({ _id: doc._id }, { $set: { color } }));
            return { title: doc.title, budget: doc.budget, color };
        });

        if (ops.length) await Promise.all(ops);

        return res.json({ myBudget: docs });
    } catch (err) {
        console.error('Error fetching budget via mongoose:', err.message);
        return res.status(500).json({ error: 'failed to fetch budget' });
    }
});


app.post('/budget', async (req, res) => {
    const payload = req.body;
    if (!payload || !payload.title || payload.budget == null || !payload.color) {
        return res.status(400).json({ error: 'title, budget and color are required' });
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(payload.color)) {
        return res.status(400).json({ error: 'color must be a 6-digit hex string like #A1B2C3' });
    }

    try {
        if (mongoose.connection.readyState !== 1) await connectMongoose();
        const created = await Budget.create({ title: payload.title, budget: payload.budget, color: payload.color });
        return res.status(201).json({ message: 'Created', entry: { title: created.title, budget: created.budget, color: created.color } });
    } catch (err) {
        console.error('Failed to create budget entry:', err.message);
        return res.status(500).json({ error: 'failed to create entry' });
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try { await mongoose.disconnect(); } catch (_) {}
    process.exit();
});

app.listen(port, () => {
    console.log(`API served at http://localhost:${port}`);
});