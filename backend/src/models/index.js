const sequelize = require('../config/database');

const AdminUsuario = require('../models/AdminUsuario');
const Eleccion    = require('../models/Eleccion');
const Candidato   = require('../models/Candidato');
const Votante     = require('../models/Votante');
const Voto        = require('../models/Voto');

// Una elección tiene muchos candidatos
Eleccion.hasMany(Candidato, { foreignKey: 'eleccion_id', as: 'candidatos' });
Candidato.belongsTo(Eleccion, { foreignKey: 'eleccion_id', as: 'eleccion' });

// Una elección tiene muchos votos
Eleccion.hasMany(Voto, { foreignKey: 'eleccion_id', as: 'votos' });
Voto.belongsTo(Eleccion, { foreignKey: 'eleccion_id', as: 'eleccion' });

// Un candidato tiene muchos votos
Candidato.hasMany(Voto, { foreignKey: 'candidato_id', as: 'votos' });
Voto.belongsTo(Candidato, { foreignKey: 'candidato_id', as: 'candidato' });

// Un votante tiene muchos votos (por distintas elecciones)
Votante.hasMany(Voto, { foreignKey: 'votante_id', as: 'votos' });
Voto.belongsTo(Votante, { foreignKey: 'votante_id', as: 'votante' });

const db = {
  sequelize,
  AdminUsuario,
  Eleccion,
  Candidato,
  Votante,
  Voto,
};

module.exports = db;