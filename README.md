# Gestión de Reservas con Autenticación JWT

App de gestión de reservas (Angular) protegida con **autenticación basada en tokens (JWT)**.
Proyecto académico para **demostrar el flujo de autenticación**: login → emisión de token →
envío del token en cada petición → validación en el backend → acceso al recurso protegido.

## Arquitectura

- **Backend** (`/backend`): Node + Express. **Emite y valida** el JWT (HS256) con
  `jsonwebtoken` y verifica contraseñas con `bcryptjs`.
- **Frontend** (Angular 19, standalone): **consume** el token (no genera ni valida firmas).
  Lo guarda, lo adjunta automáticamente con un interceptor y protege rutas con un guard.

```
gestion-reservas/
├── backend/                 # API Node + Express (JWT)
│   ├── server.js            # endpoints POST /login y GET /reservas
│   ├── authMiddleware.js    # validación centralizada del token
│   ├── datos.js             # usuarios (hash bcrypt) y reservas en memoria
│   ├── .env.example         # plantilla de variables (copiar a .env)
│   └── package.json
├── src/app/
│   ├── core/                # auth.service, auth.interceptor, auth.guard, api
│   ├── features/
│   │   ├── login/           # formulario de acceso (público)
│   │   ├── reservas/        # vista protegida que lista reservas del backend
│   │   └── espacios/        # pantalla de gestión existente (protegida)
│   └── ...
└── postman/                 # colección con las 4 requests de evidencia
```

## Requisitos previos

- Node.js 18+ (probado con v22)
- npm

## 1) Levantar el backend

```bash
cd backend
npm install
copy .env.example .env      # Windows  (Linux/Mac: cp .env.example .env)
npm start
```

Backend en **http://localhost:3000**.

> El secreto del JWT se carga desde `.env` (variable `JWT_SECRET`), **nunca** hardcodeado.
> `.env` está en `.gitignore`; solo se versiona `.env.example`.
> Nota: se usa `bcryptjs` (bcrypt en JS puro, sin compilación nativa) para evitar problemas
> de build en Windows; su API es equivalente a `bcrypt`.

## 2) Levantar el frontend

En otra terminal:

```bash
# desde la raíz del proyecto (gestion-reservas)
npm install
npm start                   # equivale a: ng serve
```

Frontend en **http://localhost:4200** (origen permitido por CORS en el backend).

## Credenciales de prueba

| Usuario    | Contraseña    | Rol            |
|------------|---------------|----------------|
| `admin`    | `admin123`    | administrador  |
| `profesor` | `reservas123` | docente        |

> Las contraseñas se guardan como **hash bcrypt** en `backend/datos.js`, nunca en texto plano.

## Flujo de autenticación (resumen)

1. El usuario envía usuario/contraseña a **`POST /login`**.
2. El backend valida con bcrypt. Si es correcto, **firma un JWT** (HS256) con payload mínimo
   (`sub` = usuario, `rol`) y expiración de **30 minutos**, y responde `{ "token": "..." }`.
   Si falla, responde **401** con mensaje genérico (no revela si falló usuario o contraseña).
3. El frontend guarda el token (en `localStorage` para la demo) mediante `AuthService`.
4. En cada petición saliente, el **interceptor** agrega el header
   `Authorization: Bearer <token>`.
5. **`GET /reservas`** está protegido por `authMiddleware`, que valida el token y maneja tres
   casos, todos con **401** y JSON limpio:
   - token **ausente**, token **inválido/firma mala**, token **expirado**.
6. En el frontend, el **guard** (`CanActivate`) bloquea las rutas protegidas sin token válido y
   redirige a `/login`; si una respuesta llega **401**, el interceptor limpia el token y
   redirige al login.

> Nota de seguridad: el **payload del JWT va en Base64 y es legible**; por eso no contiene
> contraseñas ni datos sensibles. Guardar el token en `localStorage` es cómodo pero vulnerable a
> XSS (ver comentario en `src/app/core/auth.service.ts`); alternativas: cookie httpOnly o memoria.

## Evidencias (Postman)

Importa `postman/JWT-Reservas.postman_collection.json`. Variables `{{baseUrl}}` y `{{token}}`.
Requests (ejecútalas en orden; el login guarda el token automáticamente):

1. **POST /login** → 200, guarda `{{token}}` con un test script.
2. **GET /reservas** con `Bearer {{token}}` → 200.
3. **GET /reservas** con token inválido → 401.
4. **GET /reservas** sin header `Authorization` → 401.

## Prueba rápida end-to-end

1. Backend y frontend levantados.
2. Abre `http://localhost:4200` → te redirige a `/login`.
3. Inicia sesión con `admin / admin123` → navega a `/reservas` y verás la lista del backend
   (en DevTools → Network puedes ver el header `Authorization: Bearer ...`).
4. Pulsa **Cerrar sesión** → limpia el token y vuelve al login.
5. Si borras/alteras el token en `localStorage` e intentas entrar a `/reservas`, el guard te
   devuelve al login.
