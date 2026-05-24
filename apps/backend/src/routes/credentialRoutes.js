const router = require('express').Router();
const { 
  getCredentials, 
  getCredential, 
  getHolderCredentials, 
  updateCredentialStatus, 
  upgradeTrustLevel, 
  revokeCredential,
  getCredentialByTxHash
} = require('../controllers/credentialController');
const auth = require('../middlewares/auth');

router.get('/', auth, getCredentials);
router.get('/holder/:address', auth, getHolderCredentials);
router.get('/tx/:txHash', getCredentialByTxHash);
router.get('/:id', auth, getCredential);
router.put('/:id/status', auth, updateCredentialStatus);
router.put('/:id/trust-level', auth, upgradeTrustLevel);
router.put('/:id/revoke', auth, revokeCredential);

module.exports = router;
