const express = require('express');
const router = express.Router();
const SkillPointChangeLogController = require('../controllers/skillPointChangeLogController');

/**
 * GET /api/change-logs
 * Truy vấn lịch sử thay đổi điểm
 * Hỗ trợ filter theo: playerId, matchId, sessionId
 */
router.get('/', SkillPointChangeLogController.getChangeLog);
router.delete('/delete-all', SkillPointChangeLogController.deleteAllChangeLog);

module.exports = router;
