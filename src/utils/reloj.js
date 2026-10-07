// La hora "actual" de la app. Normalmente es la hora real; en modo prueba
// (PRUEBA en config.js) es la fecha simulada, que avanza a la par del reloj
// desde que se abrió la página.
//
// Ojo: esto solo cambia lo que MUESTRA la app. Las reglas de Firestore
// siguen usando la hora real del servidor, por eso en modo prueba el reto y
// la entrega se simulan sin tocar Firestore (ver dataLayer.js).
import { PRUEBA } from '../config.js';

const desdeColombia = (texto) => new Date(`${texto}-05:00`).getTime();
const momentoCarga = Date.now();

export const modoPrueba = Boolean(PRUEBA?.activo) && Date.now() < desdeColombia(PRUEBA.apagarDesde);

const fechaUrl = modoPrueba ? new URLSearchParams(window.location.search).get('fecha') : null;
const baseSimulada = modoPrueba ? desdeColombia(fechaUrl || PRUEBA.fechaSimulada) : NaN;

export function ahora() {
  if (!modoPrueba || Number.isNaN(baseSimulada)) return new Date();
  return new Date(baseSimulada + (Date.now() - momentoCarga));
}
