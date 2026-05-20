const router = require('express').Router();
const { getLeaderboard, getUserRank } = require('../controllers/leaderboardController');
const auth = require('../middlewares/auth');

router.get('/', auth, getLeaderboard);
router.get('/:address', auth, getUserRank);

module.exports = router;
