const mongoose = require('mongoose');

const hexColorValidator = function(val) {
    return /^#[0-9A-Fa-f]{6}$/.test(val);
};

const budgetSchema = new mongoose.Schema({
    title: { type: String, required: true },
    budget: { type: Number, required: true },
    color: { type: String, required: true, validate: [hexColorValidator, 'Color must be a 6-digit hex string like #A1B2C3'] }
});

module.exports = mongoose.model('Budget', budgetSchema, 'myMonthlyBudget');
