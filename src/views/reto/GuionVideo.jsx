import { VIDEO } from '../../data/guia.js';

// Guion de 60 segundos para el paso del video del formulario
export function GuionVideo() {
  return (
    <>
      <p className="guia-texto">{VIDEO.intro}</p>
      <ol className="guia-guion">
        {VIDEO.guion.map(g => (
          <li key={g.tiempo}>
            <span className="guia-guion-tiempo">{g.tiempo}</span>
            <span>{g.texto}</span>
          </li>
        ))}
      </ol>
    </>
  );
}
