// Modelo que representa un espacio académico disponible para reserva
export interface Espacio {
  id: number;
  nombre: string;
  tipo: string;         // Aula, Laboratorio, Auditorio, etc.
  capacidad: number;
  disponible: boolean;
  ubicacion: string;    // Atributo agregado: ubicación física del espacio
  imagen: string;       // URL o ruta de imagen representativa
}

// Modelo para la reserva de un espacio (uso interno del formulario)
export interface Reserva {
  espacio: Espacio;
  responsable: string;
  fecha: string;
  hora: string;
  carrera: string;      // Carrera solicitante
}

// Modelo de la reserva tal como la devuelve el backend en GET /reservas
export interface ReservaApi {
  id: number;
  espacio: string;      // Aqui el backend envia el nombre del espacio como texto
  responsable: string;
  fecha: string;
  hora: string;
  carrera: string;
}

// Respuesta del backend al hacer POST /login
export interface LoginResponse {
  token: string;
}
