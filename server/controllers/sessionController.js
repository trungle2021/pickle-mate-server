const Session = require('../models/session');
const Player = require('../models/player');
const GenerateMatchesService = require('../services/generate-matches-service');

// Tạo session mới
exports.createSession = async (req, res) => {
    try {
        const { startTime, endTime, location, numCourts, players: playerIds, matchType, note } = req.body;

        if (!startTime || !endTime || !location || !numCourts || !Array.isArray(playerIds) || playerIds.length === 0 || !matchType) {
            console.error('Thiếu thông tin cần thiết để tạo session:', {
                startTime, endTime, location, numCourts, playerIds, matchType
            });
            return res.status(400).json({ message: 'Thiếu thông tin: startTime, endTime, location, numCourts, players[]' });
        }

        // Kiểm tra thời gian hợp lệ
        if (new Date(endTime) <= new Date(startTime)) {
            return res.status(400).json({ message: 'endTime phải lớn hơn startTime' });
        }

        // Kiểm tra xem người chơi có hợp lệ không
        const validPlayers = await Player.find({ _id: { $in: playerIds } });
        if (validPlayers.length !== playerIds.length) {
            return res.status(400).json({ message: 'Một hoặc nhiều người chơi không hợp lệ' });
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
                    return res.status(400).json({ message: 'Không thể tạo trận đấu round-robin với dữ liệu hiện tại' });
                }
                generatedMatches = roundRobinResult.matchIds;
                break;

            case 'skill-based':
                generatedMatches = await GenerateMatchesService.generateSkillBasedMatches(playerIds, 30, numCourts, 0);
                if (!generatedMatches || generatedMatches.length === 0) {
                    return res.status(400).json({ message: 'Không thể tạo trận đấu skill-based với dữ liệu hiện tại' });
                }
                break;

            default:
                return res.status(400).json({ message: 'matchType không hợp lệ, chỉ hỗ trợ round-robin hoặc skill-based' });
        }
        // Gán các trận đấu vào session và lưu
        newSession.matches = generatedMatches;
        const savedSession = await newSession.save();

        return res.status(201).json(savedSession);
    } catch (error) {
        console.error('Lỗi tạo session:', error);
        res.status(500).json({
            message: 'Lỗi server khi tạo session', error: {
                message: error.message,
            }
        });
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

        res.json(sessions);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách sessions', error: {
                message: error.message,
            }
        });
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
            return res.status(404).json({ message: 'Không tìm thấy session' });
        }

        res.json(session);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy session', error: {
                message: error.message,
            }
        });
    }
};

// Xoá 1 session
exports.deleteSession = async (req, res) => {
    try {
        const deleted = await Session.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Không tìm thấy session' });

        res.json({ message: 'Đã xoá session' });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi xoá session', error: {
                message: error.message,
            }
        });
    }
};

// Tạo trận đấu Round Robin
exports.generateRoundRobinMatches = async (req, res) => {
    try {
        const { players, numCourts } = req.body;


        const matches = GenerateMatchesService.generateRoundRobinMatches(players, numCourts);
        if (!matches || matches.length === 0) return res.status(400).json({ message: 'Không thể tạo trận đấu với dữ liệu hiện tại' });


        return res.json(matches);
    } catch (error) {
        console.error('Lỗi khi tạo trận đấu Round Robin:', error);
        res.status(500).json({
            message: 'Lỗi server khi tạo trận đấu Round Robin',
            error: {
                message: error.message,
            }
        });
    }
}

exports.generateSkillBasedMatches = async (req, res) => {
    try {
        const { players, maxTime, numberOfCourts = 1, maxDiff = 0 } = req.body;


        if (!Array.isArray(players) || players.length < 4) {
            return res.status(400).json({ message: 'Cần ít nhất 4 người chơi để tạo trận đấu' });
        }

        const matches = GenerateMatchesService.generateSkillBasedMatches(players, maxTime, numberOfCourts, maxDiff);

        if (!matches || matches.length === 0) return res.status(400).json({ message: 'Không thể tạo trận đấu với dữ liệu hiện tại' });

        return res.json(matches);
    } catch (error) {
        console.error('Lỗi khi tạo trận đấu dựa trên kỹ năng:', error);
        res.status(500).json({
            message: 'Lỗi server khi tạo trận đấu dựa trên kỹ năng', error: {
                message: error.message,
            }
        });
    }
}
