// ── routes/votantes.js ───────────────────────────────────
const { Router } = require('express');
const ctrl = require('../controllers/votantesController');
const { verificarToken } = require('../middlewares/auth');

const router = Router();

// Pública — el frontend de votante la llama antes de votar
router.post('/validar', ctrl.validar);

// Protegidas — solo admin
router.get('/',        verificarToken, ctrl.listar);
router.post('/',       verificarToken, ctrl.crear);
router.put('/:id/habilitar', verificarToken, ctrl.toggleHabilitar);

module.exports = router;