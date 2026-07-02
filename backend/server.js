// ============================================================================
//  Backend minimo: Node + Express + jsonwebtoken + bcryptjs
//  Objetivo didactico: demostrar el flujo de autenticacion con JWT.
//
//  Flujo:
//   1) El cliente envia usuario + password a POST /login.
//   2) El backend valida con bcrypt y, si es correcto, EMITE un JWT (HS256).
//   3) El cliente guarda el token y lo envia en cada peticion protegida:
//        Authorization: Bearer <token>
//   4) El authMiddleware VALIDA el token antes de dejar pasar a GET /reservas.
// ============================================================================

// Carga las variables de entorno (.env) ANTES de usarlas. Asi JWT_SECRET
// nunca queda hardcodeado en el codigo fuente.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { usuarios, reservas } = require('./datos');
const authMiddleware = require('./authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Aviso temprano si falta el secreto (error de configuracion comun).
if (!JWT_SECRET) {
  console.error('ERROR: falta JWT_SECRET. Copia .env.example a .env y define el secreto.');
  process.exit(1);
}

// --- Middlewares globales ---------------------------------------------------
// CORS: permite el servidor de desarrollo de Angular y la version publicada
// en GitHub Pages (el backend sigue corriendo en localhost:3000).
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://romario1615.github.io'
  ]
}));
// Permite leer body JSON en req.body
app.use(express.json());

// ============================================================================
//  POST /login  -> emite el JWT
// ============================================================================
app.post('/login', async (req, res) => {
  const { usuario, password } = req.body || {};

  // Busca el usuario en memoria
  const encontrado = usuarios.find((u) => u.usuario === usuario);

  // Compara el password contra el hash bcrypt. Si el usuario no existe,
  // igual respondemos el MISMO mensaje generico para no revelar si fallo
  // el usuario o la contrasena (buena practica de seguridad).
  const passwordOk = encontrado
    ? await bcrypt.compare(password || '', encontrado.passwordHash)
    : false;

  if (!encontrado || !passwordOk) {
    return res.status(401).json({
      error: 'credenciales_invalidas',
      mensaje: 'Usuario o contrasena incorrectos.'
    });
  }

  // Credenciales correctas -> generamos el token.
  // Payload MINIMO: solo sub (usuario) y rol.
  // IMPORTANTE: el payload va en Base64, es LEGIBLE por cualquiera; por eso
  // nunca se incluyen contrasenas ni datos sensibles.
  const payload = { sub: encontrado.usuario, rol: encontrado.rol };

  const token = jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '30m' // expiracion de 30 minutos (claim exp)
  });

  // El login devuelve EXACTAMENTE { token: "..." }
  return res.json({ token });
});

// ============================================================================
//  GET /reservas  -> recurso PROTEGIDO
//  Solo se ejecuta si authMiddleware deja pasar (token valido).
// ============================================================================
app.get('/reservas', authMiddleware, (req, res) => {
  // req.usuario fue adjuntado por el middleware (datos del token).
  return res.json(reservas);
});

// ============================================================================
//  POST /reservas  -> crear una reserva (recurso PROTEGIDO)
//  Tambien exige token valido. Agrega la reserva en memoria y la devuelve.
// ============================================================================
app.post('/reservas', authMiddleware, (req, res) => {
  const { espacio, responsable, fecha, hora, carrera } = req.body || {};

  // Validacion minima de campos obligatorios
  if (!espacio || !responsable || !fecha || !hora) {
    return res.status(400).json({
      error: 'datos_incompletos',
      mensaje: 'Faltan campos obligatorios (espacio, responsable, fecha, hora).'
    });
  }

  const nueva = {
    id: reservas.length ? Math.max(...reservas.map((r) => r.id)) + 1 : 1,
    espacio,
    responsable,
    fecha,
    hora,
    carrera: carrera || ''
  };
  reservas.push(nueva);

  return res.status(201).json(nueva);
});

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});
