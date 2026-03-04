const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Votante = sequelize.define('Votante', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cedula: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [6, 20],
    },
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: { isEmail: true },
  },
  habilitado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si puede votar o ya fue inhabilitado',
  },
  ya_voto: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Control para evitar doble voto',
  },
}, {
  tableName: 'votantes',
});

module.exports = Votante;