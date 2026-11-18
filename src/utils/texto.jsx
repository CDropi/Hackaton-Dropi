// Helpers de texto compartidos por las pantallas que muestran copy
// editable (config.js y data/guia.js).

// Convierte texto con marcas simples en JSX:
//   **resaltado** → <strong>   ·   `codigo` → <code>   ·   \n → salto de línea
export function conNegrillas(texto) {
  if (!texto) return texto;
  return texto.split('\n').map((linea, i, arr) => (
    <span key={i}>
      {linea.split(/(\*\*.+?\*\*|`.+?`)/g).map((parte, j) => {
        if (parte.startsWith('**') && parte.endsWith('**')) return <strong key={j}>{parte.slice(2, -2)}</strong>;
        if (parte.startsWith('`') && parte.endsWith('`')) return <code key={j}>{parte.slice(1, -1)}</code>;
        return parte;
      })}
      {i < arr.length - 1 && <br />}
    </span>
  ));
}

// Los párrafos separados por una línea en blanco (\n\n) se vuelven <p>.
export function parrafos(texto, className) {
  if (!texto) return null;
  return String(texto).split(/\n\s*\n/).map((bloque, i) => (
    <p className={className} key={i}>{conNegrillas(bloque)}</p>
  ));
}
