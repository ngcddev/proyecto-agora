// ── routes/index.js — router principal ───────────────────
const { Router } = require('express');
const router = Router();

const authRoutes       = require('./auth');
const candidatosRoutes = require('./candidatos');
const votantesRoutes   = require('./votantes');
const votosRoutes      = require('./votos');
const eleccionesRoutes = require('./elecciones');

// Health check
router.get('/health', (req, res) => {
  res.json({
    status:    'OK',
    message:   'API Ágora operativa',
    timestamp: new Date().toISOString(),
    version:   '1.0.0',
  });
});

// Montar rutas
router.use('/auth',       authRoutes);
router.use('/candidatos', candidatosRoutes);
router.use('/votantes',   votantesRoutes);
router.use('/votos',      votosRoutes);
router.use('/elecciones', eleccionesRoutes);

module.exports = router;