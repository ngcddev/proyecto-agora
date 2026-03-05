const { Eleccion, Candidato, Voto } = require('../models/index');

// GET /api/elecciones — lista todas
async function listar(req, res) {
  try {
    const elecciones = await Eleccion.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(elecciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener elecciones' });
  }
}

// GET /api/elecciones/activa — obtiene la elección activa actual
async function obtenerActiva(req, res) {
  try {
    const eleccion = await Eleccion.findOne({
      where: { activa: true, estado: 'activa' },
    });
    if (!eleccion) {
      return res.status(404).json({ error: 'No hay ninguna elección activa' });
    }
    res.json(eleccion);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener elección activa' });
  }
}

// GET /api/elecciones/:id
async function obtener(req, res) {
  try {
    const eleccion = await Eleccion.findByPk(req.params.id);
    if (!eleccion) return res.status(404).json({ error: 'Elección no encontrada' });
    res.json(eleccion);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener elección' });
  }
}

// POST /api/elecciones — crear (solo admin)
async function crear(req, res) {
  try {
    const { titulo, descripcion, fecha_inicio, fecha_fin } = req.body;

    if (!titulo || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: 'titulo, fecha_inicio y fecha_fin son requeridos' });
    }

    const eleccion = await Eleccion.create({
      titulo, descripcion, fecha_inicio, fecha_fin,
      estado: 'pendiente',
      activa: false,
    });

    res.status(201).json(eleccion);
  } catch (error) {
    if (error.message.includes('fecha')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al crear elección' });
  }
}

// PUT /api/elecciones/:id — actualizar (solo admin)
async function actualizar(req, res) {
  try {
    const eleccion = await Eleccion.findByPk(req.params.id);
    if (!eleccion) return res.status(404).json({ error: 'Elección no encontrada' });

    const { titulo, descripcion, fecha_inicio, fecha_fin, estado, activa } = req.body;
    await eleccion.update({ titulo, descripcion, fecha_inicio, fecha_fin, estado, activa });

    res.json(eleccion);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar elección' });
  }
}

// PUT /api/elecciones/:id/activar — activa una elección y desactiva las demás
async function activar(req, res) {
  const t = await require('../models/index').sequelize.transaction();
  try {
    // Desactiva todas
    await Eleccion.update(
      { activa: false, estado: 'pendiente' },
      { where: {}, transaction: t }
    );

    // Activa la indicada
    const eleccion = await Eleccion.findByPk(req.params.id, { transaction: t });
    if (!eleccion) {
      await t.rollback();
      return res.status(404).json({ error: 'Elección no encontrada' });
    }

    await eleccion.update({ activa: true, estado: 'activa' }, { transaction: t });
    await t.commit();

    res.json({ mensaje: `Elección "${eleccion.titulo}" activada`, eleccion });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Error al activar elección' });
  }
}

module.exports = { listar, obtener, obtenerActiva, crear, actualizar, activar };