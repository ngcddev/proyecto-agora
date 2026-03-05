const crypto = require('crypto');
const { Voto, Votante, Candidato, Eleccion, sequelize } = require('../models/index');
const { obtenerResultadosOficiales } = require('../services/soapClient');

// POST /api/votos — emitir un voto
async function emitirVoto(req, res) {
  // Usamos una transacción para garantizar atomicidad
  const t = await sequelize.transaction();

  try {
    const { candidato_id, cedula, eleccion_id } = req.body;

    if (!candidato_id || !cedula || !eleccion_id) {
      await t.rollback();
      return res.status(400).json({ error: 'candidato_id, cedula y eleccion_id son requeridos' });
    }

    // 1. Verificar que la elección esté activa
    const eleccion = await Eleccion.findOne({
      where: { id: eleccion_id, activa: true, estado: 'activa' },
      transaction: t,
    });
    if (!eleccion) {
      await t.rollback();
      return res.status(400).json({ error: 'La elección no está activa' });
    }

    // 2. Verificar que el candidato pertenece a esa elección
    const candidato = await Candidato.findOne({
      where: { id: candidato_id, eleccion_id, activo: true },
      transaction: t,
    });
    if (!candidato) {
      await t.rollback();
      return res.status(400).json({ error: 'Candidato no válido para esta elección' });
    }

    // 3. Verificar votante
    const votante = await Votante.findOne({ where: { cedula }, transaction: t });
    if (!votante) {
      await t.rollback();
      return res.status(400).json({ error: 'Votante no registrado' });
    }
    if (!votante.habilitado || votante.ya_voto) {
      await t.rollback();
      return res.status(400).json({ error: 'Votante no habilitado o ya emitió su voto' });
    }

    // 4. Verificar que no exista ya un voto de este votante en esta elección
    const votoExistente = await Voto.findOne({
      where: { votante_id: votante.id, eleccion_id },
      transaction: t,
    });
    if (votoExistente) {
      await t.rollback();
      return res.status(400).json({ error: 'Este votante ya votó en esta elección' });
    }

    // 5. Generar hash de verificación único para auditoría
    const hashVerificacion = crypto
      .createHash('sha256')
      .update(`${votante.id}-${candidato_id}-${eleccion_id}-${Date.now()}`)
      .digest('hex');

    // 6. Registrar el voto
    const voto = await Voto.create({
      candidato_id,
      votante_id:        votante.id,
      eleccion_id,
      ip_origen:         req.ip,
      hash_verificacion: hashVerificacion,
    }, { transaction: t });

    // 7. Marcar al votante como ya votó
    await votante.update({ ya_voto: true }, { transaction: t });

    await t.commit();

    res.status(201).json({
      mensaje:           'Voto registrado exitosamente',
      hash_verificacion: hashVerificacion,
    });
  } catch (error) {
    await t.rollback();
    console.error('Error al emitir voto:', error);

    // Constraint unique: voto duplicado
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Este votante ya votó en esta elección' });
    }

    res.status(500).json({ error: 'Error al registrar voto' });
  }
}

// GET /api/votos/resultados/:eleccion_id — resultados via SOAP #2
async function resultadosOficiales(req, res) {
  try {
    const { eleccion_id } = req.params;

    // Llama al microservicio SOAP Python de resultados
    const data = await obtenerResultadosOficiales(parseInt(eleccion_id));

    res.json(data);
  } catch (error) {
    console.error('Error al obtener resultados SOAP:', error.message);
    // Fallback directo a BD
    try {
      const candidatos = await Candidato.findAll({
        where: { eleccion_id: req.params.eleccion_id, activo: true },
        include: [{ model: Voto, as: 'votos', attributes: [] }],
        attributes: {
          include: [
            [sequelize.fn('COUNT', sequelize.col('votos.id')), 'total_votos'],
          ],
        },
        group: ['Candidato.id'],
        order: [[sequelize.literal('total_votos'), 'DESC']],
      });
      res.json({ fuente: 'fallback-db', candidatos });
    } catch (fallbackError) {
      res.status(503).json({ error: 'Servicio de resultados no disponible' });
    }
  }
}

// GET /api/votos/stats/:eleccion_id — estadísticas para el dashboard admin
async function statsAdmin(req, res) {
  try {
    const { eleccion_id } = req.params;

    const [totalVotos, totalVotantes, candidatos] = await Promise.all([
      Voto.count({ where: { eleccion_id } }),
      Votante.count({ where: { habilitado: true } }),
      Candidato.findAll({
        where: { eleccion_id, activo: true },
        include: [{ model: Voto, as: 'votos', attributes: [] }],
        attributes: {
          include: [
            [sequelize.fn('COUNT', sequelize.col('votos.id')), 'total_votos'],
          ],
        },
        group: ['Candidato.id'],
        order: [[sequelize.literal('total_votos'), 'DESC']],
      }),
    ]);

    const participacion = totalVotantes > 0
      ? ((totalVotos / totalVotantes) * 100).toFixed(1)
      : '0.0';

    res.json({
      total_votos:      totalVotos,
      total_votantes:   totalVotantes,
      participacion:    `${participacion}%`,
      candidatos,
    });
  } catch (error) {
    console.error('Error en stats admin:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}

module.exports = { emitirVoto, resultadosOficiales, statsAdmin };