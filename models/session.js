const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    players: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player',
            required: true
        }
    ],
    matches: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Match'
        }
    ],
    location: {
        type: String
    },
    matchType: {
        type: String,
        enum: ['round-robin', 'skill-based'],
        required: true
    },
    numCourts: {
        type: Number,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    note: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);
