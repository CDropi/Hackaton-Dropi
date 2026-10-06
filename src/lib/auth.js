// ============================================================
// auth.js — Todo lo de Firebase Authentication.
// Las páginas llaman SOLO a estas funciones.
//
// Cambio frente a ExpoWinners: ya no hay "teléfono convertido en correo
// ficticio" ni Cloud Function para recuperar contraseña. Las personas se
// registran con su correo real, así que se usa el flujo nativo de Firebase
// (incluido sendPasswordResetEmail), que funciona en el plan Spark.
// ============================================================
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup,
  GoogleAuthProvider, sendPasswordResetEmail, signOut, onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./firebase.js";

export function getFirebaseAuth() {
  return auth;
}

// callback(user) se llama cada vez que cambia la sesión; user es null si no hay sesión.
export function onCambioSesion(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function registrarConCorreo(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

export async function iniciarSesionConCorreo(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

export async function iniciarSesionConGoogle() {
  const proveedor = new GoogleAuthProvider();
  proveedor.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(auth, proveedor);
  return cred.user;
}

// Con la protección contra enumeración activada, Firebase responde igual
// exista o no la cuenta, así que la app siempre muestra el mismo mensaje.
export async function enviarCorreoRecuperacion(email) {
  await sendPasswordResetEmail(auth, email.trim(), {
    url: window.location.origin, // a dónde vuelve la persona después de cambiarla
  });
}

export async function cerrarSesion() {
  await signOut(auth);
}

// true si la cuenta tiene el custom claim de admin (jurado). Se fuerza la
// renovación del token para que el permiso recién asignado se vea de una vez.
export async function esCuentaAdmin(user) {
  if (!user) return false;
  const resultado = await user.getIdTokenResult(true);
  return resultado.claims.admin === true;
}

// Google bloquea su inicio de sesión dentro de los navegadores internos de
// Instagram, Facebook, TikTok, etc. En esos casos se oculta el botón y se
// sugiere abrir la app en el navegador del celular.
export function esNavegadorInterno() {
  const ua = navigator.userAgent || "";
  return /Instagram|FBAN|FBAV|FB_IAB|TikTok|musical_ly|Line\/|Snapchat|LinkedInApp/i.test(ua);
}

// Traduce los códigos de error de Firebase a mensajes para la persona.
// Devuelve null cuando no hay que mostrar nada (ej. cerró la ventana de Google).
export function mensajeDeError(err) {
  const codigo = err?.code || "";
  switch (codigo) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Correo o contraseña incorrectos.";
    case "auth/email-already-in-use":
      return "Ya existe una cuenta con este correo. Inicia sesión.";
    case "auth/invalid-email":
      return "El correo no es válido.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 8 caracteres.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.";
    case "auth/network-request-failed":
    case "unavailable":
      return "No hay conexión. Revisa tu internet y vuelve a intentarlo.";
    case "auth/popup-blocked":
      return "Tu navegador bloqueó la ventana de Google. Permite ventanas emergentes e intenta de nuevo.";
    case "auth/account-exists-with-different-credential":
      return "Este correo ya está registrado con otro método. Ingresa con correo y contraseña.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return null;
    case "permission-denied":
      return "No tienes permiso para hacer esto.";
    default:
      return "Ocurrió un error. Intenta de nuevo.";
  }
}
