const { Router } = require('express');
const { login, me } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/auth');

const router = Router();

router.post('/login', login);
router.get('/me', verificarToken, me);

module.exports = router;