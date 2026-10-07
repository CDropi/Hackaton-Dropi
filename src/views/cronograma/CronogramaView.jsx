import { useEffect, useMemo, useState } from 'react';
import { aFecha, horaLocal, zonaLocal, fechaEvento, claveDiaEvento } from '../../utils/fechas.js';
import { ahora as horaActual } from '../../utils/reloj.js';
import '../../styles/cronograma.css';

// Cada cuánto se recalcula qué charla está "en vivo" (sin volver a leer Firestore)
const INTERVALO_RELOJ_MS = 30 * 1000;

// "11:30 a. m." → { hora: "11:30", periodo: "a. m." } en la hora del
// dispositivo, para dibujar la hora grande y el periodo pequeño.
function partesHora(fecha) {
  const partes = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' }).formatToParts(fecha);
  const hora = partes
    .filter(p => p.type === 'hour' || p.type === 'minute' || (p.type === 'literal' && p.value.trim() === ':'))
    .map(p => p.value)
    .join('');
  const periodo = partes.find(p => p.type === 'dayPeriod')?.value || '';
  return { hora, periodo };
}

// "lun, 19 oct" → "Lun, 19 oct"
function mayusculaInicial(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Estado de una charla según la hora actual
function estadoCharla(charla, ahora) {
  const inicio = aFecha(charla.inicio);
  const fin = aFecha(charla.fin);
  if (!inicio || !fin) return 'proxima';
  if (ahora >= fin) return 'finalizada';
  if (ahora >= inicio) return 'en-vivo';
  return 'proxima';
}

// Día que se abre por defecto: hoy si es día de bootcamp; si no, el
// siguiente que venga; si ya pasaron todos, el último.
function diaInicial(dias, ahora) {
  const hoy = claveDiaEvento(ahora);
  const conFecha = dias.map(d => ({ id: d.id, clave: aFecha(d.fecha) ? claveDiaEvento(aFecha(d.fecha)) : '' }));
  return (
    conFecha.find(d => d.clave === hoy)?.id ||
    conFecha.find(d => d.clave > hoy)?.id ||
    dias[dias.length - 1]?.id
  );
}

export default function CronogramaView({ perfil, cronograma, error, onReintentar }) {
  const [ahora, setAhora] = useState(() => horaActual());
  const [diaActivo, setDiaActivo] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setAhora(horaActual()), INTERVALO_RELOJ_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (cronograma?.length && !diaActivo) setDiaActivo(diaInicial(cronograma, horaActual()));
  }, [cronograma, diaActivo]);

  const dia = useMemo(() => cronograma?.find(d => d.id === diaActivo), [cronograma, diaActivo]);
  const primerNombre = perfil.nombre.trim().split(' ')[0];

  return (
    <div className="cronograma">
      <header className="pantalla-encabezado">
        <h1 className="pantalla-saludo">Hola, {primerNombre}</h1>
        <p className="pantalla-descripcion">
          Estas son las charlas del bootcamp. Cuando una esté en vivo, entra desde aquí a Google Meet.
        </p>
      </header>

      {error && (
        <div className="estado-vacio">
          <p>{error}</p>
          <button type="button" className="boton boton--secundario" onClick={onReintentar}>Reintentar</button>
        </div>
      )}

      {!error && !cronograma && <div className="cargando-bloque"><span className="spinner spinner--claro" /></div>}

      {!error && cronograma?.length === 0 && (
        <div className="estado-vacio"><p>El cronograma se publicará muy pronto.</p></div>
      )}

      {!error && cronograma?.length > 0 && (
        <>
          <div className="tabs-dias" role="tablist" aria-label="Días del bootcamp">
            {cronograma.map(d => {
              const fecha = aFecha(d.fecha);
              return (
                <button
                  key={d.id}
                  type="button"
                  role="tab"
                  aria-selected={d.id === diaActivo}
                  className={`tab-dia ${d.id === diaActivo ? 'tab-dia--activo' : ''}`}
                  onClick={() => setDiaActivo(d.id)}
                >
                  <span className="tab-dia-titulo">{d.titulo}</span>
                  {fecha && (
                    <span className="tab-dia-fecha">
                      {mayusculaInicial(fechaEvento(fecha, { weekday: 'short', day: 'numeric', month: 'short' }))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="cronograma-zona">Horas en la zona de tu dispositivo ({zonaLocal()})</p>

          <ol className="charlas">
            {(dia?.charlas || []).map((charla, i) => (
              <Charla key={i} charla={charla} estado={estadoCharla(charla, ahora)} />
            ))}
          </ol>
          {dia && !dia.charlas?.length && (
            <div className="estado-vacio"><p>Pronto publicaremos las charlas de este día.</p></div>
          )}
        </>
      )}
    </div>
  );
}

function Charla({ charla, estado }) {
  const inicio = aFecha(charla.inicio);
  const fin = aFecha(charla.fin);
  const tieneEnlace = typeof charla.enlaceMeet === 'string' && charla.enlaceMeet.startsWith('https://');

  return (
    <li className={`charla charla--${estado}`}>
      <div className="charla-hora">
        {inicio && (
          <span className="charla-hora-inicio">
            {partesHora(inicio).hora}
            <span className="charla-hora-periodo">{partesHora(inicio).periodo}</span>
          </span>
        )}
        {fin && <span className="charla-hora-fin">hasta {horaLocal(fin)}</span>}
      </div>

      <div className="charla-cuerpo">
        {estado === 'en-vivo' && <span className="charla-en-vivo"><span className="charla-en-vivo-punto" />En vivo</span>}
        <h2 className="charla-tema">{charla.tema}</h2>
        <p className="charla-conferencista">{charla.conferencista}</p>

        {estado === 'finalizada' && <p className="charla-estado">Finalizada</p>}
        {estado !== 'finalizada' && tieneEnlace && (
          <a
            className={`boton ${estado === 'en-vivo' ? 'boton--primario' : 'boton--secundario'} boton--compacto`}
            href={charla.enlaceMeet}
            target="_blank"
            rel="noopener noreferrer"
          >
            Entrar a Google Meet
          </a>
        )}
        {estado !== 'finalizada' && !tieneEnlace && <p className="charla-estado">El enlace estará disponible pronto</p>}
      </div>
    </li>
  );
}
