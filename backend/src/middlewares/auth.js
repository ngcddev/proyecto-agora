const jwt = require('jsonwebtoken');
const { AdminUsuario } = require('../models/index');

async function verificarToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verifica que el usuario siga existiendo y activo en BD
    const usuario = await AdminUsuario.findOne({
      where: { id: decoded.id, activo: true },
      attributes: { exclude: ['password'] },
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Token inválido o usuario inactivo' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Middleware para verificar rol — uso: verificarRol('superadmin')
function verificarRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }
    next();
  };
}

module.exports = { verificarToken, verificarRol };