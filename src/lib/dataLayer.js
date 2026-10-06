// ============================================================
// Capa de datos. Las páginas llaman SOLO a estas funciones —
// nunca a Firestore directamente.
//
// Modelo (ver firestore.rules):
//   usuarios/{uid}    perfil del participante (rol inmutable)
//   config/evento     ventana de entregas y flags
//   cronograma/{dia}  días del bootcamp con sus charlas
//   retos/{rol}       un caso de estudio por rol
//   entregas/{uid}    una entrega por persona
//
// Todas son lecturas puntuales (getDoc/getDocs), sin listeners en tiempo
// real: en plan Spark cada lectura cuenta.
// ============================================================
import {
  doc, getDoc, getDocs, setDoc, collection, query, where, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase.js";

// ---- Perfil ----

export async function obtenerPerfil(uid) {
  const snap = await getDoc(doc(db, "usuarios", uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
}

// Las reglas exigen exactamente estos campos y que creadoEn sea la hora del
// servidor. El email se toma de la sesión, no de lo que la persona escribió.
export async function crearPerfil(user, { nombre, telefono, rol }) {
  const datos = {
    nombre: nombre.trim(),
    email: user.email,
    telefono,
    rol,
    aceptaPolitica: true,
    creadoEn: serverTimestamp(),
  };
  await setDoc(doc(db, "usuarios", user.uid), datos);
  return { uid: user.uid, ...datos, creadoEn: new Date() };
}

// ---- Contenido del evento ----

export async function obtenerConfigEvento() {
  const snap = await getDoc(doc(db, "config", "evento"));
  return snap.exists() ? snap.data() : null;
}

export async function obtenerCronograma() {
  const snap = await getDocs(collection(db, "cronograma"));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
}

// Antes de `visibleDesde` las reglas niegan la lectura: eso se devuelve
// como { bloqueado: true } en vez de un error.
export async function obtenerReto(rol) {
  try {
    const snap = await getDoc(doc(db, "retos", rol));
    return snap.exists() ? { bloqueado: false, ...snap.data() } : { bloqueado: true };
  } catch (err) {
    if (err?.code === "permission-denied") return { bloqueado: true };
    throw err;
  }
}

// ---- Entregas ----

export async function obtenerEntrega(uid) {
  const snap = await getDoc(doc(db, "entregas", uid));
  return snap.exists() ? snap.data() : null;
}

// Entrega definitiva: setDoc sobre un documento que no existe es una
// creación. Si ya existiera, las reglas lo rechazan (mientras
// permiteEditarEntrega sea false).
export async function enviarEntrega(uid, rol, { enlaceArtifact, queSoluciona, comoLoHizo }) {
  const datos = {
    enlaceArtifact: enlaceArtifact.trim(),
    queSoluciona: queSoluciona.trim(),
    comoLoHizo: comoLoHizo.trim(),
    rol,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  };
  await setDoc(doc(db, "entregas", uid), datos);
  return { ...datos, creadoEn: new Date(), actualizadoEn: new Date() };
}

// ---- Jurado (solo admins; las reglas bloquean el list() a los demás) ----

export async function listarEntregasPorRol(rol) {
  const q = query(collection(db, "entregas"), where("rol", "==", rol), orderBy("creadoEn", "asc"));
  const snap = await getDocs(q);
  const entregas = snap.docs.map(d => ({ uid: d.id, ...d.data() }));

  // Cruza cada entrega con el perfil de quien la envió (nombre, correo, celular).
  return Promise.all(entregas.map(async (entrega) => {
    let perfil = null;
    try {
      perfil = await obtenerPerfil(entrega.uid);
    } catch (err) {
      console.error("No se pudo leer el perfil de", entrega.uid, err);
    }
    return { ...entrega, perfil };
  }));
}
