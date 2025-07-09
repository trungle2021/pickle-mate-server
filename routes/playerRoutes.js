const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// GET: Lấy danh sách tất cả người chơi
router.get('/', playerController.getAllPlayers);

// POST: Tạo người chơi mới
router.post('/', playerController.createPlayer);

// GET: Lấy thông tin 1 người chơi theo id
router.get('/:id', playerController.getPlayerById);

// PUT: Reset điểm của tất cả người chơi về 1.0
router.put('/reset-points', playerController.resetAllPlayersPoints);

// PUT: Cập nhật thông tin người chơi
router.put('/:id', playerController.updatePlayer);


// DELETE: Xoá người chơi
router.delete('/:id', playerController.deletePlayer);

module.exports = router;
