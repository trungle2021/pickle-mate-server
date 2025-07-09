const Match = require('../models/match');
const Player = require('../models/player');
const Session = require('../models/session');
const SkillPointChangeLog = require("../models/skillPointChangeLog");
const mongoose = require('mongoose');

/**
 * {
  "sessionId": "6688a1b56c80a831b2e9f123",
  "matchResult": [
    {
      "matchId": "6688b3f26c80a831b2e9f456",
      "result": {
        "team1Points": 11,
        "team2Points": 6
      }
    },
    {
      "matchId": "6688b4076c80a831b2e9f457",
      "result": {
        "team1Points": 9,
        "team2Points": 11
      }
    }
  ]
}

 */

const updatePlayerPointsBasedOnHistory = async (sessionId, matchResult) => {
    const session = await mongoose.startSession();
    const changeLogs = []; // <-- Thêm dòng này để lưu thông tin
    try {
        session.startTransaction();

        // Validate sessionId
        const sessionDoc = await Session.findById(sessionId).session(session);
        if (!sessionDoc) {
            throw new Error('Session not found');
        }

        // Retrieve all matches for the session
        const matchesInSession = await Match.find({ session: sessionId }).session(session);
        if (!matchesInSession || matchesInSession.length === 0) {
            throw new Error('No matches found for this session');
        }

        const validMatchIds = new Set(matchesInSession.map(match => match._id.toString()));
        for (const resultItem of matchResult) {
            if (!validMatchIds.has(resultItem.matchId)) {
                throw new Error(`Invalid match ID: ${resultItem.matchId}`);
            }
        }

        // Update match results and status
        for (const { matchId, result } of matchResult) {
            await Match.findByIdAndUpdate(
                matchId,
                { result, status: 'finished' },
                { session }
            );
        }

        // Re-fetch matches with teams populated
        const updatedMatches = await Match.find({ session: sessionId })
            .populate('team1 team2')
            .session(session);

        // Process each match
        for (const match of updatedMatches) {
            const { team1Points, team2Points } = match.result;

            let winningTeam, losingTeam, winningPoints, losingPoints;

            // Determine winner and loser
            if (team1Points >= 11 && team1Points - team2Points >= 2) {
                winningTeam = match.team1;
                losingTeam = match.team2;
                winningPoints = team1Points;
                losingPoints = team2Points;
            } else if (team2Points >= 11 && team2Points - team1Points >= 2) {
                winningTeam = match.team2;
                losingTeam = match.team1;
                winningPoints = team2Points;
                losingPoints = team1Points;
            } else {
                continue; // Skip if no valid winner
            }

            // Calculate bonus
            const gap = Math.abs(winningPoints - losingPoints);
            const winBonus = gap >= 6 ? 0.1 : 0.05;
            const loseBonus = gap >= 6 ? -0.1 : -0.05;

            // Update winners
            for (const player of winningTeam) {
                const currentPlayer = await Player.findById(player._id).session(session);
                const before = currentPlayer.skillPoints;
                const after = Math.round((before + winBonus) * 100) / 100;

                await Player.findByIdAndUpdate(player._id, { $set: { skillPoints: after } }, { session });

                changeLogs.push({
                    session: sessionId,
                    match: match._id,
                    player: player._id,
                    name: player.name,
                    team: 'winning',
                    before,
                    after,
                    delta: +(after - before).toFixed(2)
                });
            }


            // Update losers
            // for (const player of losingTeam) {
            //     const currentPlayer = await Player.findById(player._id).session(session);

            //     if (currentPlayer.skillPoints > 0) {
            //         const updated = Math.max(
            //             0, // đảm bảo không xuống dưới 1.0
            //             Math.round((currentPlayer.skillPoints + loseBonus) * 100) / 100
            //         );

            //         await Player.findByIdAndUpdate(
            //             player._id,
            //             { $set: { skillPoints: updated } },
            //             { session }
            //         );
            //     } else {
            //         console.log(`Player ${player._id} has 0 skillPoints, skipping deduction.`);
            //     }
            // }

            for (const player of losingTeam) {
                const currentPlayer = await Player.findById(player._id).session(session);
                const before = currentPlayer.skillPoints;

                if (before > 0) {
                    const after = Math.max(0, Math.round((before + loseBonus) * 100) / 100);
                    await Player.findByIdAndUpdate(player._id, { $set: { skillPoints: after } }, { session });

                    changeLogs.push({
                        session: sessionId,
                        match: match._id,
                        player: player._id,
                        name: player.name,
                        team: 'losing',
                        before,
                        after,
                        delta: +(after - before).toFixed(2)
                    });
                } else {
                    changeLogs.push({
                        session: sessionId,
                        match: match._id,
                        player: player._id,
                        name: player.name,
                        team: 'losing',
                        before,
                        after: before,
                        delta: 0,
                        note: 'Không trừ điểm vì skillPoints = 0'
                    });
                }
            }
        }

        // save change logs to db

        if (changeLogs.length > 0) {
            const logsWithSessionId = changeLogs.map(log => ({
                ...log,
                createdAt: new Date()
            }));
        
            await SkillPointChangeLog.insertMany(logsWithSessionId, { session });
        }

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return { message: 'Điểm của người chơi và kết quả trận đấu đã được cập nhật thành công.',changeLogs };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        throw new Error('Transaction failed while updating player points.');
    }
};

module.exports = {
    updatePlayerPointsBasedOnHistory
};
