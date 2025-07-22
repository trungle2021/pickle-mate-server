const Session = require('../models/session');
const Player = require('../models/player');
const GenerateMatchesService = require('../services/generate-matches-service');
const ApiResponse = require('../utils/api-response');
const ApiError = require('../utils/api-error');

// Tạo session mới
exports.createSession = async (req, res) => {
    try {
        const { startTime, endTime, location, numCourts, players: playerIds, matchType, note } = req.body;

        if (!startTime || !endTime || !location || !numCourts || !Array.isArray(playerIds) || playerIds.length === 0 || !matchType) {
            console.error('Thiếu thông tin cần thiết để tạo session:', {
                startTime, endTime, location, numCourts, playerIds, matchType
            });
            return res.status(400).json(ApiResponse.error('Thiếu thông tin cần thiết để tạo session'));
        }

        // Kiểm tra thời gian hợp lệ
        if (new Date(endTime) <= new Date(startTime)) {
            console.error('Thời gian kết thúc phải sau thời gian bắt đầu:', { startTime, endTime });
            return res.status(400).json(ApiResponse.error('Thời gian kết thúc phải sau thời gian bắt đầu'));
        }

        // Kiểm tra xem người chơi có hợp lệ không
        const validPlayers = await Player.find({ _id: { $in: playerIds } });
        if (validPlayers.length !== playerIds.length) {
            console.error('Một hoặc nhiều người chơi không hợp lệ:', playerIds);
            return res.status(400).json(ApiResponse.error('Một hoặc nhiều người chơi không hợp lệ'));
        }

        // Khởi tạo session mới
        const newSession = new Session({
            players: playerIds,
            matches: [],
            location,
            matchType,
            numCourts,
            startTime,
            endTime,
            note,
        });

        const sessionId = newSession._id;
        let generatedMatches = [];

        // Tạo các trận đấu tương ứng với matchType
        switch (matchType) {
            case 'round-robin':
                const roundRobinResult = await GenerateMatchesService.generateRoundRobinMatches(playerIds, numCourts, sessionId);
                if (!roundRobinResult.matchIds || roundRobinResult.matchIds.length === 0) {
                    return res.status(400).json(ApiResponse.error('Không thể tạo trận đấu round-robin với dữ liệu hiện tại'));
                }
                generatedMatches = roundRobinResult.matchIds;
                break;

            case 'skill-based':
                generatedMatches = await GenerateMatchesService.generateSkillBasedMatches(playerIds, 30, numCourts, 0);
                if (!generatedMatches || generatedMatches.length === 0) {
                    return res.status(400).json(ApiResponse.error('Không thể tạo trận đấu skill-based với dữ liệu hiện tại'));
                }
                break;

            default:
                console.error('Match type không hợp lệ:', matchType);
                return res.status(400).json(ApiResponse.error('matchType không hợp lệ'));
        }
        // Gán các trận đấu vào session và lưu
        newSession.matches = generatedMatches;
        const savedSession = await newSession.save();
        res.status(201).json(ApiResponse.success('Tạo session thành công', savedSession));

    } catch (error) {
        if (error instanceof ApiError) {
            const response = ApiResponse.error(error.message);
            return res.status(error.statusCode).json(response);
          }
          const response = ApiResponse.error('Lỗi server');
          res.status(500).json(response);
    }
};

// Lấy tất cả session
exports.getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find()
            .populate('players')
            .populate({
                path: 'matches',
                populate: ['team1', 'team2']
            });
        if (!sessions || sessions.length === 0) {
            return res.status(404).json(ApiResponse.error('Không tìm thấy session nào'));
        }
        res.status(200).json(ApiResponse.success('Danh sách sessions', sessions));
    } catch (error) {
        if (error instanceof ApiError) {
            const response = ApiResponse.error(error.message);
            return res.status(error.statusCode).json(response);
          }
          const response = ApiResponse.error('Lỗi server');
          res.status(500).json(response);
    }
};

// Lấy 1 session theo ID
exports.getSessionById = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id)
            .populate('players')
            .populate({
                path: 'matches',
                populate: ['team1', 'team2']
            });

        if (!session) {
            return res.status(404).json(ApiResponse.error('Không tìm thấy session'));
        }

        res.status(200).json(ApiResponse.success('Lấy session thành công', session));
    } catch (error) {
        if (error instanceof ApiError) {
            const response = ApiResponse.error(error.message);
            return res.status(error.statusCode).json(response);
          }
          const response = ApiResponse.error('Lỗi server');
          res.status(500).json(response);
    }
};

// Xoá 1 session
exports.deleteSession = async (req, res) => {
    try {
        const deleted = await Session.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json(ApiResponse.error('Không tìm thấy session để xoá'));

        res.status(200).json(ApiResponse.success('Xoá session thành công'));
    } catch (error) {
        if (error instanceof ApiError) {
            const response = ApiResponse.error(error.message);
            return res.status(error.statusCode).json(response);
          }
          const response = ApiResponse.error('Lỗi server');
          res.status(500).json(response);
    }
};

// Tạo trận đấu Round Robin
exports.generateRoundRobinMatches = async (req, res) => {
    try {
        const { players, numCourts } = req.body;
        const matches = GenerateMatchesService.generateRoundRobinMatches(players, numCourts);
        if (!matches || matches.length === 0) return res.status(400).json(ApiResponse.error('Không thể tạo trận đấu Round Robin với dữ liệu hiện tại'));
        if (!Array.isArray(players) || players.length < 4) {
            return res.status(400).json(ApiResponse.error('Cần ít nhất 4 người chơi để tạo trận đấu Round Robin'));
        }
        return res.status(200).json(ApiResponse.success('Tạo trận đấu Round Robin thành công', matches));
    } catch (error) {
        if (error instanceof ApiError) {
            const response = ApiResponse.error(error.message);
            return res.status(error.statusCode).json(response);
          }
          const response = ApiResponse.error('Lỗi server');
          res.status(500).json(response);
    }
}

exports.generateSkillBasedMatches = async (req, res) => {
    try {
        const { players, maxTime, numberOfCourts = 1, maxDiff = 0 } = req.body;


        if (!Array.isArray(players) || players.length < 4) {
            return res.status(400).json(ApiResponse.error('Cần ít nhất 4 người chơi để tạo trận đấu kỹ năng'));
        }

        const matches = GenerateMatchesService.generateSkillBasedMatches(players, maxTime, numberOfCourts, maxDiff);

        if (!matches || matches.length === 0) return res.status(400).json(ApiResponse.error('Không thể tạo trận đấu kỹ năng với dữ liệu hiện tại'));
        if (matches.length < 1) {
            return res.status(400).json(ApiResponse.error('Không thể tạo trận đấu kỹ năng với dữ liệu hiện tại'));
        }

        return res.status(201).json(ApiResponse.success("Tạo trận đấu Skill-Based thành công",matches));
    } catch (error) {
        if (error instanceof ApiError) {
            const response = ApiResponse.error(error.message);
            return res.status(error.statusCode).json(response);
          }
          const response = ApiResponse.error('Lỗi server');
          res.status(500).json(response);
    }
}
