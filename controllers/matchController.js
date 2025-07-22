const Match = require('../models/match');
const Session = require('../models/session');
const { updatePlayerPointsBasedOnHistory } = require('../services/match-service');
const ApiResponse = require('../utils/api-response');
const ApiError = require('../utils/api-error');
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
      return res.status(400).json(ApiResponse.error('Thiếu sessionId'));
    }
    if (!matchResult || matchResult.length == 0) {
      return res.status(400).json(ApiResponse.error('Thiếu matchResult hoặc matchResult rỗng'));
    }
    const result = await updatePlayerPointsBasedOnHistory(sessionId, matchResult);
    res.status(200).json(ApiResponse.success('Cập nhật điểm người chơi thành công', result));
  } catch (error) {
    if (error instanceof ApiError) {
      const response = ApiResponse.error(error.message);
      return res.status(error.statusCode).json(response);
    }
    const response = ApiResponse.error('Lỗi server');
    res.status(500).json(response);
  }
}

exports.deleteAllMatches = async (req, res) => {
  try {
    await Match.deleteMany({});
    await Session.updateMany({}, { $set: { matches: [] } });
    res.status(200).json(ApiResponse.success('Đã xoá tất cả các trận đấu'));
  } catch (error) {
    if (error instanceof ApiError) {
      const response = ApiResponse.error(error.message);
      return res.status(error.statusCode).json(response);
    }
    const response = ApiResponse.error('Lỗi server');
    res.status(500).json(response);
  }
};


