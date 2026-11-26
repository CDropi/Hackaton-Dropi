// ============================================================
// CONFIGURACIÓN — edita estos valores antes de publicar
// ============================================================

// 1) Conexión con el backend de TI (los servicios están en src/lib/api.js).
//    - urlBase vacía → la app funciona en MODO SIMULADO: guarda todo en el
//      navegador para poder diseñar y probar sin backend.
//    - sesion: "cookie" (recomendado, la API pone una cookie HttpOnly) o
//      "bearer" (la API devuelve un token y la app lo manda en cada solicitud).
export const API = {
  urlBase: "",            // ej: "https://api-hackaton.dropi.co/v1"
  sesion: "cookie",
};

// 2) Datos generales del evento (textos del inicio de sesión y registro)
export const EVENTO = {
  nombre: "Hackatón Dropi",
  fechas: "Del 4 al 14 de diciembre de 2026",   // en celular, debajo del logo
  // Puntos del panel de bienvenida (computador). En computador el ancho del
  // logo se iguala a la línea más larga de estos puntos.
  puntos: [
    { titulo: "Para usuarios de Dropi", texto: "Dropshippers, proveedores y marcas, en un solo concurso." },
    { titulo: "Bootcamp en vivo por YouTube", texto: "Lives para potenciar tu operación con el MCP." },
    { titulo: "Del 4 al 14 de diciembre de 2026", texto: "Registro y entregas hasta el 14 dic a la medianoche. Ganadores el 15 dic." },
  ],
};

// 3) Fechas del concurso, en hora Colombia. El backend de TI aplica las mismas.
//    - registroAbre: desde cuándo se puede registrar la gente.
//    - cierre: el 14 de diciembre a la medianoche se cierran el registro y
//      las entregas, sin hora extra. Se acepta hasta las 11:59:59 p. m.; a
//      las 12:00 a. m. del 15 ya no.
//    - anuncio: los ganadores se anuncian en un en vivo.
//    - gala: gala de premiación.
//    Después del cierre, la pestaña Reto muestra estas dos fechas mientras
//    no hayan pasado.
export const FECHAS = {
  registroAbre: "2026-12-04T00:00:00",   // PENDIENTE: hora exacta de apertura
  cierre: "2026-12-15T00:00:00",
  anuncio: "2026-12-15T17:00:00",
  gala: "2026-12-15T19:00:00",
};

// 4) Logo de la app (en /public/media)
export const LOGO_APP = "/media/Logo-Hackaton.png";

// 5) Fondos
//    - movil y escritorio: el fondo de cuadros, en inicio de sesión, registro
//      y páginas legales (vertical para celular, horizontal desde 960 px).
//    - app: el fondo de degradado, dentro de la app (Reto, Cronograma y
//      Perfil), en celular y en computador.
export const FONDOS = {
  movil: "/media/Fondo-Hackaton_Mobile.png",
  escritorio: "/media/Fondo-Hackaton_Desktop.png",
  app: "/media/Fondo-Hackaton_Desktop_2.png",
};

// 6) Enlaces: la landing del concurso (reglas, criterios, premios) y los
//    documentos legales, que son páginas propias de la app (textos en
//    src/data/terminos.js y src/data/politica.js)
export const URL_LANDING = "https://dropi.co/hackaton";
export const URL_TERMINOS = "/terminos-y-condiciones";
export const URL_POLITICA_DATOS = "/politica-de-datos";

