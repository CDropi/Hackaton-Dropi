import { useEffect, useMemo, useState } from 'react';
import { CRONOGRAMA } from '../../config.js';
import { horaLocal, zonaLocal, fechaEvento, claveDiaEvento } from '../../utils/fechas.js';
import { ahora as horaActual, desdeColombia } from '../../utils/reloj.js';
import '../../styles/cronograma.css';

// El cronograma ahora vive en config.js (antes en Firestore): los lives del
// bootcamp son por YouTube y sus enlaces se cambian ahí, sin backend.
// Las fechas de config.js están en hora Colombia; aquí se vuelven Date.
const DIAS = CRONOGRAMA.map(dia => ({
  ...dia,
  fecha: dia.fecha ? desdeColombia(`${dia.fecha}T12:00:00`) : null,
  charlas: dia.charlas.map(c => ({ ...c, inicio: desdeColombia(c.inicio), fin: desdeColombia(c.fin) })),
}));

// Cada cuánto se recalcula qué charla está "en vivo"
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
  const { inicio, fin } = charla;
  if (ahora >= fin) return 'finalizada';
  if (ahora >= inicio) return 'en-vivo';
  return 'proxima';
}

// Día que se abre por defecto: hoy si es día de bootcamp; si no, el
// siguiente que venga; si ya pasaron todos, el último.
function diaInicial(dias, ahora) {
  const hoy = claveDiaEvento(ahora);
  const conFecha = dias.map(d => ({ id: d.id, clave: d.fecha ? claveDiaEvento(d.fecha) : '' }));
  return (
    conFecha.find(d => d.clave === hoy)?.id ||
    conFecha.find(d => d.clave > hoy)?.id ||
    dias[dias.length - 1]?.id
  );
}

export default function CronogramaView({ participante }) {
  const cronograma = DIAS;
  const [ahora, setAhora] = useState(() => horaActual());
  const [diaActivo, setDiaActivo] = useState(() => diaInicial(DIAS, horaActual()));

  useEffect(() => {
    const id = setInterval(() => setAhora(horaActual()), INTERVALO_RELOJ_MS);
    return () => clearInterval(id);
  }, []);

  const dia = useMemo(() => cronograma.find(d => d.id === diaActivo), [cronograma, diaActivo]);
  const primerNombre = participante.nombre_contacto.trim().split(' ')[0];

  return (
    <div className="cronograma">
      <header className="pantalla-encabezado">
        <h1 className="pantalla-saludo">Hola, {primerNombre}</h1>
        <p className="pantalla-descripcion">
          Estos son los lives del bootcamp con líderes de la comunidad. Cuando uno esté en vivo, entra desde aquí a YouTube.
        </p>
      </header>

      {cronograma.length === 0 && (
        <div className="estado-vacio"><p>El cronograma se publicará muy pronto.</p></div>
      )}

      {cronograma.length > 0 && (
        <>
          <div className="tabs-dias" role="tablist" aria-label="Días del bootcamp">
            {cronograma.map(d => {
              const { fecha } = d;
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
  const { inicio, fin } = charla;
  // const tieneEnlace = typeof charla.enlaceMeet === 'string' && charla.enlaceMeet.startsWith('https://');
  const tieneEnlace = typeof charla.enlace === 'string' && charla.enlace.startsWith('https://');

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
            href={charla.enlace}
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* Entrar a Google Meet */}
            Ver en YouTube
          </a>
        )}
        {estado !== 'finalizada' && !tieneEnlace && <p className="charla-estado">El enlace estará disponible pronto</p>}
      </div>
    </li>
  );
}
