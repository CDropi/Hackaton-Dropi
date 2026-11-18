import '../styles/componentes.css';

// Botón circular de vidrio para volver a la pantalla anterior.
// `flotante`: va absoluto sobre el contenido, respetando el notch.
export default function BotonRegresar({
  onClick,
  flotante = false,
  etiqueta = 'Regresar',
  icono = '/media/Atras.svg',
}) {
  return (
    <button
      type="button"
      className={`btn-regresar ${flotante ? 'btn-regresar--flotante' : ''}`}
      onClick={onClick}
      aria-label={etiqueta}
    >
      <img src={icono} alt="" />
    </button>
  );
}
