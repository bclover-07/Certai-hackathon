const router = require('express').Router();
const { parseClaim, explainCredential } = require('../controllers/claimController');
const auth = require('../middlewares/auth');
const { claimLimiter } = require('../middlewares/rateLimiter');
const { validateClaim } = require('../middlewares/validator');

router.post('/parse', auth, claimLimiter, validateClaim, parseClaim);
router.post('/explain', auth, explainCredential);

module.exports = router;
