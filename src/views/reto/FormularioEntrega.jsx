import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CATEGORIAS, TIPOS_SOLUCION, IAS, HERRAMIENTAS_MCP, ADJUNTOS_PERMITIDOS, VERSION_REGLAS,
} from '../../config.js';
import { CRITERIOS, ACEPTACIONES } from '../../data/guia.js';
import { prepararVersion, subirArchivo, confirmarVersion, mensajeDeError } from '../../lib/api.js';
import CampoVideo from './CampoVideo.jsx';
import { GuionVideo } from './Guia.jsx';

// Límites del contrato de TI (sección "Validaciones y límites")
const L = {
  titulo: 80, descripcion: 2500, respuesta: 800, textoLargo: 20000,
  ejemplo: 2000, faltante: 200, url: 500, adjuntos: 3, adjuntoBytes: 25 * 1024 * 1024,
};

const PASOS = [
  { id: 'solucion', titulo: 'Tu solución' },
  { id: 'cuestionario', titulo: 'Cuestionario' },
  { id: 'video', titulo: 'Video' },
  { id: 'revision', titulo: 'Revisa y envía' },
];

// Campos de la solución que se piden según el tipo (contrato de TI).
// `requeridos` se validan; `opcionales` se muestran pero pueden ir vacíos.
const CAMPOS_POR_TIPO = {
  prompt: { requeridos: ['prompts'], opcionales: ['instrucciones'] },
  asistente: { requeridos: ['instrucciones'], opcionales: [] },
  artifact: { requeridos: ['link'], opcionales: ['como_funciona'] },
  flujo: { requeridos: ['adjuntos', 'como_funciona'], opcionales: [] },
  codigo: { requeridos: ['repo_o_zip', 'como_funciona'], opcionales: [] },
  simulacion: { requeridos: ['como_funciona'], opcionales: ['link'] },
  otra: { requeridos: ['como_funciona'], opcionales: ['link'] },
};

const DATOS_VACIOS = {
  titulo: '', descripcion: '', tipo: '', ia_usada: [], herramientas_mcp: [],
  prompts: '', instrucciones: '', como_funciona: '', link: '', repo: '',
  ejemplo_uso: '', herramienta_faltante: '',
  cuestionario: Object.fromEntries(CRITERIOS.map(c => [c.id, ''])),
};

// Datos del formulario a partir de una entrega ya enviada (para editarla)
function datosDesdeEntrega(entrega) {
  const s = entrega.solucion;
  return {
    titulo: entrega.titulo, descripcion: entrega.descripcion, tipo: s.tipo,
    ia_usada: s.ia_usada || [], herramientas_mcp: s.herramientas_mcp || [],
    prompts: s.prompts || '', instrucciones: s.instrucciones || '', como_funciona: s.como_funciona || '',
    link: s.link || '', repo: s.repo || '', ejemplo_uso: s.ejemplo_uso || '',
    herramienta_faltante: s.herramienta_faltante || '',
    cuestionario: { ...DATOS_VACIOS.cuestionario, ...entrega.cuestionario },
  };
}

const esHttps = (t) => /^https:\/\/[^\s]+\.[^\s]+$/.test(t.trim());
const largo = (t) => t.trim().length;
const nombreArchivo = (ruta) => ruta.split('/').pop();

// ---- Validación por paso: devuelve el primer problema o '' ----
function validarSolucion(d, adjuntos) {
  if (!largo(d.titulo)) return 'Ponle un título a tu solución.';
  if (!largo(d.descripcion)) return 'Describe qué hace tu solución, para quién es y cómo se usa.';
  if (!d.tipo) return 'Elige qué tipo de solución entregas.';
  if (!d.ia_usada.length) return 'Elige qué IA usaste.';
  const { requeridos } = CAMPOS_POR_TIPO[d.tipo];
  if (requeridos.includes('prompts') && !largo(d.prompts)) return 'Pega tus prompts, en orden.';
  if (requeridos.includes('instrucciones') && !largo(d.instrucciones)) return 'Pega las instrucciones de tu asistente.';
  if (requeridos.includes('link') && !esHttps(d.link)) return 'Pega el enlace de tu artifact o página. Debe empezar por https://';
  if (requeridos.includes('adjuntos') && !adjuntos.length) return 'Adjunta el archivo exportado de tu flujo.';
  if (requeridos.includes('repo_o_zip') && !esHttps(d.repo) && !adjuntos.some(a => a.nombre.toLowerCase().endsWith('.zip'))) {
    return 'Pega el enlace de tu repositorio o adjunta un .zip con el código.';
  }
  if (requeridos.includes('como_funciona') && !largo(d.como_funciona)) return 'Explica cómo funciona tu solución.';
  if (largo(d.link) && !esHttps(d.link)) return 'El enlace debe empezar por https://';
  if (largo(d.repo) && !esHttps(d.repo)) return 'El enlace del repositorio debe empezar por https://';
  if (!largo(d.ejemplo_uso)) return 'Escribe un ejemplo de lo que se le pide a tu solución y el resultado esperado.';
  return '';
}

