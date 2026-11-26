import '../styles/componentes.css';

// Botón de vidrio para volver a la pantalla anterior
export default function BotonRegresar({ onClick, etiqueta = 'Regresar' }) {
  return (
    <button type="button" className="btn-regresar" onClick={onClick} aria-label={etiqueta}>
      <img src="/media/Atras.svg" alt="" />
    </button>
  );
}
