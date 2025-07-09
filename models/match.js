const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    team1: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player',
            required: true
        }
    ],
    team2: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player',
            required: true
        }
    ],
    court: {
        type: String,
        required: true
    },
    round: {
        type: Number,
        required: true
    }, 
    result: {
        team1Points: {
            type: Number,
            required: true,
            default: 0
        },
        team2Points: {
            type: Number,
            required: true,
            default: 0
        }
    },
    status: {
        type: String,
        enum: ['pending', 'finished'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Match', matchSchema);
