const router = require('express').Router();
const { handleAlchemyWebhook } = require('../controllers/webhookController');

router.post('/alchemy', handleAlchemyWebhook);

module.exports = router;
