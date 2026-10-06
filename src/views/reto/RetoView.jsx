import { useEffect, useState } from 'react';
import { ROLES, TEXTO_RETO_BLOQUEADO } from '../../config.js';
import { enviarEntrega } from '../../lib/dataLayer.js';
import { aFecha, fechaHoraEvento } from '../../utils/fechas.js';
import { conNegrillas, parrafos } from '../../utils/texto.jsx';
import '../../styles/reto.css';

// Mismos límites que las reglas de Firestore (contenidoEntregaValido)
const LIMITES = {
  enlace: 300,
  queSolucionaMin: 30, queSolucionaMax: 2000,
  comoLoHizoMin: 30, comoLoHizoMax: 3000,
};
const PATRON_ENLACE = /^https:\/\/claude\.ai\/[A-Za-z0-9._~/?=&%-]+$/;

// 'antes' | 'abierta' | 'cerrada' según la ventana de config/evento
function estadoVentana(config, ahora) {
  const inicio = aFecha(config?.inicioEntregas);
  const cierre = aFecha(config?.cierreEntregas);
  if (!inicio || !cierre) return 'cerrada';
  if (ahora < inicio) return 'antes';
  if (ahora >= cierre) return 'cerrada';
  return 'abierta';
}

// El cierre se guarda como "lunes 00:00"; se muestra como "domingo 11:59 p. m."
function textoCierre(config) {
  const cierre = aFecha(config?.cierreEntregas);
  return cierre ? fechaHoraEvento(new Date(cierre.getTime() - 60 * 1000)) : '';
}

