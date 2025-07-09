const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

// API to update player points based on match history
router.put('/update-points', matchController.updatePlayerPointsBasedOnHistory);
router.delete('/', matchController.deleteAllMatches);


module.exports = router;
