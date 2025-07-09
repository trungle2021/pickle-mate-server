const Match = require('../models/match');
const Session = require('../models/session');
const { updatePlayerPointsBasedOnHistory } = require('../services/match-service');

/**
 * 
 * {
  "sessionId": "6688a1b56c80a831b2e9f123",
  "matchResult": [
    {
      "matchId": "6688b3f26c80a831b2e9f456",
      "result": {
        "team1Points": 11,
        "team2Points": 6
      }
    },
    {
      "matchId": "6688b4076c80a831b2e9f457",
      "result": {
        "team1Points": 9,
        "team2Points": 11
      }
    }
  ]
}

 */

exports.updatePlayerPointsBasedOnHistory = async (req, res) => {
    try {
        const { sessionId, matchResult } = req.body;
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }
        if (!matchResult || matchResult.length == 0) {
            return res.status(400).json({ error: 'Match result is required' });
        }
        const result = await updatePlayerPointsBasedOnHistory(sessionId, matchResult);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.deleteAllMatches = async (req, res) => {
    try {
        await Match.deleteMany({});
        await Session.updateMany({}, { $set: { matches: [] } });
        res.status(200).json({ message: 'All matches deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


