// ============================================================
// CONFIGURACIÓN — edita estos valores antes de publicar
// ============================================================

// 1) Config del proyecto Firebase de la Hackatón
//    (Firebase Console → Configuración del proyecto → Tus apps → Config)
//    ⚠️ Transcrita de una captura: verifica que coincida letra por letra
//    con la consola, sobre todo el apiKey.
export const firebaseConfig = {
  apiKey: "AIzaSyDludUwcyevSSVVmrK2bjYFXGmQ2ZUVc0U",
  authDomain: "hackaton-dropi.firebaseapp.com",
  projectId: "hackaton-dropi",
  storageBucket: "hackaton-dropi.firebasestorage.app",
  messagingSenderId: "299327003142",
  appId: "1:299327003142:web:a06ce3e372656998d28187",
  measurementId: "G-D6P1HK5W9K"
};

// 2) Datos generales del evento
export const EVENTO = {
  nombre: "Hackatón Dropi",
  fechas: "Del 19 al 25 de octubre de 2026",
};

// 3) Logo de la app. Mientras no exista el logo de la Hackatón queda en
//    null y la app dibuja el nombre en texto. Cuando lo tengan, colóquenlo
//    en /public/media y pongan la ruta, ej: "/media/Logo_Hackaton.png"
export const LOGO_APP = null;

// 4) Fondo de las pantallas
export const IMAGEN_FONDO = "/media/Fondo_Login.png";

// 5) Política de tratamiento de datos (se acepta al registrarse y se
//    consulta desde Perfil)
export const URL_POLITICA_DATOS = "https://dropi.co/politica-privacidad";

// 6) Roles de la competencia. El `id` debe coincidir EXACTAMENTE con los
//    valores que aceptan las reglas de Firestore ('dropshipper' | 'proveedor')
//    y con los ids de los documentos de la colección `retos`.
export const ROLES = [
  { id: "dropshipper", nombre: "Dropshipper", descripcion: "Vendo productos de proveedores en mi tienda." },
  { id: "proveedor", nombre: "Proveedor", descripcion: "Tengo productos y los ofrezco a dropshippers." },
];

// 7) Países para el indicativo del celular
export const PAISES = [
  { id: "CO", nombre: "Colombia", indicativo: "+57" },
  { id: "MX", nombre: "México", indicativo: "+52" },
  { id: "EC", nombre: "Ecuador", indicativo: "+593" },
  { id: "CL", nombre: "Chile", indicativo: "+56" },
  { id: "PE", nombre: "Perú", indicativo: "+51" },
  { id: "PA", nombre: "Panamá", indicativo: "+507" },
  { id: "GT", nombre: "Guatemala", indicativo: "+502" },
  { id: "PY", nombre: "Paraguay", indicativo: "+595" },
  { id: "AR", nombre: "Argentina", indicativo: "+54" },
];

// 8) Texto que se muestra mientras el reto todavía no se ha publicado.
//    La fecha real de publicación la controla `visibleDesde` en Firestore.
export const TEXTO_RETO_BLOQUEADO =
  "El caso de estudio se publica el **lunes 19 de octubre a las 8:00 a. m.** (hora Colombia).";
