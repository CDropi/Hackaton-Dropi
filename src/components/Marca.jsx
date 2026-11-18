import { LOGO_APP, EVENTO } from '../config.js';

// Logo de la Hackatón. Mientras LOGO_APP sea null en config.js, se dibuja
// el nombre en texto con la tipografía de títulos.
export default function Marca({ tamano = 'grande' }) {
  if (LOGO_APP) {
    return <img className={`marca-logo marca-logo--${tamano}`} src={LOGO_APP} alt={EVENTO.nombre} />;
  }
  return (
    <div className={`marca-texto marca-texto--${tamano}`} role="img" aria-label={EVENTO.nombre}>
      <span className="marca-texto-principal">Hackatón</span>
      <span className="marca-texto-sub">Dropi</span>
    </div>
  );
}
