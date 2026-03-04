const sequelize = require('../config/database');

// Aquí iremos importando los modelos conforme los creemos
// const Candidato = require('./Candidato');

const db = {
  sequelize,
  // Candidato,
};

module.exports = db;

// ------------------------------------------------------------------------------------------------------------------------------

const { Router } = require('express');
const router = Router();

// Health check — sirve para verificar que el servidor responde
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API de Voto Electrónico funcionando',
    timestamp: new Date().toISOString(),
  });
});

// Aquí iremos montando las rutas conforme avancemos
// router.use('/candidatos', candidatosRouter);
// router.use('/auth', authRouter);

module.exports = router;