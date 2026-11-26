import { TIPOS_SOLUCION } from '../../config.js';
import { CRITERIOS } from '../../data/guia.js';
import { fechaHoraEvento } from '../../utils/fechas.js';

const nombreArchivo = (ruta) => ruta.split('/').pop();

// La última versión que recibió el backend (GET /entregas/actual)
export default function EntregaResumen({ entrega, puedeEditar, onEditar }) {
  const s = entrega.solucion;
  const tipo = TIPOS_SOLUCION.find(t => t.id === s.tipo)?.nombre || s.tipo;
  const enlaceSeguro = (url) => typeof url === 'string' && url.startsWith('https://');

  return (
    <section className="entrega entrega--enviada">
      <div className="entrega-enviada-cabecera">
        <span className="entrega-enviada-check"><img src="/media/Chulo.svg" alt="" /></span>
        <div>
          <h2 className="entrega-titulo">Entrega recibida</h2>
          <p className="entrega-texto">
            Versión {entrega.version}, {fechaHoraEvento(new Date(entrega.recibido_en))} (hora Colombia)
          </p>
        </div>
      </div>

      {puedeEditar && (
        <div className="entrega-editar">
          <p className="entrega-texto">Puedes cambiar tu entrega hasta el cierre. Cuenta tu última versión enviada.</p>
          <button type="button" className="boton boton--primario boton--compacto" onClick={onEditar}>Cambiar mi entrega</button>
        </div>
      )}

      <h3 className="entrega-subtitulo">Solución</h3>
      <p className="entrega-respuesta"><strong>{entrega.titulo}</strong></p>
      <p className="entrega-respuesta">{entrega.descripcion}</p>
      <p className="entrega-respuesta entrega-respuesta--suave">{tipo}</p>

      {enlaceSeguro(s.link) && <a className="entrega-enlace" href={s.link} target="_blank" rel="noopener noreferrer">{s.link}</a>}
      {enlaceSeguro(s.repo) && <a className="entrega-enlace" href={s.repo} target="_blank" rel="noopener noreferrer">{s.repo}</a>}
      {s.adjuntos?.length > 0 && (
        <p className="entrega-respuesta entrega-respuesta--suave">
          Adjuntos: {s.adjuntos.map(a => a.nombre_original || nombreArchivo(a.archivo)).join(', ')}
        </p>
      )}

      <h3 className="entrega-subtitulo">Video</h3>
      <p className="entrega-respuesta">
        {entrega.video.nombre_original}
        {entrega.video.duracion_seg ? `, ${entrega.video.duracion_seg} s` : ''}
      </p>

      <details className="entrega-ayuda">
        <summary>Ver mis respuestas del cuestionario</summary>
        {CRITERIOS.map(c => (
          <div key={c.id}>
            <h4 className="entrega-subtitulo">{c.pregunta}</h4>
            <p className="entrega-respuesta">{entrega.cuestionario?.[c.id]}</p>
          </div>
        ))}
      </details>
    </section>
  );
}
