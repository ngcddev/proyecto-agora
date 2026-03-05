const { Router } = require('express');
const ctrl = require('../controllers/candidatosController');
const { verificarToken } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = Router();

// Públicas — el frontend de votante las consume
router.get('/', ctrl.listar);
router.get('/resultados/:eleccion_id', ctrl.resultados);
router.get('/:id', ctrl.obtener);

// Protegidas — solo admin autenticado
router.post('/', verificarToken, upload.single('foto'), ctrl.crear);
router.put('/:id', verificarToken, upload.single('foto'), ctrl.actualizar);
router.delete('/:id', verificarToken, ctrl.eliminar);

module.exports = router;