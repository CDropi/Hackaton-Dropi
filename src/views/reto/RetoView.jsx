import { useEffect, useState } from 'react';
import { FECHAS, URL_LANDING } from '../../config.js';
import { INTRO_RETO } from '../../data/guia.js';
import { fechaHoraEvento } from '../../utils/fechas.js';
import { ahora as horaActual, entregasAbiertas, desdeColombia, ultimoMinuto } from '../../utils/reloj.js';
import FormularioEntrega from './FormularioEntrega.jsx';
import EntregaResumen from './EntregaResumen.jsx';
import '../../styles/reto.css';

// Pestaña Reto. El tema es libre: cada persona elige un problema de su operación.
// Mientras las entregas están abiertas: encabezado, banner hacia la landing con
// las reglas y la entrega (formulario por pasos o la última versión enviada).
// Después del cierre: un mensaje según si la persona entregó o no.
export default function RetoView({ participante, entrega, error, onReintentar, onEntregaEnviada }) {
  const [editando, setEditando] = useState(false);
  const [ahora, setAhora] = useState(() => horaActual());

  useEffect(() => {
    const id = setInterval(() => setAhora(horaActual()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const abiertas = entregasAbiertas(ahora);
  const cierre = fechaHoraEvento(ultimoMinuto());

  // El anuncio de ganadores y la gala solo se muestran si todavía no han pasado
  const proximos = [
    { id: 'anuncio', titulo: 'Anuncio de ganadores en vivo', fecha: desdeColombia(FECHAS.anuncio) },
    { id: 'gala', titulo: 'Gala de premiación', fecha: desdeColombia(FECHAS.gala) },
  ].filter(e => e.fecha > ahora);

  return (
    <div className="reto">
      {abiertas ? (
        <>
          <header className="reto-encabezado">
            <h1 className="reto-titulo">{INTRO_RETO.titulo}</h1>
            <p className="reto-cierre">Cierre de entregas: <strong>{cierre}</strong> (hora Colombia)</p>
          </header>

          <section className="reto-banner">
            <div className="reto-banner-textos">
              <h2 className="reto-banner-titulo">Conoce las reglas del concurso</h2>
              <p className="reto-banner-texto">
                Antes de entregar, revisa cómo participar, qué debes entregar, cómo se califica y las reglas de uso.
              </p>
            </div>
            <a className="boton boton--primario reto-banner-boton" href={URL_LANDING} target="_blank" rel="noopener noreferrer">
              Ver reglas y detalles
            </a>
          </section>
        </>
      ) : (
        <header className="reto-encabezado">
          <h1 className="reto-titulo">Las entregas cerraron</h1>
          {entrega !== undefined && (
            <p className="reto-intro">
              {entrega
                ? <>Tu entrega quedó recibida. <strong>Gracias por participar.</strong> Si quedas finalista, te avisaremos por WhatsApp.</>
                : <>No alcanzaste a enviar tu solución esta vez. Gracias por ser parte de la Hackatón.</>}
            </p>
          )}
        </header>
      )}

      {error && (
        <div className="estado-vacio">
          <p>{error}</p>
          <button type="button" className="boton boton--secundario" onClick={onReintentar}>Reintentar</button>
        </div>
      )}
      {!error && entrega === undefined && <div className="cargando-bloque"><span className="spinner spinner--claro" /></div>}

      {!abiertas && entrega !== undefined && proximos.length > 0 && (
        <section className="reto-final">
          <h2 className="reto-banner-titulo">Lo que viene</h2>
          <ul className="reto-final-lista">
            {proximos.map(e => (
              <li key={e.id}>
                <strong>{e.titulo}:</strong> {fechaHoraEvento(e.fecha)} (hora Colombia)
              </li>
            ))}
          </ul>
        </section>
      )}

      {!error && entrega && !editando && (
        <EntregaResumen entrega={entrega} puedeEditar={abiertas} onEditar={() => setEditando(true)} />
      )}
      {!error && entrega !== undefined && abiertas && (!entrega || editando) && (
        <FormularioEntrega
          participante={participante}
          entregaAnterior={entrega}
          onCancelar={entrega ? () => setEditando(false) : null}
          onEnviada={(nueva) => { setEditando(false); onEntregaEnviada(nueva); }}
        />
      )}
    </div>
  );
}
