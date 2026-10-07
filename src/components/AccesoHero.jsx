import { EVENTO } from '../config.js';
import Marca from './Marca.jsx';

// Panel izquierdo de las pantallas de acceso. Solo se muestra en
// computador (ver .acceso-hero en ingreso.css); en celular la tarjeta del
// formulario ya trae su propio logo.
export default function AccesoHero() {
  return (
    <aside className="acceso-hero">
      <Marca />
      <p className="acceso-hero-fechas">{EVENTO.fechas}</p>
      <p className="acceso-hero-descripcion">{EVENTO.descripcion}</p>
      <ul className="acceso-hero-puntos">
        {EVENTO.puntos.map((punto, i) => (
          <li key={punto.titulo} className="acceso-hero-punto">
            <span className="acceso-hero-numero">{String(i + 1).padStart(2, '0')}</span>
            <span>
              <strong>{punto.titulo}</strong>
              <span className="acceso-hero-punto-texto">{punto.texto}</span>
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
