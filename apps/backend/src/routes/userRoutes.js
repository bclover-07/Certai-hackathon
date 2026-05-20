const router = require('express').Router();
const { getUsers, getUser, createUser, updateUser } = require('../controllers/userController');
const auth = require('../middlewares/auth');

router.get('/', auth, getUsers);
router.get('/:address', auth, getUser);
router.post('/', auth, createUser);
router.put('/:address', auth, updateUser);

module.exports = router;
