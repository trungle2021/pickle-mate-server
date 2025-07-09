
// Utility: combinations of k elements from array
function combinations(arr, k) {
    const result = [];
    function backtrack(start, path) {
        if (path.length === k) {
            result.push([...path]);
            return;
        }
        for (let i = start; i < arr.length; i++) {
            path.push(arr[i]);
            backtrack(i + 1, path);
            path.pop();
        }
    }
    backtrack(0, []);
    return result;
}

// Utility: shuffle array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Utility: calculate total skill points of a team
function teamSkillPoint(team) {
    return team.reduce((sum, p) => sum + p.point, 0);
}

module.exports = {
    combinations,
    shuffle,
    teamSkillPoint
};