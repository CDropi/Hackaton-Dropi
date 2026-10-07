// 1) Config del proyecto Firebase de la Hackatón
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
  // Textos del panel izquierdo de inicio de sesión y registro (solo computador)
  descripcion: "Una semana para resolver un caso real de tu negocio creando un Artifact con Claude.",
  puntos: [
    { titulo: "Bootcamp en vivo", texto: "Charlas por Google Meet para arrancar con todo." },
    { titulo: "Un reto por perfil", texto: "Un caso distinto para cada tipo de negocio." },
    { titulo: "Un ganador por categoría", texto: "Gana el mejor Artifact de cada perfil." },
  ],
};

// 3) Logo de la app. Cuando lo tengan, colóquenlo
//    en /public/media y pongan la ruta, ej: "/media/Logo_Hackaton.png"
export const LOGO_APP = null;

// 4) Fondo de las pantallas
export const IMAGEN_FONDO = "/media/Fondo_Login.png";

// 5) Política de tratamiento de datos (se acepta al registrarse y se
//    consulta desde Perfil)
export const URL_POLITICA_DATOS = "https://dropi.co/politica-privacidad";

// 6) Roles de la competencia. El `id` debe coincidir EXACTAMENTE con los
//    valores que aceptan las reglas de Firestore ('dropshipper' | 'proveedor' | 'marca')
//    y con los ids de los documentos de la colección `retos`.
export const ROLES = [
  { id: "dropshipper", nombre: "Dropshipper", descripcion: "Vendo productos de proveedores en mi tienda." },
  { id: "proveedor", nombre: "Proveedor", descripcion: "Tengo productos y los ofrezco a dropshippers." },
  // { id: "marca", nombre: "Marca", descripcion: "Tengo mis propios productos y los ofrezco a clientes." }
  { id: "marca", nombre: "Marca", descripcion: "Vendo mi marca propia en mis canales y Dropi gestiona mis envíos." }
];

// 7) Países para el indicativo del celular. La bandera se toma de
//    /public/media/banderas/<id en minúscula>.svg (ej: CO → co.svg).
//    Si agregan un país nuevo, agreguen también su bandera en esa carpeta
//    (se descargan del paquete flag-icons, carpeta flags/4x3).
export const PAISES = [
  { id: "CO", nombre: "Colombia", indicativo: "+57" },
  { id: "MX", nombre: "México", indicativo: "+52" },
  { id: "PA", nombre: "Panamá", indicativo: "+507" },
  { id: "EC", nombre: "Ecuador", indicativo: "+593" },
  { id: "PE", nombre: "Perú", indicativo: "+51" },
  { id: "CL", nombre: "Chile", indicativo: "+56" },
  { id: "PY", nombre: "Paraguay", indicativo: "+595" },
  { id: "VE", nombre: "Venezuela", indicativo: "+58" },
  { id: "AR", nombre: "Argentina", indicativo: "+54" },
  { id: "GT", nombre: "Guatemala", indicativo: "+502" },
  { id: "CR", nombre: "Costa Rica", indicativo: "+506" },
  { id: "ES", nombre: "España", indicativo: "+34" },
  { id: "PT", nombre: "Portugal", indicativo: "+351" },
  { id: "RO", nombre: "Rumania", indicativo: "+40" },
  { id: "PL", nombre: "Polonia", indicativo: "+48" },
  { id: "HU", nombre: "Hungría", indicativo: "+36" },
  { id: "SI", nombre: "Eslovenia", indicativo: "+386" },
  { id: "SK", nombre: "Eslovaquia", indicativo: "+421" },
  // { id: "HR", nombre: "Croacia", indicativo: "+358" },  ← +358 es Finlandia
  { id: "HR", nombre: "Croacia", indicativo: "+385" },
  { id: "GR", nombre: "Grecia", indicativo: "+30" },
  { id: "BG", nombre: "Bulgaria", indicativo: "+359" },
  { id: "CZ", nombre: "República Checa", indicativo: "+420" }
];

// 8) Texto que se muestra mientras el reto todavía no se ha publicado.
//    La fecha real de publicación la controla `visibleDesde` en Firestore.
export const TEXTO_RETO_BLOQUEADO =
  "El caso de estudio se publica el **lunes 19 de octubre a las 8:00 a. m.** (hora Colombia).";

// 9) MODO PRUEBA — para revisar la app como si ya fuera el día del evento.
//    Con `activo: true` la app:
//    - usa `fechaSimulada` (hora Colombia) como la hora actual: cronograma
//      "en vivo", ventana de entregas, día que se abre por defecto
//    - muestra un reto de ejemplo (src/data/retosPrueba.js) mientras el
//      reto real siga bloqueado por las reglas de Firestore
//    - NO guarda entregas: la entrega se ve como enviada pero no se escribe
//    - muestra una franja amarilla arriba para que nadie lo confunda
//    Se apaga solo desde `apagarDesde` (hora real), aunque `activo` quede en
//    true: así no puede seguir prendido durante el evento si se olvida.
//    Para probar otra fecha sin tocar este archivo: agrega a la URL
//    ?fecha=2026-10-26T00:30:00 (ej. para ver las entregas cerradas).
export const PRUEBA = {
  activo: true,
  fechaSimulada: "2026-10-19T09:30:00",
  apagarDesde: "2026-10-19T00:00:00",
};
