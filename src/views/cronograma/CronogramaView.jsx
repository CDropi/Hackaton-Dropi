import { useEffect, useState } from 'react';
import { CRONOGRAMA } from '../../config.js';
import { horaLocal, fechaEvento } from '../../utils/fechas.js';
import { ahora as horaActual, desdeColombia } from '../../utils/reloj.js';
import TarjetaDiscord from '../../components/TarjetaDiscord.jsx';
import '../../styles/cronograma.css';

// Los 4 lives del bootcamp (config.js), todos visibles a la vez.
// Sus fechas están en hora Colombia; aquí se vuelven Date.
const CHARLAS = CRONOGRAMA.map(c => ({ ...c, inicio: desdeColombia(c.inicio), fin: desdeColombia(c.fin) }));

// Cada cuánto se recalcula qué live está "en vivo"
const INTERVALO_RELOJ_MS = 30 * 1000;

function estadoCharla(charla, ahora) {
  if (ahora >= charla.fin) return 'finalizada';
  if (ahora >= charla.inicio) return 'en-vivo';
  return 'proxima';
}

// "09 DIC." en hora Colombia
function fechaCorta(fecha) {
  const dia = fechaEvento(fecha, { day: 'numeric' }).padStart(2, '0');
  const mes = fechaEvento(fecha, { month: 'short' }).replace('.', '').toUpperCase();
  return `${dia} ${mes}.`;
}

export default function CronogramaView({ participante }) {
  const [ahora, setAhora] = useState(() => horaActual());

  useEffect(() => {
    const id = setInterval(() => setAhora(horaActual()), INTERVALO_RELOJ_MS);
    return () => clearInterval(id);
  }, []);

  const primerNombre = participante.nombre_contacto.trim().split(' ')[0];

  return (
    <div className="cronograma">
      <header className="pantalla-encabezado">
        <h1 className="pantalla-saludo">Hola, {primerNombre}</h1>
        <p className="pantalla-descripcion">
          Únete a los lives del bootcamp y potencia tu operación con el MCP de Dropi. Cuando uno esté en vivo, entra desde aquí.
        </p>
      </header>

      <p className="cronograma-zona">Las horas se muestran en la hora de tu país</p>

      <ol className="bootcamp">
        {CHARLAS.map(charla => (
          <TarjetaLive key={charla.dia} charla={charla} estado={estadoCharla(charla, ahora)} />
        ))}
      </ol>

      <TarjetaDiscord participante={participante} />
    </div>
  );
}

function TarjetaLive({ charla, estado }) {
  // Si la foto no carga (nombre de archivo distinto), se muestra la inicial
  const [fotoFalla, setFotoFalla] = useState(false);
  const tieneEnlace = typeof charla.enlace === 'string' && charla.enlace.startsWith('https://');
  // Solo se puede entrar mientras está en vivo
  const abre = tieneEnlace && estado === 'en-vivo';

  // La foto ya trae el marco gris, el borde naranja y los cuadros: los
  // textos van encima, dentro del área del borde (.bootcamp-area).
  const poster = (
    <>
      {charla.foto && !fotoFalla
        ? <img className="bootcamp-foto" src={charla.foto} alt="" onError={() => setFotoFalla(true)} />
        : <span className="bootcamp-sin-foto" aria-hidden="true">{charla.conferencista.charAt(0)}</span>}

      <div className="bootcamp-area">
        <div className="bootcamp-cabecera">
          <span className="bootcamp-fecha">{fechaCorta(charla.inicio)}</span>
          <span className="bootcamp-hora">
            <span>{charla.etiqueta}:</span>
            <span>{horaLocal(charla.inicio)}</span>
          </span>
        </div>

        {estado === 'en-vivo' && (
          <span className="bootcamp-en-vivo"><span className="bootcamp-en-vivo-punto" />En vivo</span>
        )}

        <div className="bootcamp-nombre">
          <span className="bootcamp-conferencista">{charla.conferencista}</span>
          <span className="bootcamp-empresa">{charla.empresa}</span>
        </div>
        <p className="bootcamp-tema">{charla.tema}</p>
      </div>
    </>
  );

  return (
    <li className={`bootcamp-tarjeta bootcamp-tarjeta--${estado}`}>
      {abre
        ? (
          <a className="bootcamp-poster" href={charla.enlace} target="_blank" rel="noopener noreferrer"
            aria-label={`Ver en YouTube: ${charla.tema}`}>
            {poster}
          </a>
        )
        : <div className="bootcamp-poster">{poster}</div>}
      <div className="bootcamp-pie">Día {charla.dia}</div>
      <div className="bootcamp-accion">
        {estado === 'en-vivo' && abre && (
          <a className="boton boton--primario bootcamp-boton" href={charla.enlace} target="_blank" rel="noopener noreferrer">
            <img src="/media/YouTube.svg" alt="" />
            Ver en vivo
          </a>
        )}
        {estado === 'en-vivo' && !abre && <p className="bootcamp-estado">El enlace estará disponible pronto</p>}
        {estado === 'proxima' && (
          <span className="boton boton--secundario bootcamp-boton bootcamp-boton--inactivo" aria-disabled="true">
            Próximamente
          </span>
        )}
        {estado === 'finalizada' && <p className="bootcamp-finalizado">Finalizado</p>}
      </div>
    </li>
  );
}
