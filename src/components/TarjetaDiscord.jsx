import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DISCORD } from '../config.js';
import { iniciarDiscord, mensajeDeError } from '../lib/api.js';
import '../styles/componentes.css';

// Acceso al servidor de Discord de participantes. Solo se muestra con sesión.
// Ver DISCORD en config.js para los dos modos (automático o enlace).
export default function TarjetaDiscord({ participante }) {
  const [params, setParams] = useSearchParams();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  // Resultado que trae la URL al volver de Discord (plan A)
  const [resultado] = useState(() => params.get('discord'));

  // Limpia ?discord= de la dirección después de leerlo
  useEffect(() => {
    if (!params.get('discord')) return;
    setParams(actuales => {
      const siguientes = new URLSearchParams(actuales);
      siguientes.delete('discord');
      return siguientes;
    }, { replace: true });
  }, [params, setParams]);

  if (!DISCORD?.modo) return null;
  if (DISCORD.modo === 'enlace' && !DISCORD.enlace) return null;

  const unido = participante.discord_unido || resultado === 'unido';

  async function unirme() {
    setError('');
    setCargando(true);
    try {
      window.location.href = await iniciarDiscord();
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err));
      setCargando(false);
    }
  }

  return (
    <section className="tarjeta-discord">
      <div className="tarjeta-discord-cabecera">
        <span className="tarjeta-discord-logo"><img src="/media/Discord.svg" alt="" /></span>
        <div>
          <h2 className="tarjeta-discord-titulo">Comunidad en Discord</h2>
          <p className="tarjeta-discord-texto">El canal de participantes de la Hackatón: dudas, avisos del bootcamp y conversación con la comunidad.</p>
        </div>
      </div>

      {DISCORD.modo === 'automatico' && unido && (
        <>
          <p className="tarjeta-discord-estado">Ya estás en el servidor de participantes.</p>
          {DISCORD.servidor && (
            <a className="boton boton--discord" href={DISCORD.servidor} target="_blank" rel="noopener noreferrer">Abrir Discord</a>
          )}
        </>
      )}

      {DISCORD.modo === 'automatico' && !unido && (
        <>
          {resultado === 'error' && (
            <p className="mensaje mensaje--error">No se pudo completar la unión a Discord. Intenta de nuevo.</p>
          )}
          {error && <p className="mensaje mensaje--error" role="alert">{error}</p>}
          <button type="button" className="boton boton--discord" onClick={unirme} disabled={cargando}>
            {cargando ? <><span className="spinner" />Abriendo Discord</> : <><img src="/media/Discord.svg" alt="" />Unirme al canal de Discord</>}
          </button>
          <p className="tarjeta-discord-nota">Te pediremos autorizar con tu cuenta de Discord y entrarás directo al servidor.</p>
        </>
      )}

      {DISCORD.modo === 'enlace' && (
        <>
          <a className="boton boton--discord" href={DISCORD.enlace} target="_blank" rel="noopener noreferrer">
            <img src="/media/Discord.svg" alt="" />Unirme al canal de Discord
          </a>
          <p className="tarjeta-discord-nota">El equipo de Dropi aprueba cada solicitud para entrar al servidor.</p>
        </>
      )}
    </section>
  );
}
