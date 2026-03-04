const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const routes = require('./routes/index');

const app = express();

// Middlewares globales
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://tu-frontend.vercel.app'  // se actualiza en fase de deploy
    : 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', routes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Conexión a BD y arranque del servidor
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MySQL establecida correctamente');

    // sync({ alter: true }) actualiza tablas si hay cambios en modelos
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados con la base de datos');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;