// ============================================================
// api.js — Conexión con el backend de TI.
// Las pantallas llaman SOLO a estas funciones. Cada una corresponde a un
// servicio del documento "Hackatón Dropi: especificación de servicios
// (API) para TI".
//
// Con API.urlBase vacía (config.js) todo se resuelve con simulado.js, que
// guarda los datos en el navegador. Así se puede diseñar y probar sin backend.
// ============================================================
import { API } from '../config.js';
import { ErrorApi } from './errores.js';
import * as simulado from './simulado.js';

export { ErrorApi, mensajeDeError } from './errores.js';

export const modoSimulado = !API.urlBase;

// ---- Sesión con token Bearer (solo si API.sesion === "bearer") ----
// Con "cookie" la API maneja la sesión con una cookie HttpOnly y la app no
// guarda nada. Con "bearer" se asume que registro e ingreso responden un
// campo `token` (confirmar el nombre con TI).
const CLAVE_TOKEN = 'hk-token';
function leerToken() {
  try { return localStorage.getItem(CLAVE_TOKEN); } catch { return null; }
}
function guardarToken(token) {
  try {
    if (token) localStorage.setItem(CLAVE_TOKEN, token);
    else localStorage.removeItem(CLAVE_TOKEN);
  } catch { /* navegador sin almacenamiento: la sesión dura lo que la pestaña */ }
}

async function solicitud(metodo, ruta, cuerpo) {
  const headers = { Accept: 'application/json' };
  if (cuerpo !== undefined) headers['Content-Type'] = 'application/json';
  if (API.sesion === 'bearer') {
    const token = leerToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let respuesta;
  try {
    respuesta = await fetch(`${API.urlBase}${ruta}`, {
      method: metodo,
      headers,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      credentials: API.sesion === 'cookie' ? 'include' : 'same-origin',
    });
  } catch {
    throw new ErrorApi(0, 'sin_conexion');
  }

  if (respuesta.status === 204) return null;
  let datos = null;
  try { datos = await respuesta.json(); } catch { /* respuesta sin cuerpo */ }

  if (!respuesta.ok) {
    const e = datos?.error || {};
    throw new ErrorApi(respuesta.status, e.codigo || 'error', e.mensaje, e.campos);
  }
  if (API.sesion === 'bearer' && datos?.token) guardarToken(datos.token);
  return datos;
}

// ---- Cuenta ----

// datos: { nombre_contacto, nombre_negocio, cedula, correo, whatsapp, pais,
//          cuenta_dropi_id, categoria, password, aceptaciones } → participante
export async function registrar(datos) {
  if (modoSimulado) return simulado.registrar(datos);
  const r = await solicitud('POST', '/auth/registro', datos);
  return r.participante;
}

export async function ingresar(correo, password) {
  if (modoSimulado) return simulado.ingresar(correo, password);
  const r = await solicitud('POST', '/auth/ingreso', { correo, password });
  return r.participante;
}

export async function salir() {
  if (modoSimulado) return simulado.salir();
  try { await solicitud('POST', '/auth/salida'); } finally { guardarToken(null); }
}

// { participante, entrega: { version, recibido_en } | null } o null sin sesión
export async function obtenerSesion() {
  if (modoSimulado) return simulado.obtenerSesion();
  try {
    return await solicitud('GET', '/me');
  } catch (err) {
    if (err.status === 401) { guardarToken(null); return null; }
    throw err;
  }
}

export async function recuperarContrasena(correo) {
  if (modoSimulado) return simulado.recuperarContrasena(correo);
  await solicitud('POST', '/auth/recuperar', { correo });
}

export async function restablecerContrasena(token, password) {
  if (modoSimulado) return simulado.restablecerContrasena(token, password);
  await solicitud('POST', '/auth/restablecer', { token, password });
}

// ---- Entregas ----

// JSON de la última versión completa, o null
export async function obtenerEntregaActual() {
  if (modoSimulado) return simulado.obtenerEntregaActual();
  const r = await solicitud('GET', '/entregas/actual');
  return r.entrega;
}

// archivos: { video: {nombre_original, bytes, tipo} | {reutilizar:true},
//             adjuntos: [{nombre_original, bytes, tipo} | {reutilizar:"archivo"}] }
// → { version, expira_en, subidas: { video, adjuntos } }
export async function prepararVersion(archivos) {
  if (modoSimulado) return simulado.prepararVersion(archivos);
  return solicitud('POST', '/entregas/versiones', archivos);
}

// Sube un archivo directo a S3 con el enlace firmado. Usa XMLHttpRequest
// (y no fetch) porque es la forma de conocer el progreso de la subida.
// onProgreso recibe un número de 0 a 1.
export function subirArchivo(subida, archivo, onProgreso) {
  if (modoSimulado) return simulado.subirArchivo(subida, archivo, onProgreso);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(subida.metodo || 'PUT', subida.url);
    Object.entries(subida.encabezados || {}).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgreso?.(e.loaded / e.total); };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300)
      ? resolve()
      : reject(new ErrorApi(xhr.status, 'subida_fallida'));
    xhr.onerror = () => reject(new ErrorApi(0, 'subida_fallida'));
    xhr.send(archivo);
  });
}

// formulario: lo que escribe la persona + medidas del video (ver contrato)
// → JSON completo de la entrega
export async function confirmarVersion(version, formulario) {
  if (modoSimulado) return simulado.confirmarVersion(version, formulario);
  const r = await solicitud('POST', `/entregas/versiones/${version}/confirmar`, formulario);
  return r.entrega;
}
