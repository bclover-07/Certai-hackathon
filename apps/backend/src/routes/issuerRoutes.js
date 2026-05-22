const router = require('express').Router();
const { registerIssuer, verifyIssuer, approveCredential, getPendingCredentials, getIssuers } = require('../controllers/issuerController');
const auth = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roleMiddleware');

router.post('/register', auth, registerIssuer);
router.post('/verify-issuer', auth, requireRole('admin'), verifyIssuer);
router.post('/approve-credential', auth, requireRole('issuer', 'admin'), approveCredential);
router.get('/pending-credentials', auth, requireRole('issuer', 'admin'), getPendingCredentials);
router.get('/issuers', auth, getIssuers);

module.exports = router;
