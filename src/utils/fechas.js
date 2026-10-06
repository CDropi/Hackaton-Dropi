// Helpers de fechas compartidos por Cronograma, Reto, Perfil y Jurado.
//
// Las fechas del evento (días, cierre de entregas) se muestran SIEMPRE en
// hora Colombia, para que alguien en México no vea "domingo 24" cuando es
// el lunes 25 a medianoche en Bogotá. Las horas de las charlas se muestran
// en la hora del dispositivo, para que cada quien sepa a qué hora conectarse.
export const ZONA_EVENTO = "America/Bogota";

// Timestamp de Firestore | Date → Date (o null)
export function aFecha(valor) {
  if (!valor) return null;
  if (typeof valor.toDate === "function") return valor.toDate();
  return valor instanceof Date ? valor : null;
}

// "9:00 a. m." en la hora del dispositivo
export function horaLocal(fecha) {
  return new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit" }).format(fecha);
}

// "GMT-5", "GMT-6"... la zona del dispositivo, para aclararla en pantalla
export function zonaLocal() {
  const partes = new Intl.DateTimeFormat("es-CO", { timeZoneName: "short" }).formatToParts(new Date());
  return partes.find(p => p.type === "timeZoneName")?.value || "";
}

// Fecha en hora Colombia con las opciones que se pasen
export function fechaEvento(fecha, opciones) {
  return new Intl.DateTimeFormat("es-CO", { timeZone: ZONA_EVENTO, ...opciones }).format(fecha);
}

// "domingo 25 de octubre, 11:59 p. m." en hora Colombia
export function fechaHoraEvento(fecha) {
  return fechaEvento(fecha, { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });
}

// "2026-10-19" en hora Colombia, para comparar días sin líos de zona horaria
export function claveDiaEvento(fecha) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_EVENTO }).format(fecha);
}
