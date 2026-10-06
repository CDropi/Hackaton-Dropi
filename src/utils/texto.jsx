// Helpers de texto compartidos por las pantallas que muestran copy
// editable (config.js o Firestore).

// Convierte "texto **resaltado** normal" en JSX: las partes entre
// **asteriscos** quedan en <strong>, y cada \n se vuelve un salto de línea.
// Los párrafos separados por una línea en blanco (\n\n) se vuelven <p>.
export function conNegrillas(texto) {
  if (!texto) return texto;
  return texto.split('\n').map((linea, i, arr) => (
    <span key={i}>
      {linea.split(/\*\*(.+?)\*\*/g).map((parte, j) =>
        j % 2 === 1 ? <strong key={j}>{parte}</strong> : parte
      )}
      {i < arr.length - 1 && <br />}
    </span>
  ));
}

export function parrafos(texto, className) {
  if (!texto) return null;
  return String(texto).split(/\n\s*\n/).map((bloque, i) => (
    <p className={className} key={i}>{conNegrillas(bloque)}</p>
  ));
}
