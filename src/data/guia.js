// ============================================================
// Textos del concurso que usa la pestaña Reto (encabezado, guion del video,
// cuestionario y aceptaciones). Admiten **negrillas** y \n.
// Las reglas completas están en la landing (URL_LANDING en config.js).
// ============================================================

export const INTRO_RETO = {
  titulo: "Resuelve un problema real de tu operación",
};

export const VIDEO = {
  intro: "Convence al jurado en un minuto. Se califica la idea y la claridad, no la producción, así que basta con tu celular.",
  guion: [
    { tiempo: "0 a 10 s", texto: "Quién eres y qué problema tenías" },
    { tiempo: "10 a 30 s", texto: "Tu solución funcionando" },
    { tiempo: "30 a 50 s", texto: "Qué mejora en tus órdenes entregadas" },
    { tiempo: "50 a 60 s", texto: "Por qué debería ganar" },
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

// Las cuatro aceptaciones del formulario. `id` = campo del contrato de TI.
export const ACEPTACIONES = [
  { id: "sin_datos_de_compradores", texto: "Mi entrega no muestra nombres, teléfonos, direcciones ni otros datos de compradores, ni llaves o accesos." },
  { id: "real_y_simulado_indicado", texto: "Indiqué con claridad qué funciona de verdad y qué está simulado." },
  { id: "disponible_final_en_vivo", texto: "Si quedo entre los ganadores, puedo conectarme al anuncio en vivo el 15 de diciembre a las 5:00 p. m. (hora Colombia)." },
  { id: "acepta_reglas_y_uso", texto: "Acepto las reglas del concurso y autorizo a Dropi a usar y mostrar mi video." },
];
