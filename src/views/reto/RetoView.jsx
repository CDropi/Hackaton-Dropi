import { useEffect, useState } from 'react';
import { CATEGORIAS, FECHAS } from '../../config.js';
import { INTRO_RETO } from '../../data/guia.js';
import { conNegrillas } from '../../utils/texto.jsx';
import { fechaHoraEvento } from '../../utils/fechas.js';
import { ahora as horaActual, entregasAbiertas, desdeColombia } from '../../utils/reloj.js';
import Guia from './Guia.jsx';
import FormularioEntrega from './FormularioEntrega.jsx';
import EntregaResumen from './EntregaResumen.jsx';
import '../../styles/reto.css';

// Pestaña Reto. Ya no hay un caso asignado por categoría: el tema es libre.
// Tiene dos partes: la guía del concurso y la entrega (formulario o la
// última versión enviada).
export default function RetoView({ participante, entrega, error, onReintentar, onEntregaEnviada }) {
  const [vista, setVista] = useState(null); // 'guia' | 'entrega'
  const [editando, setEditando] = useState(false);
  const [ahora, setAhora] = useState(() => horaActual());

  useEffect(() => {
    const id = setInterval(() => setAhora(horaActual()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Si ya entregó, abre en su entrega; si no, en la guía
  useEffect(() => {
    if (vista === null && entrega !== undefined) setVista(entrega ? 'entrega' : 'guia');
  }, [entrega, vista]);

  const categoria = CATEGORIAS.find(c => c.id === participante.categoria)?.nombre;
  const abiertas = entregasAbiertas(ahora);
  const cierre = fechaHoraEvento(desdeColombia(FECHAS.entregasCierreVisible));

  return (
    <div className="reto">
      <header className="reto-encabezado">
        <span className="reto-rol">Categoría {categoria}</span>
        <h1 className="reto-titulo">{INTRO_RETO.titulo}</h1>
        <p className="reto-intro">{conNegrillas(INTRO_RETO.texto)}</p>
        <p className="reto-cierre">Cierre de entregas: <strong>{cierre}</strong> (hora Colombia)</p>
      </header>

      <div className="tabs-dias reto-pestanas" role="tablist" aria-label="Secciones del reto">
        <button type="button" role="tab" aria-selected={vista === 'guia'}
          className={`tab-dia ${vista === 'guia' ? 'tab-dia--activo' : ''}`} onClick={() => setVista('guia')}>
          <span className="tab-dia-titulo">Cómo participar</span>
        </button>
        <button type="button" role="tab" aria-selected={vista === 'entrega'}
          className={`tab-dia ${vista === 'entrega' ? 'tab-dia--activo' : ''}`} onClick={() => setVista('entrega')}>
          <span className="tab-dia-titulo">Mi entrega</span>
        </button>
      </div>

      {vista === 'guia' && <Guia onIrAEntrega={() => setVista('entrega')} />}

      {vista === 'entrega' && (
        <>
          {error && (
            <div className="estado-vacio">
              <p>{error}</p>
              <button type="button" className="boton boton--secundario" onClick={onReintentar}>Reintentar</button>
            </div>
          )}
          {!error && entrega === undefined && <div className="cargando-bloque"><span className="spinner spinner--claro" /></div>}

          {!error && entrega !== undefined && (
            <>
              {entrega && !editando && (
                <EntregaResumen entrega={entrega} puedeEditar={abiertas} onEditar={() => setEditando(true)} />
              )}
              {!entrega && !abiertas && (
                <div className="estado-vacio"><p>Las entregas ya cerraron y no alcanzaste a enviar la tuya.</p></div>
              )}
              {abiertas && (!entrega || editando) && (
                <FormularioEntrega
                  participante={participante}
                  entregaAnterior={entrega}
                  onCancelar={entrega ? () => setEditando(false) : null}
                  onEnviada={(nueva) => { setEditando(false); onEntregaEnviada(nueva); }}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
