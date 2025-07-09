const generateSkillBasedMatches = (players, maxTime, numberOfCourts, maxDiff = 0) => {
    const MATCH_DURATION = 17;
    const maxMatches = Math.floor(maxTime / MATCH_DURATION) * numberOfCourts;

    // Track play count, partner history, and opponent history
    const playCount = {};
    const partnerHistory = {}; // e.g., { 'playerA_id': { 'playerB_id': 5, 'playerC_id': 2 } }
    const opponentHistory = {}; // e.g., { 'playerA_id': { 'playerD_id': 3, 'playerE_id': 1 } }

    players.forEach(p => {
        playCount[p._id] = 0;
        partnerHistory[p._id] = {};
        opponentHistory[p._id] = {};
    });

    const matches = [];
    let round = 1;

    while (matches.length < maxMatches) {
        const roundMatches = [];
        const usedInRound = new Set();

        // Tạo matches cho round này
        for (let court = 0; court < numberOfCourts; court++) {
            const available = players.filter(p => !usedInRound.has(p._id));
            if (available.length < 4) break;

            // Chọn 4 người chơi ít chơi nhất
            const selected = available
                .sort((a, b) => playCount[a._id] - playCount[b._id])
                .slice(0, 4);

            // Tìm trận đấu tốt nhất, có xét đến lịch sử đồng đội/đối thủ
            const match = createBestMatch(selected, maxDiff, partnerHistory, opponentHistory);
            if (!match) break;

            // Thêm vào round
            roundMatches.push({
                ...match,
                round,
                court: court + 1,
                matchIndex: matches.length + roundMatches.length + 1
            });

            // Đánh dấu đã dùng
            selected.forEach(p => usedInRound.add(p._id));
        }

        if (roundMatches.length === 0) break;

        // Cập nhật play count và lịch sử
        roundMatches.forEach(match => {
            matches.push(match);
            const team1Ids = match.team1Ids;
            const team2Ids = match.team2Ids;

            // Update play count
            [...team1Ids, ...team2Ids].forEach(id => playCount[id]++);

            // Update partner history
            updateHistory(partnerHistory, team1Ids[0], team1Ids[1]);
            updateHistory(partnerHistory, team2Ids[0], team2Ids[1]);

            // Update opponent history
            updateOpponentHistory(opponentHistory, team1Ids, team2Ids);
        });

        round++;
    }

    return {
        matches,
        stats: createStats(matches, playCount, players),
        totalRounds: round - 1
    };
};

function createBestMatch(fourPlayers, maxDiff, partnerHistory, opponentHistory) {
    const splits = [
        [0, 1, 2, 3], // team1: [0,1], team2: [2,3]
        [0, 2, 1, 3], // team1: [0,2], team2: [1,3]  
        [0, 3, 1, 2]  // team1: [0,3], team2: [1,2]
    ];

    let bestMatch = null;
    let bestScore = Infinity; // Lower score is better

    for (const [t1a, t1b, t2a, t2b] of splits) {
        const team1 = [fourPlayers[t1a], fourPlayers[t1b]];
        const team2 = [fourPlayers[t2a], fourPlayers[t2b]];

        const skill1 = Number(team1[0].skillPoint) + Number(team1[1].skillPoint);
        const skill2 = Number(team2[0].skillPoint) + Number(team2[1].skillPoint);
        const diff = Math.abs(skill1 - skill2);

        // Lọc theo maxDiff trước
        if (maxDiff > 0 && diff > maxDiff) continue;

        // Tính điểm phạt dựa trên lịch sử
        const partnerPenalty = (partnerHistory[team1[0]._id][team1[1]._id] || 0) + (partnerHistory[team2[0]._id][team2[1]._id] || 0);
        const opponentPenalty = getOpponentPenalty(opponentHistory, team1, team2);

        // Tổng điểm cho trận đấu: Cân bằng kỹ năng + Phạt lặp lại
        // Hệ số 0.1 là để skillDiff (thường nhỏ) có tác động ít hơn partner/opponent penalty (thường lớn hơn)
        // Bạn có thể tùy chỉnh các hệ số này
        const matchScore = diff + partnerPenalty * 0.5 + opponentPenalty * 0.5;

        if (matchScore < bestScore) {
            bestScore = matchScore;
            bestMatch = {
                team1,
                team2,
                team1Ids: [team1[0]._id, team1[1]._id],
                team2Ids: [team2[0]._id, team2[1]._id],
                skillDiff: diff,
                team1Skill: skill1,
                team2Skill: skill2
            };
        }
    }

    return bestMatch;
}

// Helper function to update history for a pair
function updateHistory(history, id1, id2) {
    if (!history[id1][id2]) history[id1][id2] = 0;
    if (!history[id2][id1]) history[id2][id1] = 0;
    history[id1][id2]++;
    history[id2][id1]++;
}

// Helper function to update opponent history for two teams
function updateOpponentHistory(history, team1Ids, team2Ids) {
    for (const p1Id of team1Ids) {
        for (const p2Id of team2Ids) {
            if (!history[p1Id][p2Id]) history[p1Id][p2Id] = 0;
            if (!history[p2Id][p1Id]) history[p2Id][p1Id] = 0;
            history[p1Id][p2Id]++;
            history[p2Id][p1Id]++;
        }
    }
}

// Helper function to calculate opponent penalty
function getOpponentPenalty(opponentHistory, team1, team2) {
    let penalty = 0;
    for (const p1 of team1) {
        for (const p2 of team2) {
            penalty += (opponentHistory[p1._id][p2._id] || 0);
        }
    }
    return penalty;
}

// Giữ nguyên hàm tạo thống kê vì nó đã rất tốt
function createStats(matches, playCount, players) {
    const counts = Object.values(playCount);
    const total = counts.reduce((a, b) => a + b, 0);
    const avg = total / players.length;
    const min = Math.min(...counts);
    const max = Math.max(...counts);

    const totalSkillDiff = matches.reduce((sum, m) => sum + m.skillDiff, 0);
    const avgSkillDiff = matches.length > 0 ? totalSkillDiff / matches.length : 0;

    return {
        totalMatches: matches.length,
        averagePlayCount: Number(avg.toFixed(2)),
        minPlayCount: min,
        maxPlayCount: max,
        playCountRange: max - min,
        averageSkillDiff: Number(avgSkillDiff.toFixed(2)),
        playersNotPlaying: counts.filter(c => c === 0).length,
        fairnessScore: Math.max(0, 100 - (max - min) * 20)
    };
}