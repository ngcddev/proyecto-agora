// ── routes/elecciones.js ─────────────────────────────────
const { Router } = require('express');
const ctrl = require('../controllers/eleccionesController');
const { verificarToken } = require('../middlewares/auth');

const router = Router();

// Pública — cualquiera puede ver la elección activa
router.get('/activa', ctrl.obtenerActiva);
router.get('/:id',    ctrl.obtener);

// Protegidas — solo admin
router.get('/',              verificarToken, ctrl.listar);
router.post('/',             verificarToken, ctrl.crear);
router.put('/:id',           verificarToken, ctrl.actualizar);
router.put('/:id/activar',   verificarToken, ctrl.activar);

module.exports = router;