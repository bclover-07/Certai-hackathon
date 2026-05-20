const router = require('express').Router();
const { getCredentials, getCredential, getHolderCredentials, updateCredentialStatus } = require('../controllers/credentialController');
const auth = require('../middlewares/auth');

router.get('/', auth, getCredentials);
router.get('/:id', auth, getCredential);
router.get('/holder/:address', auth, getHolderCredentials);
router.put('/:id/status', auth, updateCredentialStatus);

module.exports = router;
