const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Eleccion = sequelize.define('Eleccion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'activa', 'finalizada'),
    defaultValue: 'pendiente',
  },
  activa: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'elecciones',
  validate: {
    fechasValidas() {
      if (this.fecha_fin <= this.fecha_inicio) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    },
  },
});

module.exports = Eleccion;