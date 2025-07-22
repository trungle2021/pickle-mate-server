const SkillPointChangeLog = require('../models/skillPointChangeLog');
const ApiResponse = require('../utils/api-response');
const ApiError = require('../utils/api-error');

exports.getChangeLog = async (req, res) => {
    try {
        const { playerId, matchId, sessionId } = req.query;

        const filter = {};
        if (playerId) filter.player = playerId;
        if (matchId) filter.match = matchId;
        if (sessionId) filter.session = sessionId;

        const logs = await SkillPointChangeLog.find(filter).lean();
        const data = { count: logs.length, logs }
        res.json(new ApiResponse(200, 'Lấy change logs thành công', data));
    } catch (error) {
        if (error instanceof ApiError) {
            const response = ApiResponse.error(error.statusCode, error.message);
            return res.status(error.statusCode).json(response);
        }
        const response = ApiResponse.error(500, 'Lỗi server', error.message);
        res.status(500).json(response);
    }
}

exports.deleteAllChangeLog = async (req, res) => {
    try {
        const result = await SkillPointChangeLog.deleteMany({});
        res.json(new ApiResponse(200, 'Tất cả change logs đã được xóa', { count: result.deletedCount }));
    } catch (error) {
        if (error instanceof ApiError) {
            const response = ApiResponse.error(error.statusCode, error.message);
            return res.status(error.statusCode).json(response);
        }
        const response = ApiResponse.error(500, 'Lỗi server', error.message);
        res.status(500).json(response);
    }
}