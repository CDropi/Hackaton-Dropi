// La hora "actual" de la app. Normalmente es la hora real; en modo prueba
// (PRUEBA en config.js) es la fecha simulada, que avanza a la par del reloj
// desde que se abrió la página.
//
// Ojo: esto solo cambia lo que MUESTRA y bloquea la app. Con la API real
// conectada, el backend de TI decide con la hora de su servidor.
import { PRUEBA, FECHAS } from '../config.js';

// "2026-12-14T12:00:00" en hora Colombia → Date
export const desdeColombia = (texto) => new Date(`${texto}-05:00`);

const momentoCarga = Date.now();

export const modoPrueba = Boolean(PRUEBA?.activo) && Date.now() < desdeColombia(PRUEBA.apagarDesde).getTime();

const fechaUrl = modoPrueba ? new URLSearchParams(window.location.search).get('fecha') : null;
const baseSimulada = modoPrueba ? desdeColombia(fechaUrl || PRUEBA.fechaSimulada).getTime() : NaN;

export function ahora() {
  if (!modoPrueba || Number.isNaN(baseSimulada)) return new Date();
  return new Date(baseSimulada + (Date.now() - momentoCarga));
}

// ---- Ventanas del concurso (FECHAS en config.js) ----

// 'antes' | 'abierto' | 'cerrado'. El registro abre en FECHAS.registroAbre
// y se cierra en FECHAS.cierre, junto con las entregas.
export function estadoRegistro(momento = ahora()) {
  if (momento < desdeColombia(FECHAS.registroAbre)) return 'antes';
  if (momento >= desdeColombia(FECHAS.cierre)) return 'cerrado';
  return 'abierto';
}

// true mientras se pueden enviar o editar entregas (hasta FECHAS.cierre)
export function entregasAbiertas(momento = ahora()) {
  return momento < desdeColombia(FECHAS.cierre);
}

// "lunes, 14 de diciembre, 11:59 p. m.": el último minuto en que se puede
// registrar o entregar, para mostrarlo en pantalla
export function ultimoMinuto() {
  return new Date(desdeColombia(FECHAS.cierre).getTime() - 60 * 1000);
}
