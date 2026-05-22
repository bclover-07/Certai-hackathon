const router = require('express').Router();
const statsController = require('../controllers/statsController');

router.use('/claim',       require('./claimRoutes'));
router.use('/users',       require('./userRoutes'));
router.use('/credentials', require('./credentialRoutes'));
router.use('/verify',      require('./verifyRoutes'));
router.use('/endorse',     require('./endorseRoutes'));
router.use('/leaderboard', require('./leaderboardRoutes'));
router.use('/webhook',     require('./webhookRoutes'));
router.use('/documents',   require('./documentRoutes'));
router.use('/issuer',      require('./issuerRoutes'));

router.get('/stats', statsController.getPublicStats);

module.exports = router;
