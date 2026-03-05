const { Router } = require('express');
const router = Router();

const authRoutes       = require('./auth');
const candidatosRoutes = require('./candidatos');

router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/candidatos', candidatosRoutes);

module.exports = router;