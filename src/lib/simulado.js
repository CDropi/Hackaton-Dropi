// ============================================================
// simulado.js — Backend de mentiras para diseñar y probar sin TI.
// Imita el contrato de servicios y guarda todo en el localStorage de este
// navegador. Se usa solo cuando API.urlBase está vacía (config.js).
//
// Cuenta de prueba precargada (para no registrarse cada vez):
//   correo prueba@dropi.co · contraseña prueba1234
// Para probar casos de error:
//   - un correo de @nodropi.co → responde no_es_usuario_dropi
//   - Las fechas usan el reloj de la app (modo prueba incluido)
// Para empezar de cero: borrar las claves "hk-sim-*" del localStorage.
// ============================================================
import { ErrorApi } from './errores.js';
import { ahora, estadoRegistro, entregasAbiertas } from '../utils/reloj.js';

const CLAVES = {
  usuarios: 'hk-sim-usuarios',     // { [correo]: { hash, participante } }
  sesion: 'hk-sim-sesion',         // id_participante con sesión abierta
  entregas: 'hk-sim-entregas',     // { [id]: [entrega v1, v2, ...] }
  pendientes: 'hk-sim-pendientes', // { [id]: { version, video, adjuntos } }
  contador: 'hk-sim-contador',     // { [id]: última versión entregada o preparada }
};
const ALFABETO_ID = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

// Cuenta que existe siempre en el modo simulado, en cualquier navegador
export const CUENTA_PRUEBA = {
  correo: 'prueba@dropi.co',
  password: 'prueba1234',
  participante: {
    id_participante: 'HK-PRUEBA',
    nombre_contacto: 'Usuario de Prueba',
    correo: 'prueba@dropi.co',
    whatsapp: '+573000000000',
    pais: 'CO',
    registrado_en: '2026-12-04T15:00:00.000Z',
  },
};

const leer = (clave, def) => {
  try { return JSON.parse(localStorage.getItem(clave)) ?? def; } catch { return def; }
};
const escribir = (clave, valor) => localStorage.setItem(clave, JSON.stringify(valor));
const esperar = (ms) => new Promise(r => setTimeout(r, ms));

