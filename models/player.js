const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gender: { type: String, enum: ['nam', 'nữ'], required: true },
    skillPoints: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);
