const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const AdminUsuario = sequelize.define('AdminUsuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  rol: {
    type: DataTypes.ENUM('superadmin', 'admin'),
    defaultValue: 'admin',
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'admin_usuarios',
  hooks: {
    // Hashea el password automáticamente antes de crear o actualizar
    beforeCreate: async (usuario) => {
      usuario.password = await bcrypt.hash(usuario.password, 12);
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password')) {
        usuario.password = await bcrypt.hash(usuario.password, 12);
      }
    },
  },
});

// Método de instancia para verificar password
AdminUsuario.prototype.verificarPassword = async function (passwordPlano) {
  return bcrypt.compare(passwordPlano, this.password);
};

module.exports = AdminUsuario;