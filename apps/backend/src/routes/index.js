const router = require('express').Router();

router.use('/claim',       require('./claimRoutes'));
router.use('/users',       require('./userRoutes'));
router.use('/credentials', require('./credentialRoutes'));
router.use('/verify',      require('./verifyRoutes'));
router.use('/endorse',     require('./endorseRoutes'));
router.use('/leaderboard', require('./leaderboardRoutes'));
router.use('/webhook',     require('./webhookRoutes'));

module.exports = router;
