const assert = require('assert');
const { generateRoundRobinMatches } = require('../services/generate-matches-service');

describe('All Player Meet Other Partner', () => {
    it('should ensure each player meets all other partners at least once', () => {
        // Tạo danh sách 8 người chơi giả lập
        const players = Array.from({ length: 8 }, (_, i) => ({ _id: `p${i + 1}` }));
        const numCourts = 2;

        const { rounds } = generateRoundRobinMatches(players, numCourts);

        // Tạo map lưu các cặp đã gặp nhau
        const metPairs = new Set();

        // Duyệt qua tất cả các trận đấu
        rounds.flat().forEach(match => {
            const ids = [
                ...match.team1.map(p => p._id),
                ...match.team2.map(p => p._id)
            ];
            // Lưu lại tất cả các cặp đã gặp nhau trong trận này
            for (let i = 0; i < ids.length; i++) {
                for (let j = i + 1; j < ids.length; j++) {
                    const pair = [ids[i], ids[j]].sort().join('-');
                    metPairs.add(pair);
                }
            }
        });

        // Kiểm tra tất cả các cặp người chơi đều đã gặp nhau
        for (let i = 0; i < players.length; i++) {
            for (let j = i + 1; j < players.length; j++) {
                const pair = [players[i]._id, players[j]._id].sort().join('-');
                assert(
                    metPairs.has(pair),
                    `Pair ${pair} did not meet`
                );
            }
        }
    });
});

describe('No Player Appear On Both Courts', () => {

    it('should ensure no player appears on both courts in the same round when numCourts = 2', () => {
        const players = Array.from({ length: 8 }, (_, i) => ({ _id: `p${i + 1}` }));
        const numCourts = 2;

        const { rounds } = generateRoundRobinMatches(players, numCourts);

        rounds.forEach((matches, roundIdx) => {
            const playersInRound = new Set();
            matches.forEach(match => {
                const ids = [
                    ...match.team1.map(p => p._id),
                    ...match.team2.map(p => p._id)
                ];
                ids.forEach(id => {
                    assert(
                        !playersInRound.has(id),
                        `Player ${id} appears more than once in round ${roundIdx + 1}`
                    );
                    playersInRound.add(id);
                });
            });
        });
    });
});

describe('Consecutive Matches Constraint', () => {
    it('should ensure no player plays more than 2 consecutive matches when numCourts = 1', () => {
        const players = Array.from({ length: 8 }, (_, i) => ({ _id: `p${i + 1}` }));
        const numCourts = 1;

        const { rounds } = generateRoundRobinMatches(players, numCourts);

        // Theo dõi số trận liên tiếp của từng người chơi
        const consecutiveCounts = {};
        players.forEach(p => consecutiveCounts[p._id] = 0);

        // Duyệt qua từng round
        rounds.forEach((matches) => {
            // Với numCourts = 1, mỗi round chỉ có 1 trận
            const match = matches[0];
            const playingIds = [
                ...match.team1.map(p => p._id),
                ...match.team2.map(p => p._id)
            ];

            // Tăng số trận liên tiếp cho người chơi tham gia, reset cho người không tham gia
            players.forEach(p => {
                if (playingIds.includes(p._id)) {
                    consecutiveCounts[p._id]++;
                    assert(
                        consecutiveCounts[p._id] <= 2,
                        `Player ${p._id} played more than 2 consecutive matches`
                    );
                } else {
                    consecutiveCounts[p._id] = 0;
                }
            });
        });
    });
});