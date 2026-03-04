const { sequelize, AdminUsuario, Eleccion, Candidato, Votante } = require('../models/index');

async function seed() {
  try {
    await sequelize.authenticate();
    // force: true elimina y recrea las tablas — solo para desarrollo
    await sequelize.sync({ force: true });
    console.log('✅ Tablas recreadas');

    // Admin por defecto
    await AdminUsuario.create({
      nombre: 'Super Admin',
      email: 'admin@voto.com',
      password: 'Admin1234!',
      rol: 'superadmin',
    });
    console.log('✅ Admin creado  →  admin@voto.com / Admin1234!');

    // Elección de prueba
    const eleccion = await Eleccion.create({
      titulo: 'Elecciones Presidenciales 2025',
      descripcion: 'Elección de prueba para el sistema de voto electrónico',
      fecha_inicio: new Date('2025-01-01'),
      fecha_fin: new Date('2025-12-31'),
      estado: 'activa',
      activa: true,
    });
    console.log('✅ Elección creada');

    // Candidatos de prueba
    await Candidato.bulkCreate([
      {
        nombre: 'Ana García López',
        partido: 'Partido Progresista',
        propuesta: 'Educación y tecnología para todos',
        numero_candidato: 1,
        eleccion_id: eleccion.id,
      },
      {
        nombre: 'Carlos Rodríguez Pérez',
        partido: 'Partido Democrático',
        propuesta: 'Seguridad y empleo como prioridad',
        numero_candidato: 2,
        eleccion_id: eleccion.id,
      },
      {
        nombre: 'María Torres Silva',
        partido: 'Partido Verde',
        propuesta: 'Medio ambiente y desarrollo sostenible',
        numero_candidato: 3,
        eleccion_id: eleccion.id,
      },
    ]);
    console.log('✅ Candidatos creados');

    // Votantes de prueba
    await Votante.bulkCreate([
      { cedula: '1001234567', nombre: 'Juan Pablo Mora', email: 'juan@test.com' },
      { cedula: '1007654321', nombre: 'Laura Sánchez Ruiz', email: 'laura@test.com' },
      { cedula: '1009876543', nombre: 'Pedro Jiménez Castro', email: 'pedro@test.com' },
    ]);
    console.log('✅ Votantes de prueba creados');

    console.log('\n🎉 Seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error.message);
    process.exit(1);
  }
}

seed();