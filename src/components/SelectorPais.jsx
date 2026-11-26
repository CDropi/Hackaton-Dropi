import { useEffect, useId, useRef, useState } from 'react';
import { PAISES } from '../config.js';

// Selector de país con bandera e indicativo.
// Las banderas son SVG locales en /public/media/banderas (paquete flag-icons,
// licencia MIT), así se ven iguales en Windows, Mac, Android y iPhone.
function rutaBandera(paisId) {
  return `/media/banderas/${paisId.toLowerCase()}.svg`;
}

export default function SelectorPais({ valor, onCambio }) {
  const [abierto, setAbierto] = useState(false);
  const [resaltado, setResaltado] = useState(0);
  const contenedorRef = useRef(null);
  const listaRef = useRef(null);
  const idLista = useId();
  const seleccionado = PAISES.find(p => p.id === valor) || PAISES[0];

  // Cerrar al tocar fuera
  useEffect(() => {
    if (!abierto) return;
    function alTocarFuera(e) {
      if (!contenedorRef.current?.contains(e.target)) setAbierto(false);
    }
    document.addEventListener('pointerdown', alTocarFuera);
    return () => document.removeEventListener('pointerdown', alTocarFuera);
  }, [abierto]);

  // Al abrir, resaltar el país actual y llevarlo a la vista
  useEffect(() => {
    if (!abierto) return;
    const indice = Math.max(0, PAISES.findIndex(p => p.id === valor));
    setResaltado(indice);
    requestAnimationFrame(() => {
      listaRef.current?.children[indice]?.scrollIntoView({ block: 'nearest' });
    });
  }, [abierto, valor]);

  function elegir(indice) {
    onCambio(PAISES[indice].id);
    setAbierto(false);
  }

  function moverResaltado(nuevo) {
    const indice = (nuevo + PAISES.length) % PAISES.length;
    setResaltado(indice);
    listaRef.current?.children[indice]?.scrollIntoView({ block: 'nearest' });
  }

  function alPresionarTecla(e) {
    if (!abierto) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        setAbierto(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); moverResaltado(resaltado + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moverResaltado(resaltado - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(resaltado); }
    else if (e.key === 'Escape' || e.key === 'Tab') { setAbierto(false); }
    else if (/^[a-zA-Z]$/.test(e.key)) {
      // Escribir una letra salta al primer país que empieza por ella
      const letra = e.key.toLowerCase();
      const indice = PAISES.findIndex(p => p.nombre.toLowerCase().startsWith(letra));
      if (indice >= 0) moverResaltado(indice);
    }
  }

  return (
    <div className="selector-pais" ref={contenedorRef}>
      <button
        type="button"
        className="campo-input selector-pais-boton"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={idLista}
        aria-label={`País: ${seleccionado.nombre} ${seleccionado.indicativo}`}
        aria-activedescendant={abierto ? `${idLista}-${resaltado}` : undefined}
        onClick={() => setAbierto(a => !a)}
        onKeyDown={alPresionarTecla}
      >
        <img className="selector-pais-bandera" src={rutaBandera(seleccionado.id)} alt="" />
        <span>{seleccionado.indicativo}</span>
        <img className="selector-pais-flecha" src="/media/Arrow.svg" alt="" />
      </button>

      {abierto && (
        <ul className="selector-pais-lista" role="listbox" id={idLista} ref={listaRef} aria-label="País">
          {PAISES.map((pais, i) => (
            <li
              key={pais.id}
              id={`${idLista}-${i}`}
              role="option"
              aria-selected={pais.id === valor}
              className={`selector-pais-opcion ${i === resaltado ? 'selector-pais-opcion--resaltada' : ''} ${pais.id === valor ? 'selector-pais-opcion--elegida' : ''}`}
              onPointerEnter={() => setResaltado(i)}
              onClick={() => elegir(i)}
            >
              <img className="selector-pais-bandera" src={rutaBandera(pais.id)} alt="" loading="lazy" />
              <span className="selector-pais-nombre">{pais.nombre}</span>
              <span className="selector-pais-indicativo">{pais.indicativo}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
