// ============================================================
// Guía del concurso: textos del documento "Entrega Hackatón Dropi".
// Se muestran en la pestaña Reto. Admiten **negrillas** y \n.
// ============================================================

export const INTRO_RETO = {
  titulo: "Resuelve un problema real de tu operación",
  texto: "Elige un problema de tu día a día y resuélvelo con tu IA, el MCP de Dropi y tu propia cuenta. **No necesitas saber programar.** Puede ser un prompt, un artifact, un flujo o un programa. También puedes presentar una simulación con una buena idea.",
};

export const PASOS = [
  { titulo: "Inscríbete con tu cuenta Dropi", texto: "Entre el 4 y el 8 de diciembre." },
  {
    titulo: "Conecta el MCP a tu IA",
    texto: "En tu asistente entra a **Configuración → Conectores → Agregar conector personalizado**. Nombre `dropi-mcp` y URL `https://mcp.dropi.co/mcp`. Elige tu país, inicia sesión en `oauth.dropi.co` y autoriza.",
  },
  { titulo: "Aprende en el bootcamp", texto: "Lives en YouTube con líderes de comunidad: selección de productos, efectividad de órdenes, cuidado de campañas y cómo ahorrar en herramientas." },
  { titulo: "Construye tu solución", texto: "Elige un problema de tu día a día y resuélvelo con tu IA y tu propia cuenta." },
  { titulo: "Graba tu video de 60 segundos", texto: "Lo subes directo en la página de entrega." },
  { titulo: "Responde el cuestionario", texto: "Son cinco preguntas, una por cada criterio de calificación." },
  { titulo: "Entrega todo en esta página", texto: "Antes del 14 de diciembre a las 12:00 del mediodía. Puedes cambiar tu entrega hasta el cierre." },
  { titulo: "Si quedas finalista, presenta en vivo", texto: "Te avisamos por WhatsApp esa misma tarde. La sesión es a las 5:00 p. m. y muestras tu solución funcionando." },
];

export const ENTREGABLES = [
  { titulo: "El cuestionario", texto: "Cinco preguntas sobre el impacto de tu solución, el problema que resuelve, qué tiene de nuevo, cómo usa la IA y el MCP, y qué funciona hoy de verdad." },
  { titulo: "El video", texto: "Un pitch de máximo 60 segundos donde vendes tu solución al jurado." },
  { titulo: "La solución", texto: "Lo que construiste, de forma que el jurado pueda entenderlo. Incluye un ejemplo de lo que se le pide y el resultado esperado." },
];

export const VIDEO = {
  intro: "Convence al jurado en un minuto. Se califica la idea y la claridad, no la producción, así que basta con tu celular.",
  guion: [
    { tiempo: "0 a 10 s", texto: "Quién eres y qué problema tenías" },
    { tiempo: "10 a 30 s", texto: "Tu solución funcionando" },
    { tiempo: "30 a 50 s", texto: "Qué mejora en tus órdenes entregadas" },
    { tiempo: "50 a 60 s", texto: "Por qué debería ganar" },
  ],
  reglas: [
    { titulo: "Duración", texto: "Máximo 60 segundos." },
    { titulo: "Archivo", texto: "MP4 o MOV, hasta 200 MB." },
    { titulo: "Formato", texto: "Horizontal o vertical, en español. Máximo 1080p (Full HD). No se aceptan videos en 4K." },
    { titulo: "Música", texto: "No uses música con derechos de autor." },
    { titulo: "Qué no mostrar", texto: "Nombres, teléfonos o direcciones de compradores, llaves o accesos." },
    { titulo: "Permiso", texto: "Al entregarlo, autorizas a Dropi a usarlo y mostrarlo." },
  ],
};

// La clave `id` coincide con el campo del cuestionario en el contrato de TI
export const CRITERIOS = [
  {
    id: "impacto", peso: 35, nombre: "Impacto en órdenes efectivamente entregadas",
    pregunta: "¿Cuánto mejora tus órdenes entregadas?",
    ayuda: "Da una cifra de partida y una esperada, explica cómo la solución lleva a más entregas y cómo calculaste la estimación.",
  },
  {
    id: "problema", peso: 20, nombre: "Solución de un problema operativo real",
    pregunta: "¿Qué problema de tu operación resuelve?",
    ayuda: "Cuéntalo con tu operación: qué tan seguido pasa y cuánto te cuesta.",
  },
  {
    id: "innovacion", peso: 20, nombre: "Innovación y creatividad",
    pregunta: "¿Qué tiene de nuevo?",
    ayuda: "Qué hace distinto a lo que ya existe y por qué otros querrían copiarlo.",
  },
  {
    id: "ia_mcp", peso: 15, nombre: "Aplicación efectiva de IA y MCP",
    pregunta: "¿Cómo usa la IA y el MCP?",
    ayuda: "Qué herramientas del MCP usa, qué decide la IA y qué trabajo hace que antes hacía una persona.",
  },
  {
    id: "viabilidad", peso: 10, nombre: "Viabilidad, claridad y demostración",
    pregunta: "¿Qué funciona hoy de verdad?",
    ayuda: "Indica con claridad qué funciona de verdad y qué está simulado.",
  },
];

export const NOTA_CALIFICACION = "Una sola rúbrica para todos. La complejidad técnica no suma puntos. Una idea sencilla que funcione puede ganar.";

export const REGLAS = [
  "Usa únicamente los datos de tu propia cuenta.",
  "Tu entrega no puede mostrar nombres, teléfonos, direcciones ni otros datos de compradores.",
  "No publiques llaves, tokens ni accesos.",
  "No crees órdenes de prueba. Un pedido creado desde tu IA es real y se despacha.",
  "Si tu agente crea órdenes, una persona debe aprobar cada una antes.",
  "Indica con claridad qué funciona de verdad y qué está simulado.",
  "El video debe durar máximo 60 segundos, pesar máximo 200 MB y estar en 1080p o menos. No se aceptan videos en 4K.",
  "Los líderes de comunidad que dictan el bootcamp no pueden competir.",
  "Las entregas que incumplan estas reglas se retiran del concurso.",
];

export const TRUCO = {
  intro: "Cuando tu solución funcione, pega esto en tu IA. Te escribe lo que debes entregar.",
  prompt: "Resume lo que construimos para que otra persona pueda repetirlo con su propia cuenta de Dropi. Escribe: 1) las instrucciones completas, 2) los prompts en orden, 3) dos ejemplos de solicitud y el resultado esperado. No incluyas nombres, teléfonos, direcciones, números de orden ni datos de mi cuenta.",
};

// Las cuatro aceptaciones del formulario. `id` = campo del contrato de TI.
export const ACEPTACIONES = [
  { id: "sin_datos_de_compradores", texto: "Mi entrega no muestra nombres, teléfonos, direcciones ni otros datos de compradores, ni llaves o accesos." },
  { id: "real_y_simulado_indicado", texto: "Indiqué con claridad qué funciona de verdad y qué está simulado." },
  { id: "disponible_final_en_vivo", texto: "Si quedo finalista, puedo presentar en vivo el 14 de diciembre a las 5:00 p. m." },
  { id: "acepta_reglas_y_uso", texto: "Acepto las reglas del concurso y autorizo a Dropi a usar y mostrar mi video." },
];