export default function RetoView({ perfil, reto, entrega, config, error, onReintentar, onEntregaEnviada }) {
  const nombreRol = ROLES.find(r => r.id === perfil.rol)?.nombre || perfil.rol;

  if (error) {
    return (
      <div className="reto">
        <div className="estado-vacio">
          <p>{error}</p>
          <button type="button" className="boton boton--secundario" onClick={onReintentar}>Reintentar</button>
        </div>
      </div>
    );
  }

  if (reto === undefined || entrega === undefined) {
    return <div className="reto"><div className="cargando-bloque"><span className="spinner spinner--claro" /></div></div>;
  }

  if (reto.bloqueado) {
    return (
      <div className="reto">
        <div className="reto-bloqueado">
          <img className="reto-bloqueado-codi" src="/media/Codi_Web.png" alt="" />
          <span className="reto-rol">Reto {nombreRol}</span>
          <h1 className="reto-bloqueado-titulo">Tu reto viene en camino</h1>
          <p className="reto-bloqueado-texto">{conNegrillas(TEXTO_RETO_BLOQUEADO)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reto">
      <header className="reto-encabezado">
        <span className="reto-rol">Reto {nombreRol}</span>
        <h1 className="reto-titulo">{reto.titulo}</h1>
      </header>

      <section className="reto-seccion">
        <h2 className="reto-seccion-titulo">El caso</h2>
        {parrafos(reto.contexto, 'reto-parrafo')}
      </section>

      <section className="reto-seccion reto-seccion--destacada">
        <h2 className="reto-seccion-titulo">Tu reto</h2>
        {parrafos(reto.reto, 'reto-parrafo')}
      </section>

      <SeccionEntrega perfil={perfil} entrega={entrega} config={config} onEntregaEnviada={onEntregaEnviada} />
    </div>
  );
}

function SeccionEntrega({ perfil, entrega, config, onEntregaEnviada }) {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (entrega) return <EntregaEnviada entrega={entrega} />;

  const ventana = estadoVentana(config, ahora);

  return (
    <section className="entrega">
      <h2 className="entrega-titulo">Tu entrega</h2>

      {ventana === 'antes' && (
        <p className="entrega-texto">
          Las entregas abren el {fechaHoraEvento(aFecha(config.inicioEntregas))} (hora Colombia).
        </p>
      )}

      {ventana === 'cerrada' && (
        <p className="entrega-texto">Las entregas ya cerraron. No alcanzaste a enviar la tuya.</p>
      )}

      {ventana === 'abierta' && (
        <FormularioEntrega perfil={perfil} cierre={textoCierre(config)} onEntregaEnviada={onEntregaEnviada} />
      )}
    </section>
  );
}

function FormularioEntrega({ perfil, cierre, onEntregaEnviada }) {
  const [enlace, setEnlace] = useState('');
  const [queSoluciona, setQueSoluciona] = useState('');
  const [comoLoHizo, setComoLoHizo] = useState('');
  const [error, setError] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Valida lo mismo que las reglas, para explicar el problema antes de enviar
  function validar() {
    const e = enlace.trim();
    if (!PATRON_ENLACE.test(e) || e.length > LIMITES.enlace) {
      return 'El enlace debe ser el enlace público de tu Artifact y empezar por https://claude.ai/';
    }
    if (queSoluciona.trim().length < LIMITES.queSolucionaMin) {
      return `Cuéntanos qué soluciona tu Artifact (mínimo ${LIMITES.queSolucionaMin} caracteres).`;
    }
    if (comoLoHizo.trim().length < LIMITES.comoLoHizoMin) {
      return `Cuéntanos cómo lo hiciste (mínimo ${LIMITES.comoLoHizoMin} caracteres).`;
    }
    return '';
  }

  function handleRevisar(e) {
    e.preventDefault();
    const mensaje = validar();
    setError(mensaje);
    if (!mensaje) setConfirmando(true);
  }

  async function handleEnviar() {
    setEnviando(true);
    setError('');
    try {
      const nueva = await enviarEntrega(perfil.uid, perfil.rol, { enlaceArtifact: enlace, queSoluciona, comoLoHizo });
      setConfirmando(false);
      onEntregaEnviada(nueva);
    } catch (err) {
      console.error(err);
      setConfirmando(false);
      setError(err?.code === 'permission-denied'
        ? 'No se pudo enviar tu entrega. Puede que las entregas ya hayan cerrado o que ya tengas una entrega registrada. Recarga la página para verificarlo.'
        : 'No se pudo enviar tu entrega. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <p className="entrega-texto">
        Tienes plazo hasta el <strong>{cierre}</strong> (hora Colombia). Solo puedes enviar una entrega, así que revísala bien antes de enviarla.
      </p>

      <details className="entrega-ayuda">
        <summary>¿Cómo consigo el enlace de mi Artifact?</summary>
        <p>
          En Claude, abre tu Artifact y usa la opción para publicarlo o compartirlo. Copia el enlace
          público que empieza por <strong>https://claude.ai/</strong> y ábrelo en una ventana de incógnito
          para confirmar que el jurado lo podrá ver sin iniciar sesión.
        </p>
      </details>

      <form className="entrega-formulario" onSubmit={handleRevisar} noValidate>
        <label className="entrega-etiqueta" htmlFor="entregaEnlace">Enlace de tu Artifact</label>
        <input
          id="entregaEnlace"
          type="url"
          inputMode="url"
          className="campo-input campo-input--izquierda"
          placeholder="https://claude.ai/..."
          maxLength={LIMITES.enlace}
          value={enlace}
          onChange={e => setEnlace(e.target.value)}
        />

        <CampoTextoLargo
          id="entregaQueSoluciona"
          etiqueta="¿Qué soluciona tu Artifact?"
          ayuda="El problema del caso y cómo tu Artifact lo resuelve."
          valor={queSoluciona}
          onCambio={setQueSoluciona}
          max={LIMITES.queSolucionaMax}
        />
        <CampoTextoLargo
          id="entregaComoLoHizo"
          etiqueta="¿Cómo lo hiciste?"
          ayuda="Tu proceso con Claude: qué le pediste, cómo lo fuiste ajustando y qué decisiones tomaste."
          valor={comoLoHizo}
          onCambio={setComoLoHizo}
          max={LIMITES.comoLoHizoMax}
        />

        {error && <p className="mensaje mensaje--error" role="alert">{error}</p>}

        <button type="submit" className="boton boton--primario">Revisar y enviar</button>
      </form>

      {confirmando && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="confirmarTitulo">
          <div className="modal-caja">
            <h2 id="confirmarTitulo" className="modal-titulo">¿Enviar tu entrega?</h2>
            <p className="modal-texto">
              Tu entrega es <strong>definitiva</strong>: después de enviarla no podrás cambiar el enlace ni los textos.
            </p>
            <p className="modal-enlace">{enlace.trim()}</p>
            <div className="modal-acciones">
              <button type="button" className="boton boton--secundario" onClick={() => setConfirmando(false)} disabled={enviando}>
                Seguir editando
              </button>
              <button type="button" className="boton boton--primario" onClick={handleEnviar} disabled={enviando}>
                {enviando ? <><span className="spinner" />Enviando</> : 'Enviar entrega'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CampoTextoLargo({ id, etiqueta, ayuda, valor, onCambio, max }) {
  return (
    <div className="campo-largo">
      <label className="entrega-etiqueta" htmlFor={id}>{etiqueta}</label>
      <p className="campo-largo-ayuda" id={`${id}Ayuda`}>{ayuda}</p>
      <textarea
        id={id}
        className="campo-input campo-input--izquierda campo-textarea"
        aria-describedby={`${id}Ayuda`}
        maxLength={max}
        rows={5}
        value={valor}
        onChange={e => onCambio(e.target.value)}
      />
      <span className="campo-largo-contador">{valor.trim().length} / {max}</span>
    </div>
  );
}

function EntregaEnviada({ entrega }) {
  const enviadaEn = aFecha(entrega.creadoEn);
  return (
    <section className="entrega entrega--enviada">
      <div className="entrega-enviada-cabecera">
        <span className="entrega-enviada-check"><img src="/media/Chulo.svg" alt="" /></span>
        <div>
          <h2 className="entrega-titulo">Entrega enviada</h2>
          {enviadaEn && <p className="entrega-texto">{fechaHoraEvento(enviadaEn)} (hora Colombia)</p>}
        </div>
      </div>

      <a className="entrega-enlace" href={entrega.enlaceArtifact} target="_blank" rel="noopener noreferrer">
        {entrega.enlaceArtifact}
      </a>

      <h3 className="entrega-subtitulo">Qué soluciona</h3>
      <p className="entrega-respuesta">{entrega.queSoluciona}</p>
      <h3 className="entrega-subtitulo">Cómo lo hiciste</h3>
      <p className="entrega-respuesta">{entrega.comoLoHizo}</p>

      <p className="entrega-texto entrega-texto--suave">Gana el mejor Artifact de cada categoría. ¡Mucha suerte!</p>
    </section>
  );
}
