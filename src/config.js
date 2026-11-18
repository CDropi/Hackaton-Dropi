// ============================================================
// CONFIGURACIÓN — edita estos valores antes de publicar
// ============================================================

// 1) Conexión con el backend de TI (ver el documento "Hackatón Dropi:
//    especificación de servicios (API) para TI").
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
  fechas: "Del 4 al 14 de diciembre de 2026",
  // El \n marca dónde se parte la línea. En computador el ancho del logo se
  // iguala a la línea de texto más larga del panel, así que estos saltos
  // definen qué tan ancho se ve el logo.
  descripcion: "Usa IA y el MCP de Dropi para resolver\nun problema real de tu operación y\nconseguir más órdenes entregadas.",
  puntos: [
    { titulo: "Premio de 5MM por categoría", texto: "Dropshippers, proveedores y marcas propias." },
    { titulo: "Bootcamp en vivo por YouTube", texto: "Con líderes de la comunidad Dropi." },
    { titulo: "Cierre: 14 dic, 12:00 m", texto: "Final en vivo ese mismo día a las 5:00 p. m." },
  ],
};

// 3) Fechas del concurso, en hora Colombia. La app bloquea el registro y las
//    entregas con estas fechas; el backend de TI aplica las mismas.
//    - entregasCierreVisible: la hora que se anuncia (12:00 m).
//    - entregasCierreReal: la app acepta entregas hasta esta hora sin
//      anunciarlo (1:00 p. m.), como indica el documento del concurso.
export const FECHAS = {
  registroAbre: "2026-12-04T00:00:00",   // PENDIENTE: hora exacta del live de lanzamiento
  registroCierra: "2026-12-08T23:59:59",
  entregasCierreVisible: "2026-12-14T12:00:00",
  entregasCierreReal: "2026-12-14T13:00:00",
  final: "2026-12-14T17:00:00",
};

// 3) Logo de la app (en /public/media). Si se pone en null, la app dibuja
//    el nombre en texto.
export const LOGO_APP = "/media/Logo-Hackaton.png";

// 4) Fondos de las pantallas: uno vertical para celular y uno horizontal
//    para computador (desde 960 px de ancho, el mismo corte del diseño).
// export const IMAGEN_FONDO = "/media/Fondo_Login.png";
export const FONDOS = {
  movil: "/media/Fondo-Hackaton_Mobile.png",
  escritorio: "/media/Fondo-Hackaton_Desktop.png",
};

// 5) Política de tratamiento de datos (se acepta al registrarse y se
//    consulta desde Perfil)
export const URL_POLITICA_DATOS = "https://dropi.co/politica-privacidad";

// Términos y condiciones de la Hackatón (se aceptan al registrarse).
// PENDIENTE: poner el enlace real de los términos (legal). Por ahora apunta
// a la misma página de la política de datos.
// export const URL_TERMINOS = "";
export const URL_TERMINOS = URL_POLITICA_DATOS;

// 6) Categorías de la competencia. El `id` es el valor que se envía al
//    backend y debe coincidir EXACTAMENTE con el contrato de TI:
//    'dropshippers' | 'proveedores' | 'marcas_propias'.
//    (Antes eran los roles 'dropshipper' | 'proveedor' | 'marca' de Firestore.)
export const CATEGORIAS = [
  { id: "dropshippers", nombre: "Dropshipper", descripcion: "Vendo productos de proveedores en mi tienda." },
  { id: "proveedores", nombre: "Proveedor", descripcion: "Tengo productos y los ofrezco a dropshippers." },
  { id: "marcas_propias", nombre: "Marca propia", descripcion: "Vendo mi marca propia en mis canales y Dropi gestiona mis envíos." },
];

// 8) Cronograma del bootcamp: lives por YouTube.
//    PENDIENTE: fechas, horas, líderes y enlaces los confirman los líderes de
//    comunidad. Los temas salen del documento del concurso.
//    inicio y fin en hora Colombia. enlace vacío → "El enlace estará disponible pronto".
export const CRONOGRAMA = [
  {
    id: "dia1", titulo: "Día 1", fecha: "2026-12-09",
    charlas: [
      { inicio: "2026-12-09T10:00:00", fin: "2026-12-09T11:00:00", tema: "Selección de productos", conferencista: "Líder de comunidad (por definir)", enlace: "" },
    ],
  },
  {
    id: "dia2", titulo: "Día 2", fecha: "2026-12-10",
    charlas: [
      { inicio: "2026-12-10T10:00:00", fin: "2026-12-10T11:00:00", tema: "Efectividad de órdenes", conferencista: "Líder de comunidad (por definir)", enlace: "" },
      { inicio: "2026-12-10T15:00:00", fin: "2026-12-10T16:00:00", tema: "Cuidado de campañas", conferencista: "Líder de comunidad (por definir)", enlace: "" },
    ],
  },
  {
    id: "dia3", titulo: "Día 3", fecha: "2026-12-11",
    charlas: [
      { inicio: "2026-12-11T10:00:00", fin: "2026-12-11T11:00:00", tema: "Cómo ahorrar en herramientas", conferencista: "Líder de comunidad (por definir)", enlace: "" },
    ],
  },
];

// 9) Opciones del formulario de entrega (valores del contrato de TI)
export const TIPOS_SOLUCION = [
  { id: "prompt", nombre: "Prompt o instrucciones" },
  { id: "artifact", nombre: "Artifact o página" },
  { id: "asistente", nombre: "Proyecto de Claude, GPT o Gem" },
  { id: "flujo", nombre: "n8n, Make o Zapier" },
  { id: "codigo", nombre: "Python u otro código" },
  { id: "simulacion", nombre: "Simulación o idea" },
  { id: "otra", nombre: "Otra forma" },
];
export const IAS = [
  { id: "claude", nombre: "Claude" },
  { id: "chatgpt", nombre: "ChatGPT" },
  { id: "gemini", nombre: "Gemini" },
  { id: "otra", nombre: "Otra" },
];
// PENDIENTE (TI): lista oficial de herramientas del MCP. Estas salen de los
// ejemplos del documento; la persona también puede escribir otras.
export const HERRAMIENTAS_MCP = ["list_orders", "get_order", "create_order", "fingerprint"];
// PENDIENTE (TI): tipos de adjunto permitidos
export const ADJUNTOS_PERMITIDOS = [".json", ".zip", ".txt", ".md"];
// Versión de las reglas que se aceptan en la entrega
export const VERSION_REGLAS = "1.0";

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

// 10) MODO PRUEBA — para revisar la app como si ya fuera el evento.
//    Con `activo: true` la app usa `fechaSimulada` (hora Colombia) como la
//    hora actual: registro abierto o cerrado, cronograma "en vivo", ventana
//    de entregas. Muestra una franja amarilla arriba para que nadie lo confunda.
//    Se apaga solo desde `apagarDesde` (hora real), aunque `activo` quede en
//    true: así no puede seguir prendido durante el evento si se olvida.
//    Para probar otra fecha sin tocar este archivo: agrega a la URL
//    ?fecha=2026-12-14T13:30:00 (ej. para ver las entregas cerradas).
//    Ojo: con la API real conectada, el backend usa la hora real.
export const PRUEBA = {
  activo: true,
  fechaSimulada: "2026-12-05T10:00:00",  // registro y entregas abiertos
  apagarDesde: "2026-12-04T00:00:00",
};
