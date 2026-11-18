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

// 'antes' | 'abierto' | 'cerrado'
export function estadoRegistro(momento = ahora()) {
  if (momento < desdeColombia(FECHAS.registroAbre)) return 'antes';
  if (momento > desdeColombia(FECHAS.registroCierra)) return 'cerrado';
  return 'abierto';
}

// true mientras se pueden enviar o editar entregas (hasta el cierre real,
// una hora después del que se anuncia)
export function entregasAbiertas(momento = ahora()) {
  return momento < desdeColombia(FECHAS.entregasCierreReal);
}
