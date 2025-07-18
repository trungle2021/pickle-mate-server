const express = require('express');
const router = express.Router();
const SkillPointChangeLogController = require('../controllers/skillPointChangeLogController');
/**
 * @swagger
 * tags:
 *   name: SkillPointsChangeLog
 *   description: API theo dõi lịch sử thay đổi điểm kỹ năng người chơi
 */

/**
 * @swagger
 * /api/change-logs:
 *   get:
 *     summary: Lấy lịch sử thay đổi điểm kỹ năng
 *     tags: [SkillPointsChangeLog]
 *     parameters:
 *       - in: query
 *         name: playerId
 *         schema:
 *           type: string
 *         description: ID người chơi (lọc theo người chơi)
 *       - in: query
 *         name: matchId
 *         schema:
 *           type: string
 *         description: ID trận đấu (lọc theo trận đấu)
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: ID phiên chơi (lọc theo phiên)
 *     responses:
 *       200:
 *         description: Danh sách log thay đổi điểm
 *       400:
 *         description: Truy vấn không hợp lệ
 */
router.get('/', SkillPointChangeLogController.getChangeLog);

/**
 * @swagger
 * /api/change-logs/delete-all:
 *   delete:
 *     summary: Xoá toàn bộ log thay đổi điểm kỹ năng
 *     tags: [SkillPointsChangeLog]
 *     responses:
 *       200:
 *         description: Đã xoá toàn bộ log
 *       500:
 *         description: Lỗi khi xoá
 */
router.delete('/delete-all', SkillPointChangeLogController.deleteAllChangeLog);

module.exports = router;
