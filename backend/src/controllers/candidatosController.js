const { Candidato, Eleccion, Voto } = require('../models/index');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// GET /api/candidatos — lista todos (con filtro opcional por eleccion)
async function listar(req, res) {
  try {
    const { eleccion_id } = req.query;
    const where = { activo: true };
    if (eleccion_id) where.eleccion_id = eleccion_id;

    const candidatos = await Candidato.findAll({
      where,
      include: [{ model: Eleccion, as: 'eleccion', attributes: ['id', 'titulo', 'estado'] }],
      order: [['numero_candidato', 'ASC']],
    });

    res.json(candidatos);
  } catch (error) {
    console.error('Error al listar candidatos:', error);
    res.status(500).json({ error: 'Error al obtener candidatos' });
  }
}

// GET /api/candidatos/:id
async function obtener(req, res) {
  try {
    const candidato = await Candidato.findByPk(req.params.id, {
      include: [{ model: Eleccion, as: 'eleccion' }],
    });

    if (!candidato) return res.status(404).json({ error: 'Candidato no encontrado' });

    res.json(candidato);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener candidato' });
  }
}

// POST /api/candidatos — crear (solo admin)
async function crear(req, res) {
  try {
    const { nombre, partido, propuesta, numero_candidato, eleccion_id } = req.body;
    const foto_url = req.file ? `/uploads/candidatos/${req.file.filename}` : null;

    // Verifica que no exista el número de candidato en esa elección
    const existe = await Candidato.findOne({ where: { numero_candidato, eleccion_id } });
    if (existe) {
      return res.status(400).json({ error: `El número ${numero_candidato} ya está en uso en esta elección` });
    }

    const candidato = await Candidato.create({
      nombre, partido, propuesta, numero_candidato, eleccion_id, foto_url,
    });

    res.status(201).json(candidato);
  } catch (error) {
    console.error('Error al crear candidato:', error);
    res.status(500).json({ error: 'Error al crear candidato' });
  }
}

// PUT /api/candidatos/:id — actualizar (solo admin)
async function actualizar(req, res) {
  try {
    const candidato = await Candidato.findByPk(req.params.id);
    if (!candidato) return res.status(404).json({ error: 'Candidato no encontrado' });

    const { nombre, partido, propuesta, numero_candidato, activo } = req.body;

    // Si llega nueva foto, elimina la anterior del disco
    if (req.file) {
      if (candidato.foto_url) {
        const rutaAnterior = path.join(__dirname, '../../', candidato.foto_url);
        if (fs.existsSync(rutaAnterior)) fs.unlinkSync(rutaAnterior);
      }
      candidato.foto_url = `/uploads/candidatos/${req.file.filename}`;
    }

    await candidato.update({ nombre, partido, propuesta, numero_candidato, activo });

    res.json(candidato);
  } catch (error) {
    console.error('Error al actualizar candidato:', error);
    res.status(500).json({ error: 'Error al actualizar candidato' });
  }
}

// DELETE /api/candidatos/:id — soft delete (solo admin)
async function eliminar(req, res) {
  try {
    const candidato = await Candidato.findByPk(req.params.id);
    if (!candidato) return res.status(404).json({ error: 'Candidato no encontrado' });

    // Soft delete: solo marca como inactivo, no borra de BD
    await candidato.update({ activo: false });

    res.json({ mensaje: 'Candidato eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar candidato' });
  }
}

// GET /api/candidatos/resultados/:eleccion_id — conteo de votos por candidato
async function resultados(req, res) {
  try {
    const candidatos = await Candidato.findAll({
      where: { eleccion_id: req.params.eleccion_id, activo: true },
      include: [{
        model: Voto,
        as: 'votos',
        attributes: [],
      }],
      attributes: {
        include: [
          [require('sequelize').fn('COUNT', require('sequelize').col('votos.id')), 'total_votos'],
        ],
      },
      group: ['Candidato.id'],
      order: [[require('sequelize').literal('total_votos'), 'DESC']],
    });

    res.json(candidatos);
  } catch (error) {
    console.error('Error al obtener resultados:', error);
    res.status(500).json({ error: 'Error al obtener resultados' });
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar, resultados };