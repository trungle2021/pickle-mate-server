const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: API quản lý phiên chơi (session)
 */

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Tạo phiên chơi mới
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startTime
 *               - endTime
 *               - location
 *               - numCourts
 *               - players
 *               - matchType
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-07-09T14:00:00Z"
 *                 description: Thời gian bắt đầu phiên chơi
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-07-09T17:00:00Z"
 *                 description: Thời gian kết thúc phiên chơi
 *               location:
 *                 type: string
 *                 example: "Sân số 5 - Nhà thi đấu Quận 7"
 *               numCourts:
 *                 type: integer
 *                 example: 3
 *                 description: Số sân chơi
 *               players:
 *                 type: array
 *                 description: Danh sách ID người chơi tham gia
 *                 items:
 *                   type: string
 *                   example: "6688a1b56c80a831b2e9f123"
 *               matchType:
 *                 type: string
 *                 enum: [round-robin, skill-based, random]
 *                 example: "round-robin"
 *               note:
 *                 type: string
 *                 example: "Phiên chơi giao lưu đầu tuần"
 *     responses:
 *       201:
 *         description: Tạo phiên chơi thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', sessionController.createSession);


/**
 * @swagger
 * /api/sessions/generate-round-robin:
 *   post:
 *     summary: Tạo trận đấu theo thể thức vòng tròn (Round Robin) - Không tạo phiên
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - players
 *               - numCourts
 *             properties:
 *               players:
 *                 type: array
 *                 description: Danh sách ID người chơi
 *                 items:
 *                   type: string
 *                   example: "6688a1b56c80a831b2e9f123"
 *               numCourts:
 *                 type: integer
 *                 example: 3
 *                 description: Số sân chơi cần tạo cặp đấu
 *           example:
 *             players:
 *               - "6688a1b56c80a831b2e9f123"
 *               - "6688a1b56c80a831b2e9f124"
 *               - "6688a1b56c80a831b2e9f125"
 *               - "6688a1b56c80a831b2e9f126"
 *             numCourts: 2
 *     responses:
 *       200:
 *         description: Đã tạo thành công các trận đấu vòng tròn
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 */
router.post('/generate-round-robin', sessionController.generateRoundRobinMatches);

/**
//  * @swagger
 * /api/sessions/generate-skill-based:
 *   post:
 *     summary: Tạo cặp đấu dựa trên kỹ năng người chơi
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - players
 *               - numCourts
 *             properties:
 *               players:
 *                 type: array
 *                 description: Danh sách ID người chơi
 *                 items:
 *                   type: string
 *                   example: "6688a1b56c80a831b2e9f123"
 *               numCourts:
 *                 type: integer
 *                 example: 3
 *                 description: Số sân chơi cần tạo cặp đấu
 *           example:
 *             players:
 *               - "6688a1b56c80a831b2e9f123"
 *               - "6688a1b56c80a831b2e9f124"
 *               - "6688a1b56c80a831b2e9f125"
 *               - "6688a1b56c80a831b2e9f126"
 *             numCourts: 2
 *     responses:
 *       200:
 *         description: Đã tạo thành công các cặp đấu dựa trên kỹ năng
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 */
// router.post('/generate-skill-based', sessionController.generateSkillBasedMatches);

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Lấy danh sách tất cả các phiên chơi
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/', sessionController.getAllSessions);

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết một phiên chơi
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID phiên chơi
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy phiên chơi
 */
router.get('/:id', sessionController.getSessionById);

/**
 * @swagger
 * /api/sessions/{id}:
 *   delete:
 *     summary: Xoá một phiên chơi
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID phiên chơi
 *     responses:
 *       200:
 *         description: Đã xoá thành công
 *       404:
 *         description: Không tìm thấy phiên chơi
 */
router.delete('/:id', sessionController.deleteSession);

module.exports = router;
