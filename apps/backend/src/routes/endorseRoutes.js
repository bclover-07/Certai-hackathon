const router = require('express').Router();
const { createEndorsement, getReceivedEndorsements, getGivenEndorsements } = require('../controllers/endorseController');
const auth = require('../middlewares/auth');
const { validateEndorsement } = require('../middlewares/validator');

router.post('/', auth, validateEndorsement, createEndorsement);
router.get('/received/:address', auth, getReceivedEndorsements);
router.get('/given/:address', auth, getGivenEndorsements);

module.exports = router;
