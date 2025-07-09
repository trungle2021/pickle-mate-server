const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

/**
 * @swagger
 * tags:
 *   name: Players
 *   description: API quản lý người chơi
 */

/**
 * @swagger
 * /api/players:
 *   get:
 *     summary: Lấy danh sách tất cả người chơi
 *     tags: [Players]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/', playerController.getAllPlayers);

/**
 * @swagger
 * /api/players:
 *   post:
 *     summary: Tạo người chơi mới
 *     tags: [Players]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               skillPoints:
 *                  type: number
 *                  default: 1.0
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post('/', playerController.createPlayer);

/**
 * @swagger
 * /api/players/{id}:
 *   get:
 *     summary: Lấy thông tin một người chơi theo ID
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người chơi
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy
 */
router.get('/:id', playerController.getPlayerById);

/**
 * @swagger
 * /api/players/reset-points:
 *   put:
 *     summary: Reset điểm tất cả người chơi về 1.0
 *     tags: [Players]
 *     responses:
 *       200:
 *         description: Đã reset thành công
 */
router.put('/reset-points', playerController.resetAllPlayersPoints);

/**
 * @swagger
 * /api/players/{id}:
 *   put:
 *     summary: Cập nhật thông tin người chơi
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người chơi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               gender:
 *                 type: string
 *               skillPoints:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id', playerController.updatePlayer);


/**
 * @swagger
 * /api/players/{id}:
 *   delete:
 *     summary: Xoá người chơi theo ID
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người chơi
 *     responses:
 *       200:
 *         description: Đã xoá thành công
 */
router.delete('/:id', playerController.deletePlayer);

module.exports = router;
