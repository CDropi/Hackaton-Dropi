import { LOGO_APP, EVENTO } from '../config.js';

// Logo de la Hackatón en dos tamaños: 'grande' (acceso) y 'pequena'
export default function Marca({ tamano = 'grande' }) {
  return <img className={`marca-logo marca-logo--${tamano}`} src={LOGO_APP} alt={EVENTO.nombre} />;
}
