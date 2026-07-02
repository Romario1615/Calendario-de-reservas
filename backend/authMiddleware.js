// ============================================================================
//  Middleware de autenticacion centralizado
// ----------------------------------------------------------------------------
//  Toda la logica de validacion del JWT vive AQUI (un solo lugar).
//  Las rutas protegidas solo tienen que agregar este middleware; no repiten
//  la validacion del token en cada endpoint.
// ============================================================================

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
  // 1) Leer el header "Authorization: Bearer <token>"
  const authHeader = req.headers['authorization'];

  // --- Caso A: token AUSENTE -------------------------------------------------
  // No vino el header, o no tiene el formato "Bearer <token>".
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'token_ausente',
      mensaje: 'No se proporciono un token. Usa el header Authorization: Bearer <token>.'
    });
  }

  // Extrae solo el token (lo que va despues de "Bearer ")
  const token = authHeader.substring('Bearer '.length).trim();

  try {
    // 2) Verifica firma + expiracion. Si algo falla, lanza una excepcion.
    const payload = jwt.verify(token, JWT_SECRET);

    // Exito: adjunta los datos del usuario a la request para las rutas siguientes
    req.usuario = payload; // { sub, rol, iat, exp }
    return next();

  } catch (error) {
    // --- Caso B: token EXPIRADO ----------------------------------------------
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'token_expirado',
        mensaje: 'El token expiro. Inicia sesion nuevamente.'
      });
    }

    // --- Caso C: token INVALIDO (firma incorrecta o formato corrupto) --------
    // jwt.verify lanza JsonWebTokenError para firma mala / token malformado.
    return res.status(401).json({
      error: 'token_invalido',
      mensaje: 'El token no es valido.'
    });
    // Nota: respondemos siempre JSON limpio, sin exponer el stack trace.
  }
}

module.exports = authMiddleware;
