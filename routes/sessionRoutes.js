const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/', sessionController.createSession);
router.post('/generate-round-robin', sessionController.generateRoundRobinMatches);
// router.post('/generate-random-pairs', sessionController.generateRandomPairsMatches);
router.post('/generate-skill-based', sessionController.generateSkillBasedMatches);
router.get('/', sessionController.getAllSessions);
router.get('/:id', sessionController.getSessionById);
router.delete('/:id', sessionController.deleteSession);

module.exports = router;
