import { useState } from 'react';
import {
  PASOS, ENTREGABLES, VIDEO, CRITERIOS, NOTA_CALIFICACION, REGLAS, TRUCO,
} from '../../data/guia.js';
import { conNegrillas } from '../../utils/texto.jsx';

// Guía del concurso (textos en data/guia.js). Cada bloque se abre y se
// cierra para que la página no sea un muro de texto; "Cómo participar"
// viene abierto.
export default function Guia({ onIrAEntrega }) {
  return (
    <div className="guia">
      <Bloque titulo="Cómo participar" abierto>
        <ol className="guia-pasos">
          {PASOS.map((paso, i) => (
            <li key={paso.titulo} className="guia-paso">
              <span className="guia-paso-numero">{i + 1}</span>
              <div>
                <h3 className="guia-paso-titulo">{paso.titulo}</h3>
                <p className="guia-texto">{conNegrillas(paso.texto)}</p>
              </div>
            </li>
          ))}
        </ol>
      </Bloque>

      <Bloque titulo="Qué debes entregar">
        <p className="guia-texto">Tres cosas, todas en la misma página.</p>
        <div className="guia-tarjetas">
          {ENTREGABLES.map(e => (
            <div key={e.titulo} className="guia-tarjeta">
              <h3 className="guia-paso-titulo">{e.titulo}</h3>
              <p className="guia-texto">{e.texto}</p>
            </div>
          ))}
        </div>
      </Bloque>

      <Bloque titulo="Tu video de 60 segundos">
        <GuionVideo />
        <dl className="guia-reglas-video">
          {VIDEO.reglas.map(r => (
            <div key={r.titulo}>
              <dt>{r.titulo}</dt>
              <dd>{r.texto}</dd>
            </div>
          ))}
        </dl>
      </Bloque>

      <Bloque titulo="Cómo se califica">
        <p className="guia-texto">{NOTA_CALIFICACION}</p>
        <ul className="guia-criterios">
          {CRITERIOS.map(c => (
            <li key={c.id} className="guia-criterio">
              <div className="guia-criterio-fila">
                <span>{c.nombre}</span>
                <strong>{c.peso}%</strong>
              </div>
              <span className="guia-criterio-barra"><span style={{ width: `${c.peso / 35 * 100}%` }} /></span>
            </li>
          ))}
        </ul>
      </Bloque>

      <Bloque titulo="Reglas de uso">
        <p className="guia-texto">Trabajas con tu cuenta real, así que estas reglas protegen a tus compradores y a tu negocio.</p>
        <ul className="guia-lista">
          {REGLAS.map(regla => <li key={regla}>{regla}</li>)}
        </ul>
      </Bloque>

      <Bloque titulo="Un truco para terminar">
        <p className="guia-texto">{TRUCO.intro}</p>
        <TextoCopiable texto={TRUCO.prompt} />
      </Bloque>

      <button type="button" className="boton boton--primario guia-cta" onClick={onIrAEntrega}>
        Ir a mi entrega
      </button>
    </div>
  );
}

// También se usa en el paso del video del formulario
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

function Bloque({ titulo, abierto = false, children }) {
  return (
    <details className="guia-bloque" open={abierto}>
      <summary className="guia-bloque-titulo">{titulo}</summary>
      <div className="guia-bloque-cuerpo">{children}</div>
    </details>
  );
}

function TextoCopiable({ texto }) {
  const [copiado, setCopiado] = useState(false);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }
  return (
    <div className="guia-copiable">
      <p>{texto}</p>
      <button type="button" className="boton boton--secundario boton--compacto" onClick={copiar}>
        {copiado ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
}
