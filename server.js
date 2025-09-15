// Budget API

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

const fs = require('fs');
const budgetData = fs.readFileSync('budget-data.json', 'utf8');
const budget = JSON.parse(budgetData);

app.get('/budget', (req, res) => {
    res.json(budget);
});

app.listen(port, () => {
    console.log(`API served at http://localhost:${port}`);
});