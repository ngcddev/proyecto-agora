const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Voto = sequelize.define('Voto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // candidato_id y votante_id y eleccion_id se agregan por las asociaciones
  ip_origen: {
    type: DataTypes.STRING(45), // IPv6 puede tener hasta 45 chars
    allowNull: true,
  },
  fecha_voto: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  hash_verificacion: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Hash único para auditoría del voto',
  },
}, {
  tableName: 'votos',
  // Un votante no puede votar dos veces en la misma elección
  indexes: [
    {
      unique: true,
      fields: ['votante_id', 'eleccion_id'],
      name: 'unique_voto_por_eleccion',
    },
  ],
});

module.exports = Voto;