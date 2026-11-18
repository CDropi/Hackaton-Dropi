// Error que devuelven todas las funciones de api.js (y del modo simulado).
// `codigo` es el campo error.codigo del contrato de TI; la app decide qué
// mostrar con él. `campos` viene en los errores de validación (422).
export class ErrorApi extends Error {
  constructor(status, codigo, mensaje = '', campos = null) {
    super(mensaje || codigo);
    this.mensaje = mensaje;
    this.status = status;
    this.codigo = codigo;
    this.campos = campos;
  }
}

const MENSAJES = {
  sin_conexion: 'No hay conexión. Revisa tu internet y vuelve a intentarlo.',
  credenciales_invalidas: 'Correo o contraseña incorrectos.',
  demasiados_intentos: 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.',
  correo_registrado: 'Ya existe una cuenta con este correo. Inicia sesión.',
  cedula_registrada: 'Ya existe una cuenta con esta cédula.',
  no_es_usuario_dropi: 'No encontramos una cuenta activa de Dropi con ese correo e ID. Usa los datos de tu cuenta Dropi.',
  registro_cerrado: 'El registro no está abierto.',
  entregas_cerradas: 'Las entregas ya cerraron.',
  sin_sesion: 'Tu sesión terminó. Vuelve a iniciar sesión.',
  token_invalido: 'Este enlace ya no es válido. Pide uno nuevo desde la app.',
  archivos_incompletos: 'Uno de tus archivos no terminó de subir. Vuelve a enviar tu entrega.',
  version_no_existe: 'No se pudo cerrar tu entrega. Vuelve a enviarla.',
  nada_para_reutilizar: 'No tienes un video anterior. Sube tu video.',
  subida_fallida: 'No se pudo subir el archivo. Revisa tu conexión e intenta de nuevo.',
};

// Mensaje para la persona. En errores de validación usa el primer campo
// que señale el backend.
export function mensajeDeError(err) {
  if (err?.codigo === 'validacion' && err.campos) {
    const primero = Object.values(err.campos)[0];
    if (primero) return primero;
  }
  return MENSAJES[err?.codigo] || err?.mensaje || 'Ocurrió un error. Intenta de nuevo.';
}
