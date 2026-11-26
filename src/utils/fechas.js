// Helpers de fechas compartidos por Cronograma, Reto, Registro y Perfil.
//
// Las fechas del evento (días, cierre de entregas) se muestran SIEMPRE en
// hora Colombia, para que alguien en México no vea "domingo 24" cuando es
// el lunes 25 a medianoche en Bogotá. Las horas de los lives se muestran
// en la hora del dispositivo, para que cada quien sepa a qué hora conectarse.
const ZONA_EVENTO = "America/Bogota";

// "9:00 a. m." en la hora del dispositivo
export function horaLocal(fecha) {
  return new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit" }).format(fecha);
}

// Fecha en hora Colombia con las opciones que se pasen
export function fechaEvento(fecha, opciones) {
  return new Intl.DateTimeFormat("es-CO", { timeZone: ZONA_EVENTO, ...opciones }).format(fecha);
}

// "domingo 25 de octubre, 11:59 p. m." en hora Colombia
export function fechaHoraEvento(fecha) {
  return fechaEvento(fecha, { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });
}
