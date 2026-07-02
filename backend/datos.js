// ============================================================================
//  Datos en memoria (simulados). En una app real esto vendria de una BD.
// ============================================================================

// --- Usuarios ---------------------------------------------------------------
// Las contrasenas NO se guardan en texto plano: se almacena el hash bcrypt.
// Los hashes de abajo se generaron con bcryptjs.hashSync(password, 10).
// Credenciales reales (documentadas en el README, NO en codigo de produccion):
//    usuario: admin     password: admin123
//    usuario: profesor  password: reservas123
const usuarios = [
  {
    usuario: 'admin',
    // admin123
    passwordHash: '$2a$10$qE0cxnPwBGqMOY8qWTztye11rg5lLGLMIEbjZnhIjmf18LKsKILc2',
    rol: 'administrador'
  },
  {
    usuario: 'profesor',
    // reservas123
    passwordHash: '$2a$10$kkfjuPz.7t28jT3gvdXEY.6AJulAn06hlPqAKP1ieFgJSDjLVw7jS',
    rol: 'docente'
  }
];

// --- Reservas (recurso protegido que devuelve GET /reservas) ----------------
const reservas = [
  {
    id: 1,
    espacio: 'Aula Magna A-101',
    responsable: 'Ana Torres',
    fecha: '2026-07-01',
    hora: '08:00',
    carrera: 'Ingenieria en Software'
  },
  {
    id: 2,
    espacio: 'Laboratorio de Computacion LC-201',
    responsable: 'Luis Pena',
    fecha: '2026-07-01',
    hora: '10:00',
    carrera: 'Ingenieria en Redes'
  },
  {
    id: 3,
    espacio: 'Sala de Conferencias B-305',
    responsable: 'Maria Vega',
    fecha: '2026-07-02',
    hora: '14:00',
    carrera: 'Diseno Grafico'
  },
  {
    id: 4,
    espacio: 'Laboratorio de Redes LR-102',
    responsable: 'Carlos Ruiz',
    fecha: '2026-07-03',
    hora: '16:00',
    carrera: 'Ingenieria en Redes'
  }
];

module.exports = { usuarios, reservas };