// 7) Bootcamp: 4 lives por YouTube, uno por día, en hora Colombia.
//    - etiqueta: el texto junto a la hora en la tarjeta.
//    - foto: afiche del conferencista en /public/media/conferencistas, ya con
//      su marco gris, el borde naranja y los cuadros (proporción 1003 × 1305).
//      El nombre del archivo debe coincidir exacto, con mayúsculas; si no se
//      encuentra, la tarjeta muestra la inicial del nombre.
//    - enlace: live de YouTube (vacío → la tarjeta todavía no abre nada).
//    PENDIENTE: enlaces y hora de fin de cada live (se asumió 1 hora).
export const CRONOGRAMA = [
  {
    dia: 1, etiqueta: "Apertura",
    inicio: "2026-12-09T19:00:00", fin: "2026-12-09T20:00:00",
    conferencista: "Diwer", empresa: "Leyendas Ecom.",
    tema: "Cuidado de campañas con el MCP.",
    foto: "/media/conferencistas/Diwer.png", enlace: "",
  },
  {
    dia: 2, etiqueta: "Charla 2",
    inicio: "2026-12-10T19:00:00", fin: "2026-12-10T20:00:00",
    conferencista: "Fernando", empresa: "Golden Group",
    tema: "Efectividad y eficiencia de una orden con el MCP.",
    foto: "/media/conferencistas/Fernando.png", enlace: "",
  },
  {
    dia: 3, etiqueta: "Charla 3",
    inicio: "2026-12-11T19:00:00", fin: "2026-12-11T20:00:00",
    conferencista: "Esteban", empresa: "Hype",
    tema: "Elección de productos, oportunidades y optimización de página web.",
    foto: "/media/conferencistas/Esteban.png", enlace: "",
  },
  {
    dia: 4, etiqueta: "Cierre",
    inicio: "2026-12-12T12:00:00", fin: "2026-12-12T13:00:00",
    conferencista: "Jose", empresa: "Naicipa",
    tema: "¿Cómo ahorrar dinero en herramientas utilizando el MCP?",
    foto: "/media/conferencistas/Jose.png", enlace: "",
  },
];

// 8) Opciones del formulario de entrega (valores del contrato de TI)
export const TIPOS_SOLUCION = [
  { id: "prompt", nombre: "Prompt o instrucciones" },
  { id: "artifact", nombre: "Artifact o página" },
  { id: "asistente", nombre: "Proyecto de Claude, GPT o Gem" },
  { id: "flujo", nombre: "n8n, Make o Zapier" },
  { id: "codigo", nombre: "Python u otro código" },
  { id: "simulacion", nombre: "Simulación o idea" },
  { id: "otra", nombre: "Otra forma" },
];
// PENDIENTE (TI): tipos de adjunto permitidos
export const ADJUNTOS_PERMITIDOS = [".json", ".zip", ".txt", ".md"];
// Versión de las reglas que se aceptan en la entrega
export const VERSION_REGLAS = "1.0";

// 9) Países habilitados (numeral 4 de los Términos y Condiciones). El país
//    se determina por el indicativo del celular, así que la lista solo puede
//    tener estos 11 países. La bandera es /public/media/banderas/<id>.svg.
export const PAISES = [
  { id: "CO", nombre: "Colombia", indicativo: "+57" },
  { id: "MX", nombre: "México", indicativo: "+52" },
  { id: "PA", nombre: "Panamá", indicativo: "+507" },
  { id: "EC", nombre: "Ecuador", indicativo: "+593" },
  { id: "PE", nombre: "Perú", indicativo: "+51" },
  { id: "CL", nombre: "Chile", indicativo: "+56" },
  { id: "PY", nombre: "Paraguay", indicativo: "+595" },
  { id: "GT", nombre: "Guatemala", indicativo: "+502" },
  { id: "CR", nombre: "Costa Rica", indicativo: "+506" },
  { id: "VE", nombre: "Venezuela", indicativo: "+58" },
  { id: "AR", nombre: "Argentina", indicativo: "+54" },
];

// 10) Discord de participantes. Solo lo ven las personas con sesión.
//     - modo "automatico" (plan A): la persona autoriza en Discord y el
//       backend de TI la agrega al servidor (GET /discord/autorizar).
//     - modo "enlace" (plan B): el botón abre `enlace`, la invitación de
//       participantes, y el equipo aprueba cada solicitud en Discord. El
//       enlace queda en el código de la app: la invitación debe tener
//       aprobación manual y ningún permiso de administración.
//     - modo null o enlace vacío: no se muestra el botón.
//     `servidor` (opcional): enlace para abrir el servidor cuando ya está unido.
export const DISCORD = {
  modo: "automatico",
  enlace: "",       // PENDIENTE: invitación de participantes
  servidor: "",     // ej: "https://discord.com/channels/123456789"
};

// 11) MODO PRUEBA — para revisar la app como si ya fuera el evento.
//     Con `activo: true` la app usa `fechaSimulada` (hora Colombia) como la
//     hora actual y muestra una franja amarilla arriba. Se apaga sola desde
//     `apagarDesde` (hora real), aunque `activo` quede en true.
//     Otra fecha sin tocar este archivo: ?fecha=2026-12-14T13:30:00 en la URL.
//     Con la API real conectada, el backend usa la hora real.
export const PRUEBA = {
  activo: true,
  fechaSimulada: "2026-12-05T10:00:00",  // registro y entregas abiertos
  apagarDesde: "2026-12-04T00:00:00",
};
