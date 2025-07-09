const SkillPointChangeLog = require('../models/skillPointChangeLog');
exports.getChangeLog = async (req, res) => {
    try {
        const { playerId, matchId, sessionId } = req.query;

        const filter = {};
        if (playerId) filter.player = playerId;
        if (matchId) filter.match = matchId;
        if (sessionId) filter.session = sessionId;

        const logs = await SkillPointChangeLog.find(filter)
            .lean();

        res.json({ count: logs.length, logs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi truy vấn change logs' });
    }
}

exports.deleteAllChangeLog = async (req, res) => {
    try{
        const result = await SkillPointChangeLog.deleteMany({});
        res.json({ message: 'Tất cả change logs đã được xóa', count: result.deletedCount });
    }catch (err) {
        // Log the error to console for debugging
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi xóa change logs' });
    }
}