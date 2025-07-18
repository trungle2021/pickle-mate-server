const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: API quản lý trận đấu
 */

/**
 * @swagger
 * /api/matches/update-points:
 *   put:
 *     summary: Cập nhật điểm người chơi dựa trên kết quả trận đấu
 *     tags: [Matches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - matchResult
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: ID của phiên chơi (session)
 *               matchResult:
 *                 type: array
 *                 description: Danh sách kết quả các trận đấu
 *                 items:
 *                   type: object
 *                   required:
 *                     - matchId
 *                     - result
 *                   properties:
 *                     matchId:
 *                       type: string
 *                       description: ID của trận đấu
 *                     result:
 *                       type: object
 *                       required:
 *                         - team1Points
 *                         - team2Points
 *                       properties:
 *                         team1Points:
 *                           type: integer
 *                         team2Points:
 *                           type: integer
 *           example:
 *             sessionId: "6688a1b56c80a831b2e9f123"
 *             matchResult:
 *               - matchId: "6688b3f26c80a831b2e9f456"
 *                 result:
 *                   team1Points: 11
 *                   team2Points: 6
 *               - matchId: "6688b4076c80a831b2e9f457"
 *                 result:
 *                   team1Points: 9
 *                   team2Points: 11
 *     responses:
 *       200:
 *         description: Cập nhật điểm thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.put('/update-points', matchController.updatePlayerPointsBasedOnHistory);

/**
 * @swagger
 * /api/matches:
 *   delete:
 *     summary: Xoá toàn bộ dữ liệu trận đấu
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: Đã xoá thành công
 */
router.delete('/', matchController.deleteAllMatches);


module.exports = router;