function validarCuestionario(d) {
  const falta = CRITERIOS.find(c => !largo(d.cuestionario[c.id]));
  return falta ? `Responde: ${falta.pregunta}` : '';
}

const validarVideo = (video) => (video ? '' : 'Sube tu video de 60 segundos.');

export default function FormularioEntrega({ participante, entregaAnterior, onEnviada, onCancelar }) {
  const claveBorrador = `hk-borrador-${participante.id_participante}`;

  // El borrador (solo textos; los archivos no se pueden guardar en el
  // navegador) gana sobre la entrega anterior: es lo último que escribió.
  const [datos, setDatos] = useState(() => {
    try {
      const borrador = JSON.parse(localStorage.getItem(claveBorrador));
      if (borrador) return { ...DATOS_VACIOS, ...borrador, cuestionario: { ...DATOS_VACIOS.cuestionario, ...borrador.cuestionario } };
    } catch { /* sin borrador */ }
    return entregaAnterior ? datosDesdeEntrega(entregaAnterior) : DATOS_VACIOS;
  });
  const [video, setVideo] = useState(entregaAnterior ? { reutilizar: true } : null);
  // Adjuntos: { nombre, bytes, archivo } (nuevo) o { nombre, bytes, reutilizar } (de la versión anterior)
  const [adjuntos, setAdjuntos] = useState(() => (entregaAnterior?.solucion.adjuntos || []).map(a => ({
    nombre: a.nombre_original, bytes: a.bytes, reutilizar: nombreArchivo(a.archivo),
  })));
  const [aceptaciones, setAceptaciones] = useState(() => Object.fromEntries(ACEPTACIONES.map(a => [a.id, false])));
  const [paso, setPaso] = useState(0);
  const [error, setError] = useState('');
  const [guardado, setGuardado] = useState(false);
  const [envio, setEnvio] = useState(null); // { etapa, progreso } mientras se envía
  // Al cambiar de paso se sube hasta la barra de pasos
  const arribaRef = useRef(null);

  // Guarda el borrador mientras la persona escribe (con una pequeña espera)
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(claveBorrador, JSON.stringify(datos));
        setGuardado(true);
      } catch { /* sin almacenamiento disponible */ }
    }, 600);
    return () => clearTimeout(id);
  }, [datos, claveBorrador]);

  const cambiar = (campo, valor) => { setGuardado(false); setDatos(d => ({ ...d, [campo]: valor })); };
  const cambiarRespuesta = (id, valor) => { setGuardado(false); setDatos(d => ({ ...d, cuestionario: { ...d.cuestionario, [id]: valor } })); };

  const completos = useMemo(() => ({
    solucion: !validarSolucion(datos, adjuntos),
    cuestionario: !validarCuestionario(datos),
    video: !validarVideo(video),
    revision: ACEPTACIONES.every(a => aceptaciones[a.id]),
  }), [datos, adjuntos, video, aceptaciones]);

  function irAPaso(i) {
    setError('');
    setPaso(i);
    arribaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function continuar() {
    const problema = [() => validarSolucion(datos, adjuntos), () => validarCuestionario(datos), () => validarVideo(video)][paso]?.() || '';
    if (problema) { setError(problema); return; }
    irAPaso(paso + 1);
  }

  async function enviar() {
    const problema = validarSolucion(datos, adjuntos) || validarCuestionario(datos) || validarVideo(video)
      || (completos.revision ? '' : 'Marca las cuatro casillas para poder enviar.');
    if (problema) { setError(problema); return; }
    setError('');

    try {
      // 1) Pedir la versión nueva y los enlaces firmados
      setEnvio({ etapa: 'Preparando tu entrega', progreso: null });
      const { version, subidas } = await prepararVersion({
        video: video.reutilizar ? { reutilizar: true } : { nombre_original: video.nombre_original, bytes: video.archivo.size, tipo: video.archivo.type || 'video/mp4' },
        adjuntos: adjuntos.map(a => (a.reutilizar ? { reutilizar: a.reutilizar } : { nombre_original: a.nombre, bytes: a.bytes, tipo: a.archivo.type || 'application/octet-stream' })),
      });

      // 2) Subir los archivos nuevos directo a S3
      if (subidas.video?.url) {
        await subirArchivo(subidas.video, video.archivo, (p) => setEnvio({ etapa: 'Subiendo tu video', progreso: p }));
      }
      for (let i = 0; i < adjuntos.length; i++) {
        if (subidas.adjuntos?.[i]?.url) {
          await subirArchivo(subidas.adjuntos[i], adjuntos[i].archivo, (p) => setEnvio({ etapa: `Subiendo adjunto ${i + 1}`, progreso: p }));
        }
      }

      // 3) Confirmar con el formulario: el backend escribe el JSON y cierra la versión
      setEnvio({ etapa: 'Guardando tu entrega', progreso: null });
      const medidas = video.reutilizar
        ? { duracion_seg: entregaAnterior.video.duracion_seg, ancho: entregaAnterior.video.ancho, alto: entregaAnterior.video.alto, nombre_original: entregaAnterior.video.nombre_original }
        : { ...(video.medidas || { duracion_seg: null, ancho: null, alto: null }), nombre_original: video.nombre_original };
      const herramientas = datos.herramientas_mcp.map(h => h.trim()).filter(Boolean);
      const entrega = await confirmarVersion(version, {
        titulo: datos.titulo.trim(),
        descripcion: datos.descripcion.trim(),
        cuestionario: Object.fromEntries(CRITERIOS.map(c => [c.id, datos.cuestionario[c.id].trim()])),
        video: medidas,
        solucion: {
          tipo: datos.tipo,
          ia_usada: datos.ia_usada,
          herramientas_mcp: herramientas,
          prompts: datos.prompts.trim(),
          instrucciones: datos.instrucciones.trim(),
          como_funciona: datos.como_funciona.trim(),
          link: datos.link.trim(),
          repo: datos.repo.trim(),
          ejemplo_uso: datos.ejemplo_uso.trim(),
          herramienta_faltante: datos.herramienta_faltante.trim(),
        },
        aceptaciones: { version_reglas: VERSION_REGLAS, ...aceptaciones },
      });

      try { localStorage.removeItem(claveBorrador); } catch { /* nada */ }
      setEnvio(null);
      onEnviada(entrega);
    } catch (err) {
      console.error(err);
      setEnvio(null);
      setError(mensajeDeError(err));
    }
  }

  const tipo = datos.tipo ? CAMPOS_POR_TIPO[datos.tipo] : null;
  const muestra = (campo) => tipo && (tipo.requeridos.includes(campo) || tipo.opcionales.includes(campo));
  const requiere = (campo) => tipo && tipo.requeridos.includes(campo);

  return (
    <div className="formulario-entrega">
      <ResumenGuia participante={participante} datos={datos} completos={completos} />

      <ol className="pasos-entrega" aria-label="Partes de tu entrega" ref={arribaRef}>
        {PASOS.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              className={`paso-entrega ${i === paso ? 'paso-entrega--activo' : ''} ${completos[p.id] ? 'paso-entrega--completo' : ''}`}
              aria-current={i === paso ? 'step' : undefined}
              onClick={() => irAPaso(i)}
            >
              <span className="paso-entrega-numero">{completos[p.id] ? '✓' : i + 1}</span>
              <span className="paso-entrega-titulo">{p.titulo}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="entrega">
        {paso === 0 && (
          <>
            <h2 className="entrega-titulo">Tu solución</h2>
            <p className="entrega-texto">Lo que construiste, de forma que el jurado pueda entenderlo.</p>

            <Campo id="eTitulo" etiqueta="Título de tu solución" valor={datos.titulo} onCambio={v => cambiar('titulo', v)} max={L.titulo} />
            <Campo id="eDescripcion" etiqueta="Descripción de la solución" ayuda="Qué hace, para quién es y cómo se usa en el día a día."
              valor={datos.descripcion} onCambio={v => cambiar('descripcion', v)} max={L.descripcion} largo />

            <fieldset className="grupo-opciones">
              <legend className="entrega-etiqueta">¿Qué tipo de solución entregas?</legend>
              <div className="opciones-chips">
                {TIPOS_SOLUCION.map(t => (
                  <label key={t.id} className={`chip ${datos.tipo === t.id ? 'chip--activo' : ''}`}>
                    <input type="radio" name="tipoSolucion" className="sr-only" checked={datos.tipo === t.id} onChange={() => cambiar('tipo', t.id)} />
                    {t.nombre}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="grupo-opciones">
              <legend className="entrega-etiqueta">¿Qué IA usaste?</legend>
              <div className="opciones-chips">
                {IAS.map(ia => {
                  const activo = datos.ia_usada.includes(ia.id);
                  return (
                    <label key={ia.id} className={`chip ${activo ? 'chip--activo' : ''}`}>
                      <input type="checkbox" className="sr-only" checked={activo}
                        onChange={() => cambiar('ia_usada', activo ? datos.ia_usada.filter(x => x !== ia.id) : [...datos.ia_usada, ia.id])} />
                      {ia.nombre}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <HerramientasMcp valor={datos.herramientas_mcp} onCambio={v => cambiar('herramientas_mcp', v)} />

            {muestra('prompts') && (
              <Campo id="ePrompts" etiqueta={`Tus prompts, en orden${requiere('prompts') ? '' : ' (opcional)'}`} valor={datos.prompts}
                onCambio={v => cambiar('prompts', v)} max={L.textoLargo} largo filas={8} />
            )}
            {muestra('instrucciones') && (
              <Campo id="eInstrucciones" etiqueta={`Instrucciones${requiere('instrucciones') ? ' de tu asistente' : ' (opcional)'}`} valor={datos.instrucciones}
                onCambio={v => cambiar('instrucciones', v)} max={L.textoLargo} largo filas={8} />
            )}
            {muestra('link') && (
              <Campo id="eLink" etiqueta={`Enlace${requiere('link') ? ' de tu artifact o página' : ' (opcional)'}`} valor={datos.link}
                onCambio={v => cambiar('link', v)} max={L.url} tipo="url" placeholder="https://" />
            )}
            {muestra('repo_o_zip') && (
              <Campo id="eRepo" etiqueta="Enlace del repositorio" ayuda="O adjunta tu código en un .zip aquí abajo." valor={datos.repo}
                onCambio={v => cambiar('repo', v)} max={L.url} tipo="url" placeholder="https://" />
            )}
            {(muestra('adjuntos') || muestra('repo_o_zip')) && (
              <Adjuntos valor={adjuntos} onCambio={setAdjuntos} />
            )}
            {muestra('como_funciona') && (
              <Campo id="eComo" etiqueta={`Cómo funciona${requiere('como_funciona') ? '' : ' (opcional)'}`} valor={datos.como_funciona}
                onCambio={v => cambiar('como_funciona', v)} max={L.textoLargo} largo filas={6} />
            )}

            <Campo id="eEjemplo" etiqueta="Ejemplo de uso" ayuda="Un ejemplo de lo que se le pide a tu solución y el resultado esperado."
              valor={datos.ejemplo_uso} onCambio={v => cambiar('ejemplo_uso', v)} max={L.ejemplo} largo />
            <Campo id="eFaltante" etiqueta="¿Qué herramienta le faltó al MCP? (opcional)" valor={datos.herramienta_faltante}
              onCambio={v => cambiar('herramienta_faltante', v)} max={L.faltante} />
          </>
        )}

        {paso === 1 && (
          <>
            <h2 className="entrega-titulo">Cuestionario</h2>
            <p className="entrega-texto">Cinco preguntas, una por cada criterio de calificación. El porcentaje es lo que pesa cada una.</p>
            {CRITERIOS.map(c => (
              <Campo key={c.id} id={`eC_${c.id}`} etiqueta={`${c.pregunta} (${c.peso}%)`} ayuda={c.ayuda}
                valor={datos.cuestionario[c.id]} onCambio={v => cambiarRespuesta(c.id, v)} max={L.respuesta} largo />
            ))}
          </>
        )}

        {paso === 2 && (
          <>
            <h2 className="entrega-titulo">Tu video de 60 segundos</h2>
            <GuionVideo />
            <CampoVideo valor={video} onCambio={setVideo} videoAnterior={entregaAnterior?.video} />
          </>
        )}

        {paso === 3 && (
          <>
            <h2 className="entrega-titulo">Revisa y envía</h2>
            <ul className="revision-lista">
              {PASOS.slice(0, 3).map((p, i) => (
                <li key={p.id} className={completos[p.id] ? 'revision-ok' : 'revision-falta'}>
                  <span>{p.titulo}</span>
                  {completos[p.id]
                    ? <strong>Lista</strong>
                    : <button type="button" className="enlace-texto enlace-texto--fuerte" onClick={() => irAPaso(i)}>Completar</button>}
                </li>
              ))}
            </ul>
            <div className="revision-aceptaciones">
              {ACEPTACIONES.map(a => (
                <label key={a.id} className="casilla-politica">
                  <input type="checkbox" checked={aceptaciones[a.id]}
                    onChange={e => setAceptaciones(x => ({ ...x, [a.id]: e.target.checked }))} />
                  <span>{a.texto}</span>
                </label>
              ))}
            </div>
            <p className="entrega-texto">
              {entregaAnterior
                ? `Se guardará como la versión ${entregaAnterior.version + 1}. Cuenta tu última versión enviada antes del cierre.`
                : 'Puedes cambiar tu entrega hasta el cierre. Cuenta tu última versión enviada.'}
            </p>
          </>
        )}

        {error && <p className="mensaje mensaje--error" role="alert">{error}</p>}

        <div className="entrega-acciones">
          {paso > 0
            ? <button type="button" className="boton boton--secundario" onClick={() => irAPaso(paso - 1)}>Atrás</button>
            : onCancelar && <button type="button" className="boton boton--secundario" onClick={onCancelar}>Cancelar</button>}
          {paso < PASOS.length - 1
            ? <button type="button" className="boton boton--primario" onClick={continuar}>Continuar</button>
            : <button type="button" className="boton boton--primario" onClick={enviar}>Enviar entrega</button>}
        </div>
        <p className="entrega-borrador">{guardado ? 'Tu borrador se guarda solo mientras escribes.' : 'Guardando borrador...'}</p>
      </div>

      {envio && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="envioTitulo">
          <div className="modal-caja">
            <h2 id="envioTitulo" className="modal-titulo">{envio.etapa}</h2>
            {envio.progreso !== null
              ? (
                <>
                  <div className="barra-progreso"><span style={{ width: `${Math.round(envio.progreso * 100)}%` }} /></div>
                  <p className="modal-texto">{Math.round(envio.progreso * 100)}%. No cierres esta página.</p>
                </>
              )
              : <p className="modal-texto"><span className="spinner" />No cierres esta página.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// "Tu guía de entrega": resumen de lo que lleva la entrega (como en el mockup)
function ResumenGuia({ participante, datos, completos }) {
  const categoria = CATEGORIAS.find(c => c.id === participante.categoria)?.nombre;
  const tipo = TIPOS_SOLUCION.find(t => t.id === datos.tipo)?.nombre;
  const ias = IAS.filter(ia => datos.ia_usada.includes(ia.id)).map(ia => ia.nombre).join(', ');
  const listas = Object.values(completos).filter(Boolean).length;
  return (
    <aside className="resumen-guia">
      <h2 className="resumen-guia-titulo">Tu guía de entrega</h2>
      <dl>
        <div><dt>Solución</dt><dd>{datos.titulo.trim() || 'Sin nombre todavía'}</dd></div>
        <div><dt>Remite</dt><dd>{participante.nombre_negocio}</dd></div>
        <div><dt>Categoría</dt><dd>{categoria}</dd></div>
        <div><dt>Tipo</dt><dd>{tipo || 'Por elegir'}</dd></div>
        <div><dt>IA usada</dt><dd>{ias || 'Por elegir'}</dd></div>
      </dl>
      <p className="resumen-guia-nota">{listas} de 4 partes listas. Tu entrega queda completa cuando las cuatro partes están listas.</p>
    </aside>
  );
}

function Campo({ id, etiqueta, ayuda, valor, onCambio, max, largo: esLargo = false, filas = 5, tipo = 'text', placeholder }) {
  return (
    <div className="campo-largo">
      <label className="entrega-etiqueta" htmlFor={id}>{etiqueta}</label>
      {ayuda && <p className="campo-largo-ayuda" id={`${id}Ayuda`}>{ayuda}</p>}
      {esLargo
        ? <textarea id={id} className="campo-input campo-input--izquierda campo-textarea" aria-describedby={ayuda ? `${id}Ayuda` : undefined}
            maxLength={max} rows={filas} value={valor} onChange={e => onCambio(e.target.value)} />
        : <input id={id} type={tipo} className="campo-input campo-input--izquierda" aria-describedby={ayuda ? `${id}Ayuda` : undefined}
            maxLength={max} value={valor} placeholder={placeholder} onChange={e => onCambio(e.target.value)} />}
      <span className="campo-largo-contador">{valor.length} / {max.toLocaleString('es-CO')}</span>
    </div>
  );
}

// Herramientas del MCP: opciones sugeridas + las que la persona escriba
function HerramientasMcp({ valor, onCambio }) {
  const [nueva, setNueva] = useState('');
  const opciones = [...new Set([...HERRAMIENTAS_MCP, ...valor])];
  function agregar() {
    const limpia = nueva.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (limpia && !valor.includes(limpia)) onCambio([...valor, limpia]);
    setNueva('');
  }
  return (
    <fieldset className="grupo-opciones">
      <legend className="entrega-etiqueta">Herramientas del MCP que usa (opcional)</legend>
      <div className="opciones-chips">
        {opciones.map(h => {
          const activo = valor.includes(h);
          return (
            <label key={h} className={`chip chip--codigo ${activo ? 'chip--activo' : ''}`}>
              <input type="checkbox" className="sr-only" checked={activo}
                onChange={() => onCambio(activo ? valor.filter(x => x !== h) : [...valor, h])} />
              {h}
            </label>
          );
        })}
      </div>
      <div className="campo-agregar">
        <input className="campo-input campo-input--izquierda" placeholder="Otra herramienta, ej: get_product"
          value={nueva} onChange={e => setNueva(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregar(); } }} />
        <button type="button" className="boton boton--secundario boton--compacto" onClick={agregar}>Agregar</button>
      </div>
    </fieldset>
  );
}

// Adjuntos de la solución: máximo 3 de 25 MB, tipos en ADJUNTOS_PERMITIDOS
function Adjuntos({ valor, onCambio }) {
  const [error, setError] = useState('');
  function alElegir(e) {
    const archivos = [...(e.target.files || [])];
    e.target.value = '';
    setError('');
    const nuevos = [];
    for (const archivo of archivos) {
      const ext = (archivo.name.match(/\.[a-z0-9]+$/i)?.[0] || '').toLowerCase();
      if (!ADJUNTOS_PERMITIDOS.includes(ext)) { setError(`${archivo.name}: solo se aceptan ${ADJUNTOS_PERMITIDOS.join(', ')}.`); continue; }
      if (archivo.size > L.adjuntoBytes) { setError(`${archivo.name} pesa más de 25 MB.`); continue; }
      nuevos.push({ nombre: archivo.name, bytes: archivo.size, archivo });
    }
    const todos = [...valor, ...nuevos];
    if (todos.length > L.adjuntos) setError('Puedes adjuntar máximo 3 archivos.');
    onCambio(todos.slice(0, L.adjuntos));
  }
  return (
    <div className="campo-largo">
      <span className="entrega-etiqueta">Archivos adjuntos</span>
      <p className="campo-largo-ayuda">Máximo 3 archivos de 25 MB ({ADJUNTOS_PERMITIDOS.join(', ')}).</p>
      {valor.length > 0 && (
        <ul className="lista-adjuntos">
          {valor.map((a, i) => (
            <li key={`${a.nombre}-${i}`}>
              <span>{a.nombre}{a.reutilizar ? ' (de tu versión anterior)' : ''}</span>
              <button type="button" className="enlace-texto" onClick={() => onCambio(valor.filter((_, j) => j !== i))}>Quitar</button>
            </li>
          ))}
        </ul>
      )}
      {valor.length < L.adjuntos && (
        <label className="boton boton--secundario boton--compacto">
          Adjuntar archivo
          <input type="file" className="sr-only" multiple accept={ADJUNTOS_PERMITIDOS.join(',')} onChange={alElegir} />
        </label>
      )}
      {error && <p className="mensaje mensaje--error" role="alert">{error}</p>}
    </div>
  );
}
