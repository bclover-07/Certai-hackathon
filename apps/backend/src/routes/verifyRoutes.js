const router = require('express').Router();
const { verifyCredential, getVerificationHistory } = require('../controllers/verifyController');
const auth = require('../middlewares/auth');
const { validateVerification } = require('../middlewares/validator');

router.post('/', auth, validateVerification, verifyCredential);
router.get('/history/:address', auth, getVerificationHistory);

module.exports = router;
