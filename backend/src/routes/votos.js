const { Router } = require('express');
const ctrl = require('../controllers/votosController');
const { verificarToken } = require('../middlewares/auth');

const router = Router();

// ✅ Pública — el votante NO tiene token
router.post('/', ctrl.emitirVoto);

// ✅ Pública — resultados via SOAP #2
router.get('/resultados/:eleccion_id', ctrl.resultadosOficiales);

// 🔒 Protegida — solo admin
router.get('/stats/:eleccion_id', verificarToken, ctrl.statsAdmin);

module.exports = router;