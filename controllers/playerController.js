const Player = require('../models/player');
const ApiResponse = require('../utils/api-response');
const ApiError = require('../utils/api-error');

// GET /api/players
exports.getAllPlayers = async (req, res) => {
    try {
        const players = await Player.find();
        const respone = ApiResponse.success('Lấy danh sách người chơi thành công', players);
        res.json(respone);
    } catch (error) {
        if (error instanceof ApiError) {
            const response = ApiResponse.error(error.message);
            return res.status(error.statusCode).json(response);
        }
        const response = ApiResponse.error('Lỗi server');
        res.status(500).json(response);
    }
};

// GET /api/players/:id
exports.getPlayerById = async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        const response = ApiResponse.success('Lấy thông tin người chơi thành công', player);

        if (!player) {
            return res.status(404).json(ApiResponse.error('Không tìm thấy người chơi'));
        }
        res.json(response);
    } catch (error) {
        if (error instanceof ApiError) {
            const response = ApiResponse.error(error.message);
            return res.status(error.statusCode).json(response);
        }
        const response = ApiResponse.error('Lỗi server');
        res.status(500).json(response);
    }
};

// POST /api/players
exports.createPlayer = async (req, res) => {
    try {
        const { name, gender, skillPoints } = req.body;

        if (gender !== 'nam' && gender !== 'nữ') {
            return res.status(400).json(ApiResponse.error('Giới tính phải là nam hoặc nữ'));
        }

        if (!name || !gender || !skillPoints) {
            return res.status(400).json(ApiResponse.error('Thiếu thông tin bắt buộc'));
        }

        if (skillPoints < 0) {
            return res.status(400).json(ApiResponse.error('Điểm kĩ năng phải lớn hơn 0'));
        }

        const newPlayer = new Player({ name, gender, skillPoints });
        const savedPlayer = await newPlayer.save();
        const response = ApiResponse.success('Tạo người chơi thành công', savedPlayer);
        res.status(201).json(response);
    } catch (error) {
        if (error instanceof ApiError) {
            const response = ApiResponse.error(error.message);
            return res.status(error.statusCode).json(response);
        }
        const response = ApiResponse.error('Lỗi server');
        res.status(500).json(response);
    }
};

// PUT /api/players/reset-points
exports.resetAllPlayersPoints = async (req, res) => {
    try {
        const updatedPlayers = await Player.updateMany({}, { skillPoints: 1.0 });
        const response = ApiResponse.success('Đã reset điểm của tất cả người chơi về 1.0', updatedPlayers);
        if (updatedPlayers.nModified === 0) {
            return res.status(404).json(ApiResponse.error('Không có người chơi nào để reset điểm'));
        }
        res.json(response);
    } catch (error) {
        if (error instanceof ApiError) {
            const response = ApiResponse.error(error.message);
            return res.status(error.statusCode).json(response);
        }
        const response = ApiResponse.error('Lỗi server');
        res.status(500).json(response);
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

        if (!updatedPlayer) {
            return res.status(404).json(ApiResponse.error('Không tìm thấy người chơi'));
        }
        res.json(ApiResponse.success('Cập nhật người chơi thành công', updatedPlayer));
    } catch (error) {
        if (error instanceof ApiError) {
            const response = ApiResponse.error(error.message);
            return res.status(error.statusCode).json(response);
        }
        const response = ApiResponse.error('Lỗi server');
        res.status(500).json(response);
    }
};

// DELETE /api/players/:id
exports.deletePlayer = async (req, res) => {
    try {
        const deleted = await Player.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json(ApiResponse.error('Không tìm thấy người chơi để xoá'));
        }
        res.json(ApiResponse.success('Xoá người chơi thành công', null));
    } catch (error) {
        if (error instanceof ApiError) {
            const response = ApiResponse.error(error.message);
            return res.status(error.statusCode).json(response);
        }
        const response = ApiResponse.error('Lỗi server');
        res.status(500).json(response);
    }
};
