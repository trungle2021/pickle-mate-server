
const { combinations, shuffle } = require("../utils/algorithm");
const Match = require("../models/match");
const ApiError = require("../utils/api-error");

async function generateRoundRobinMatches(playerIds, numCourts, sessionId) {
   // Kiểm tra số lượng người chơi
    if (playerIds.length < 4 || playerIds.length % 4 !== 0) {
        throw new ApiError(400, "Số lượng người chơi phải là bội số của 4 và ít nhất 4 người");
    }

    if (numCourts > Math.floor(playerIds.length / 4)) {
        throw new ApiError(400,"Số lượng sân không được vượt quá số trận đấu có thể diễn ra trong mỗi vòng (số người chơi/4)");
    }

    // Shuffle players
    playerIds = shuffle(playerIds);
    const allPartners = new Set(); // Track used partner pairs
    const allMatches = [];
    const maxConsecutiveMatches = 1; // Max consecutive matches per player
    const isEnoughCourtForAll = playerIds.length <= numCourts * 4;
    const playerLastRound = {}; // Track last round each player played
    const playerConsecutiveMatches = {}; // Track consecutive matches

    // Initialize tracking
    playerIds.forEach((playerId) => {
        playerLastRound[playerId] = -2;
        playerConsecutiveMatches[playerId] = 0;
    });

    const isValidTeam = (p1, p2) => {
        const key = [p1, p2].sort().join("-");
        return !allPartners.has(key);
    };

    const markTeamUsed = (p1, p2) => {
        const key = [p1, p2].sort().join("-");
        allPartners.add(key);
    };

    function isUniquePlayers(a1, a2, b1, b2) {
        const uniquePlayers = new Set([a1, a2, b1, b2]);
        return uniquePlayers.size === 4;
    }

    // Generate all possible pairs
    const allPairs = combinations(playerIds, 2);
    const totalPairs = allPairs.length;
    let currentRound = 0;

    while (allPartners.size < totalPairs) {
        const roundMatches = [];
        const playersInThisRound = new Set();
        let courtsUsed = 0;

        // Find matches for this round
        for (let i = 0; i < allPairs.length && courtsUsed < numCourts; i++) {
            const [a1, a2] = allPairs[i];

            // Skip if pair already used or players are in this round
            if (!isValidTeam(a1, a2)) continue;
            if (playersInThisRound.has(a1) || playersInThisRound.has(a2)) continue;

            // Find opponent pair
            for (let j = i + 1; j < allPairs.length; j++) {
                const [b1, b2] = allPairs[j];

                if (!isValidTeam(b1, b2)) continue;
                if (playersInThisRound.has(b1) || playersInThisRound.has(b2)) continue;

                if (isUniquePlayers(a1, a2, b1, b2)) {
                    // Check consecutive matches constraint if courts are limited
                    if (isEnoughCourtForAll ||
                        (playerConsecutiveMatches[a1] < maxConsecutiveMatches &&
                            playerConsecutiveMatches[a2] < maxConsecutiveMatches &&
                            playerConsecutiveMatches[b1] < maxConsecutiveMatches &&
                            playerConsecutiveMatches[b2] < maxConsecutiveMatches)) {

                            markTeamUsed(a1, a2);
                            markTeamUsed(b1, b2);
                        // const match = createMatch(a1, a2, b1, b2);
                        const match = {
                            session: sessionId,
                            team1: [a1, a2],
                            team2: [b1, b2],
                            court: null, // Will be assigned later
                            round: null, // Will be assigned later
                            result: {
                                team1Points: 0,
                                team2Points: 0,
                            },
                            status: 'pending',
                        }
                        const newMatch = new Match(match);
                        roundMatches.push(newMatch);
                        courtsUsed++;

                        // Mark players as in this round
                        [a1, a2, b1, b2].forEach(p => playersInThisRound.add(p));

                        // Update consecutive matches count
                        [a1, a2, b1, b2].forEach(p => {
                            playerConsecutiveMatches[p]++;
                            playerLastRound[p] = currentRound;
                        });
                        break;
                    }
                }
            }
        }

        // Add matches to allMatches with round info
        roundMatches.forEach((match, courtIndex) => {
            match.round = currentRound + 1;
            match.court = courtIndex + 1;
            allMatches.push(match);
        });

        // Reset consecutive matches count for players who didn't play this round
        playerIds.forEach(playerId => {
            if (!playersInThisRound.has(playerId)) {
                playerConsecutiveMatches[playerId] = 0;
            }
        });
        currentRound++;
    }

    // save all matches
    await Match.insertMany(allMatches);

    // Group matches into rounds based on numCourts
    const rounds = [];
    for (let roundIndex = 0; roundIndex * numCourts < allMatches.length; roundIndex++) {
        const roundMatches = allMatches.slice(
            roundIndex * numCourts,
            (roundIndex + 1) * numCourts
        );
        rounds.push(roundMatches);
    }

    console.log("Total matches:", allMatches.length);
    console.log("Total rounds:", rounds.length);
    console.log("Player consecutive matches:", playerConsecutiveMatches);

    return {rounds, matchIds: allMatches.map(m => m._id)};
}

module.exports = {
    generateRoundRobinMatches,
};