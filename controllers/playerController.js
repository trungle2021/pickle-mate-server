const Player = require('../models/player');

// GET /api/players
exports.getAllPlayers = async (req, res) => {
    try {
        const players = await Player.find();
        res.json(players);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

// GET /api/players/:id
exports.getPlayerById = async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if (!player) return res.status(404).json({ message: 'Không tìm thấy người chơi' });
        res.json(player);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

// POST /api/players
exports.createPlayer = async (req, res) => {
    try {
        const { name, gender, skillLevel } = req.body;

        if (!name || !gender || !skillLevel) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        const newPlayer = new Player({ name, gender, skillLevel });
        const savedPlayer = await newPlayer.save();
        res.status(201).json(savedPlayer);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo người chơi', error });
    }
};

// PUT /api/players/reset-points
exports.resetAllPlayersPoints = async (req, res) => {
    try {
        const updatedPlayers = await Player.updateMany({}, { skillPoints: 1.0 });
        res.json({ message: 'Đã reset điểm của tất cả người chơi về 1.0', updatedCount: updatedPlayers.nModified });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi reset điểm', error });
    }
}

// PUT /api/players/:id
exports.updatePlayer = async (req, res) => {
    try {
        const updatedPlayer = await Player.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // Trả về player mới sau khi cập nhật
        );
        if (!updatedPlayer) return res.status(404).json({ message: 'Không tìm thấy người chơi' });
        res.json(updatedPlayer);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật', error });
    }
};

// DELETE /api/players/:id
exports.deletePlayer = async (req, res) => {
    try {
        const deleted = await Player.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Không tìm thấy người chơi' });
        res.json({ message: 'Đã xoá người chơi' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xoá', error });
    }
};
