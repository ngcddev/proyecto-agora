const { Votante } = require('../models/index.js');
const { validarVotante } = require('../services/soapClient.js');

// POST /api/votantes/validar
// Bridge: recibe cédula → llama SOAP #1 → devuelve JSON al frontend
async function validar(req, res) {
  try {
    const { cedula, eleccion_id } = req.body;

    if (!cedula || !eleccion_id) {
      return res.status(400).json({ error: 'cedula y eleccion_id son requeridos' });
    }

    // Intenta primero con SOAP
    try {
      const respuestaSOAP = await validarVotante(cedula, eleccion_id);
      return res.json({
        habilitado: respuestaSOAP.habilitado === true || respuestaSOAP.habilitado === 'true',
        mensaje:    respuestaSOAP.mensaje  || '',
        nombre:     respuestaSOAP.nombre   || '',
        cedula:     respuestaSOAP.cedula   || cedula,
      });
    } catch (soapError) {
      console.warn('⚠️  SOAP no disponible, usando fallback BD:', soapError.message);
    }

    // Fallback directo a BD
    const votante = await Votante.findOne({ where: { cedula } });
    console.log('🔍 Votante encontrado en BD:', votante?.toJSON() || null);

    if (!votante) {
      return res.json({
        habilitado: false,
        mensaje:    'Cédula no registrada en el padrón electoral',
        nombre:     '',
        cedula,
      });
    }

    if (!votante.habilitado) {
      return res.json({
        habilitado: false,
        mensaje:    'Votante inhabilitado',
        nombre:     votante.nombre,
        cedula,
      });
    }

    if (votante.ya_voto) {
      return res.json({
        habilitado: false,
        mensaje:    'Este votante ya ejerció su voto',
        nombre:     votante.nombre,
        cedula,
      });
    }

    // ✅ Habilitado
    return res.json({
      habilitado: true,
      mensaje:    'Votante habilitado para votar',
      nombre:     votante.nombre,
      cedula,
    });

  } catch (error) {
    console.error('Error en validación:', error);
    res.status(503).json({ error: 'Servicio de validación no disponible' });
  }
}

// GET /api/votantes — lista todos (solo admin)
async function listar(req, res) {
  try {
    const votantes = await Votante.findAll({
      attributes: ['id', 'cedula', 'nombre', 'email', 'habilitado', 'ya_voto', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    res.json(votantes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener votantes' });
  }
}

// POST /api/votantes — registrar nuevo votante (solo admin)
async function crear(req, res) {
  try {
    const { cedula, nombre, email } = req.body;

    if (!cedula || !nombre) {
      return res.status(400).json({ error: 'cedula y nombre son requeridos' });
    }

    const existe = await Votante.findOne({ where: { cedula } });
    if (existe) {
      return res.status(400).json({ error: 'Ya existe un votante con esa cédula' });
    }

    const votante = await Votante.create({ cedula, nombre, email });
    res.status(201).json(votante);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar votante' });
  }
}

// PUT /api/votantes/:id/habilitar — toggle habilitado (solo admin)
async function toggleHabilitar(req, res) {
  try {
    const votante = await Votante.findByPk(req.params.id);
    if (!votante) return res.status(404).json({ error: 'Votante no encontrado' });

    await votante.update({ habilitado: !votante.habilitado });
    res.json({ mensaje: `Votante ${votante.habilitado ? 'habilitado' : 'inhabilitado'}`, votante });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar votante' });
  }
}

module.exports = { validar, listar, crear, toggleHabilitar };