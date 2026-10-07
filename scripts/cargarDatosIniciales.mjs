// =====================================================================
//  Carga inicial de datos de la Hackatón en Firestore (Admin SDK).
//
//  Uso (en Google Cloud Shell, sin llave de servicio):
//    gcloud auth application-default login
//    gcloud auth application-default set-quota-project hackaton-dropi
//    npm run cargar-datos
//
//  // Uso anterior con llave de servicio (bloqueado por la política de la organización):
//  //   export GOOGLE_APPLICATION_CREDENTIALS="../credenciales/llave-servicio.json"
//  //   npm run cargar-datos
//
//  OJO: sobrescribe config/evento, cronograma/* y retos/*.
//  Si editaste algo desde la consola de Firebase, pásalo aquí antes de volver a correrlo.
// =====================================================================

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Con credenciales de usuario (Cloud Shell) hay que indicar el proyecto explícitamente
const ID_PROYECTO = 'hackaton-dropi';
// initializeApp({ credential: applicationDefault() });
initializeApp({ credential: applicationDefault(), projectId: ID_PROYECTO });
const db = getFirestore();

// Colombia es UTC-5 todo el año (sin horario de verano)
const fechaColombia = (texto) => Timestamp.fromDate(new Date(`${texto}-05:00`));

// ---------- Configuración del evento ----------
const config = {
  inicioEntregas: fechaColombia('2026-10-19T00:00:00'),
  // Las reglas usan "<", así que esto equivale al domingo 25 hasta las 23:59:59
  cierreEntregas: fechaColombia('2026-10-26T00:00:00'),
  // Entrega definitiva. Si luego se confirma que se puede editar, solo se cambia a true.
  permiteEditarEntrega: false,
};

// ---------- Cronograma del bootcamp ----------
// PENDIENTE: días, horarios, conferencistas y enlaces de Meet definitivos.
const cronograma = {
  dia1: {
    orden: 1,
    titulo: 'Día 1',
    fecha: fechaColombia('2026-10-19T00:00:00'),
    charlas: [
      {
        inicio: fechaColombia('2026-10-19T09:00:00'),
        fin: fechaColombia('2026-10-19T10:00:00'),
        conferencista: 'POR DEFINIR',
        tema: 'POR DEFINIR',
        enlaceMeet: '',
      },
    ],
  },
  dia2: {
    orden: 2,
    titulo: 'Día 2',
    fecha: fechaColombia('2026-10-20T00:00:00'),
    charlas: [
      {
        inicio: fechaColombia('2026-10-20T09:00:00'),
        fin: fechaColombia('2026-10-20T10:00:00'),
        conferencista: 'POR DEFINIR',
        tema: 'POR DEFINIR',
        enlaceMeet: '',
      },
    ],
  },
  dia3: {
    orden: 3,
    titulo: 'Día 3',
    fecha: fechaColombia('2026-10-21T00:00:00'),
    charlas: [
      {
        inicio: fechaColombia('2026-10-21T09:00:00'),
        fin: fechaColombia('2026-10-21T10:00:00'),
        conferencista: 'POR DEFINIR',
        tema: 'POR DEFINIR',
        enlaceMeet: '',
      },
    ],
  },
};

// ---------- Retos (uno por rol; el ID del documento ES el rol) ----------
// PENDIENTE: textos definitivos de cada caso de estudio.
const retos = {
  dropshipper: {
    titulo: 'POR DEFINIR',
    contexto: 'POR DEFINIR — explicación del caso de estudio para dropshippers.',
    reto: 'POR DEFINIR — qué deben resolver con su Artifact.',
    visibleDesde: fechaColombia('2026-10-19T08:00:00'),
  },
  proveedor: {
    titulo: 'POR DEFINIR',
    contexto: 'POR DEFINIR — explicación del caso de estudio para proveedores.',
    reto: 'POR DEFINIR — qué deben resolver con su Artifact.',
    visibleDesde: fechaColombia('2026-10-19T08:00:00'),
  },
  marca: {
    titulo: 'POR DEFINIR',
    contexto: 'POR DEFINIR — explicación del caso de estudio para dueños de marca.',
    reto: 'POR DEFINIR — qué deben resolver con su Artifact.',
    visibleDesde: fechaColombia('2026-10-19T08:00:00'),
  },
};

// ---------- Escritura en un solo lote ----------
const lote = db.batch();

lote.set(db.doc('config/evento'), config);
for (const [id, datos] of Object.entries(cronograma)) {
  lote.set(db.doc(`cronograma/${id}`), datos);
}
for (const [rol, datos] of Object.entries(retos)) {
  lote.set(db.doc(`retos/${rol}`), datos);
}

await lote.commit();
console.log('✔ Datos cargados: config/evento, cronograma (%d días), retos (%d)',
  Object.keys(cronograma).length, Object.keys(retos).length);
