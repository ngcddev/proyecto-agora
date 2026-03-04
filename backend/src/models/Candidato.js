const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Candidato = sequelize.define('Candidato', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  partido: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  propuesta: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  foto_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null,
  },
  numero_candidato: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  // eleccion_id se agrega automáticamente por la asociación
}, {
  tableName: 'candidatos',
});

module.exports = Candidato;