async function hash(texto) {
  const datos = new TextEncoder().encode(`hk-sim:${texto}`);
  const buffer = await crypto.subtle.digest('SHA-256', datos);
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// Crea la cuenta de prueba si este navegador todavía no la tiene
async function asegurarCuentaPrueba() {
  const usuarios = leer(CLAVES.usuarios, {});
  if (usuarios[CUENTA_PRUEBA.correo]) return;
  usuarios[CUENTA_PRUEBA.correo] = {
    hash: await hash(CUENTA_PRUEBA.password),
    participante: CUENTA_PRUEBA.participante,
  };
  escribir(CLAVES.usuarios, usuarios);
}

function nuevoId() {
  const usados = new Set(Object.values(leer(CLAVES.usuarios, {})).map(u => u.participante.id_participante));
  let id;
  do {
    id = 'HK-' + Array.from({ length: 6 }, () => ALFABETO_ID[Math.floor(Math.random() * ALFABETO_ID.length)]).join('');
  } while (usados.has(id));
  return id;
}

function participanteConSesion() {
  const id = leer(CLAVES.sesion, null);
  if (!id) throw new ErrorApi(401, 'sin_sesion');
  const usuario = Object.values(leer(CLAVES.usuarios, {})).find(u => u.participante.id_participante === id);
  if (!usuario) throw new ErrorApi(401, 'sin_sesion');
  return usuario.participante;
}

const ultimaEntrega = (id) => (leer(CLAVES.entregas, {})[id] || []).at(-1) || null;

// ---- Cuenta ----

export async function registrar(datos) {
  await esperar(500);
  await asegurarCuentaPrueba();
  if (estadoRegistro() !== 'abierto') throw new ErrorApi(403, 'registro_cerrado');
  if (datos.correo.trim().toLowerCase().endsWith('@nodropi.co')) throw new ErrorApi(403, 'no_es_usuario_dropi');

  const usuarios = leer(CLAVES.usuarios, {});
  const correo = datos.correo.trim().toLowerCase();
  if (usuarios[correo]) throw new ErrorApi(409, 'correo_registrado');

  const participante = {
    id_participante: nuevoId(),
    nombre_contacto: datos.nombre_contacto,
    correo,
    whatsapp: datos.whatsapp,
    pais: datos.pais,
    registrado_en: ahora().toISOString(),
  };
  // El backend guarda las aceptaciones con fecha y versión (numeral 6 de los Términos)
  usuarios[correo] = {
    hash: await hash(datos.password),
    participante,
    aceptaciones: { ...datos.aceptaciones, aceptado_en: ahora().toISOString() },
  };
  escribir(CLAVES.usuarios, usuarios);
  escribir(CLAVES.sesion, participante.id_participante);
  return participante;
}

export async function ingresar(correo, password) {
  await esperar(400);
  await asegurarCuentaPrueba();
  const usuario = leer(CLAVES.usuarios, {})[correo.trim().toLowerCase()];
  if (!usuario || usuario.hash !== await hash(password)) throw new ErrorApi(401, 'credenciales_invalidas');
  escribir(CLAVES.sesion, usuario.participante.id_participante);
  return usuario.participante;
}

export async function salir() {
  localStorage.removeItem(CLAVES.sesion);
}

export async function obtenerSesion() {
  await esperar(200);
  try {
    const participante = participanteConSesion();
    const ultima = ultimaEntrega(participante.id_participante);
    return {
      participante,
      entrega: ultima ? { version: ultima.version, recibido_en: ultima.recibido_en } : null,
    };
  } catch {
    return null;
  }
}

export async function recuperarContrasena() {
  await esperar(400); // siempre responde igual, exista o no la cuenta
}

export async function restablecerContrasena() {
  await esperar(400);
  throw new ErrorApi(400, 'token_invalido'); // el modo simulado no envía correos
}

// ---- Discord ----

// Simula todo el viaje por Discord: marca a la persona como unida y la
// devuelve a la app con ?discord=unido, como haría el backend de TI.
export async function iniciarDiscord() {
  await esperar(500);
  const { id_participante: id } = participanteConSesion();
  const usuarios = leer(CLAVES.usuarios, {});
  const usuario = Object.values(usuarios).find(u => u.participante.id_participante === id);
  if (usuario) usuario.participante.discord_unido = true;
  escribir(CLAVES.usuarios, usuarios);
  const url = new URL(window.location.href);
  url.searchParams.set('discord', 'unido');
  return url.toString();
}

// ---- Entregas ----

export async function obtenerEntregaActual() {
  await esperar(250);
  return ultimaEntrega(participanteConSesion().id_participante);
}

export async function prepararVersion({ video, adjuntos = [] }) {
  await esperar(300);
  const { id_participante: id } = participanteConSesion();
  if (!entregasAbiertas()) throw new ErrorApi(403, 'entregas_cerradas');
  const anterior = ultimaEntrega(id);
  if (video?.reutilizar && !anterior) throw new ErrorApi(409, 'nada_para_reutilizar');

  const contador = leer(CLAVES.contador, {});
  const version = (contador[id] || 0) + 1;
  contador[id] = version;
  escribir(CLAVES.contador, contador);

  const extension = (nombre) => (nombre.match(/\.[a-z0-9]+$/i)?.[0] || '').toLowerCase();
  const subidaVideo = video?.reutilizar
    ? { archivo: `${id}_v${version}_video${extension(anterior.video.archivo)}`, reutilizado: true }
    : { archivo: `${id}_v${version}_video${extension(video.nombre_original)}`, url: 'simulado://s3', metodo: 'PUT', encabezados: { 'Content-Type': video.tipo } };

  const subidasAdjuntos = adjuntos.map((a, i) => {
    const original = a.reutilizar ? anterior?.solucion.adjuntos.find(x => x.archivo.endsWith(a.reutilizar)) : null;
    const nombre = original ? original.nombre_original : a.nombre_original;
    return {
      archivo: `adjuntos/${id}_v${version}_adjunto_${i + 1}${extension(nombre)}`,
      ...(a.reutilizar ? { reutilizado: true } : { url: 'simulado://s3', metodo: 'PUT', encabezados: { 'Content-Type': a.tipo } }),
    };
  });

  const pendientes = leer(CLAVES.pendientes, {});
  pendientes[id] = { version, video, adjuntos, subidaVideo, subidasAdjuntos };
  escribir(CLAVES.pendientes, pendientes);

  return {
    version,
    expira_en: new Date(ahora().getTime() + 60 * 60 * 1000).toISOString(),
    subidas: { video: subidaVideo, adjuntos: subidasAdjuntos },
  };
}

export async function subirArchivo(_subida, archivo, onProgreso) {
  // Simula una subida que tarda según el tamaño (máximo unos 3 segundos)
  const pasos = 20;
  const duracion = Math.min(3000, 600 + archivo.size / 100000);
  for (let i = 1; i <= pasos; i++) {
    await esperar(duracion / pasos);
    onProgreso?.(i / pasos);
  }
}

export async function confirmarVersion(version, formulario) {
  await esperar(500);
  const participante = participanteConSesion();
  const id = participante.id_participante;
  if (!entregasAbiertas()) throw new ErrorApi(403, 'entregas_cerradas');
  const pendientes = leer(CLAVES.pendientes, {});
  const pendiente = pendientes[id];
  if (!pendiente || pendiente.version !== version) throw new ErrorApi(404, 'version_no_existe');
  const anterior = ultimaEntrega(id);

  const video = pendiente.video.reutilizar
    ? { ...anterior.video, archivo: pendiente.subidaVideo.archivo }
    : {
        archivo: pendiente.subidaVideo.archivo,
        bytes: pendiente.video.bytes,
        etag: '"simulado"',
        duracion_seg: formulario.video.duracion_seg,
        ancho: formulario.video.ancho,
        alto: formulario.video.alto,
        nombre_original: formulario.video.nombre_original,
      };

  const adjuntos = pendiente.adjuntos.map((a, i) => {
    const original = a.reutilizar ? anterior?.solucion.adjuntos.find(x => x.archivo.endsWith(a.reutilizar)) : null;
    return {
      archivo: pendiente.subidasAdjuntos[i].archivo,
      nombre_original: original ? original.nombre_original : a.nombre_original,
      bytes: original ? original.bytes : a.bytes,
      etag: '"simulado"',
    };
  });

  const entrega = {
    esquema: 'hackaton-dropi-entrega/1.0',
    id_participante: id,
    version,
    recibido_en: ahora().toISOString(),
    pais: participante.pais,
    titulo: formulario.titulo,
    descripcion: formulario.descripcion,
    cuestionario: formulario.cuestionario,
    video,
    solucion: { ...formulario.solucion, adjuntos },
    aceptaciones: formulario.aceptaciones,
  };

  const entregas = leer(CLAVES.entregas, {});
  entregas[id] = [...(entregas[id] || []), entrega];
  escribir(CLAVES.entregas, entregas);
  delete pendientes[id];
  escribir(CLAVES.pendientes, pendientes);
  return entrega;
}
