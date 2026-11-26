import { useEffect, useState } from 'react';
import { mensajeDeError } from '../../lib/api.js';
import { FECHAS } from '../../config.js';
import { estadoRegistro, desdeColombia, ultimoMinuto } from '../../utils/reloj.js';
import { fechaHoraEvento } from '../../utils/fechas.js';
import Marca from '../../components/Marca.jsx';
import CampoPassword from '../../components/CampoPassword.jsx';
import BotonRegresar from '../../components/BotonRegresar.jsx';
import {
  CampoCelular, CasillaTerminos, CasillaPolitica, CasillaComunicaciones,
  armarWhatsapp, validarRegistro,
} from '../../components/CamposPerfil.jsx';

// Lo escrito en el formulario se guarda en la pestaña (sessionStorage) para
// no perderlo si la persona abre los términos o la política y vuelve.
// Las contraseñas nunca se guardan.
const CLAVE_BORRADOR = 'hk-registro-borrador';
function leerBorrador() {
  try { return JSON.parse(sessionStorage.getItem(CLAVE_BORRADOR)) || {}; } catch { return {}; }
}

// Registro con correo y contraseña.
// La cuenta la crea Ingreso.jsx con onRegistrar → POST /auth/registro.
// El registro abre en FECHAS.registroAbre (config.js) y cierra en
// FECHAS.cierre, junto con las entregas; el backend de TI aplica lo mismo.
export default function Registro({ onRegistrar, onVolver }) {
  const [borrador] = useState(leerBorrador);
  const [nombreContacto, setNombreContacto] = useState(borrador.nombreContacto || '');
  const [correo, setCorreo] = useState(borrador.correo || '');
  const [paisId, setPaisId] = useState(borrador.paisId || 'CO');
  const [celular, setCelular] = useState(borrador.celular || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmacion, setPasswordConfirmacion] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(Boolean(borrador.aceptaTerminos));
  const [aceptaPolitica, setAceptaPolitica] = useState(Boolean(borrador.aceptaPolitica));
  const [aceptaComunicaciones, setAceptaComunicaciones] = useState(Boolean(borrador.aceptaComunicaciones)); // opcional
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);


  // Guarda el borrador en cada cambio (sin contraseñas)
  useEffect(() => {
    try {
      sessionStorage.setItem(CLAVE_BORRADOR, JSON.stringify({
        nombreContacto, correo, paisId, celular,
        aceptaTerminos, aceptaPolitica, aceptaComunicaciones,
      }));
    } catch { /* sin almacenamiento disponible */ }
  }, [nombreContacto, correo, paisId, celular,
      aceptaTerminos, aceptaPolitica, aceptaComunicaciones]);

  async function handleRegistrar(e) {
    e.preventDefault();
    setError('');
    const mensaje = validarRegistro({
      nombreContacto, correo, paisId, celular,
      password, passwordConfirmacion, aceptaTerminos, aceptaPolitica,
    });
    if (mensaje) return setError(mensaje);

    setCargando(true);
    try {
      await onRegistrar({
        nombre_contacto: nombreContacto.trim(),
        correo: correo.trim().toLowerCase(),
        whatsapp: armarWhatsapp(paisId, celular),
        pais: paisId,
        password,
        aceptaciones: {
          version_terminos: '1.0',
          terminos: true,
          politica_datos: true,
          comunicaciones_comerciales: aceptaComunicaciones,
        },
      });
      try { sessionStorage.removeItem(CLAVE_BORRADOR); } catch { /* nada */ }
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err));
      setCargando(false);
    }
  }

  const estado = estadoRegistro();
  if (estado !== 'abierto') {
    return (
      <div className="acceso-card">
        <div className="acceso-barra">
          <BotonRegresar onClick={onVolver} etiqueta="Volver a iniciar sesión" />
        </div>
        <div className="solo-movil"><Marca tamano="pequena" /></div>
        <h1 className="acceso-titulo">{estado === 'antes' ? 'El registro abre pronto' : 'El registro cerró'}</h1>
        <p className="acceso-texto">
          {estado === 'antes'
            ? <>Podrás inscribirte desde el <strong>{fechaHoraEvento(desdeColombia(FECHAS.registroAbre))}</strong> (hora Colombia).</>
            : <>El registro cerró el <strong>{fechaHoraEvento(ultimoMinuto())}</strong> (hora Colombia). Si ya te registraste, inicia sesión.</>}
        </p>
        <button type="button" className="boton boton--primario" onClick={onVolver}>Ir a iniciar sesión</button>
      </div>
    );
  }

  return (
    <div className="acceso-card acceso-card--registro">
      <div className="acceso-barra">
        <BotonRegresar onClick={onVolver} etiqueta="Volver a iniciar sesión" />
      </div>
      <div className="solo-movil"><Marca tamano="pequena" /></div>
      <h1 className="acceso-titulo">Crea tu cuenta</h1>

      <form onSubmit={handleRegistrar} noValidate>
        <label htmlFor="regNombre" className="sr-only">Nombre completo</label>
        <input
          id="regNombre"
          className="campo-input"
          placeholder="Nombre completo"
          autoComplete="name"
          maxLength={80}
          value={nombreContacto}
          onChange={e => setNombreContacto(e.target.value)}
        />
        <label htmlFor="regEmail" className="sr-only">Correo de tu cuenta Dropi</label>
        <input
          id="regEmail"
          type="email"
          className="campo-input"
          placeholder="Correo con el que te registraste en Dropi"
          autoComplete="email"
          maxLength={120}
          value={correo}
          onChange={e => setCorreo(e.target.value)}
        />
        <CampoCelular pais={paisId} onCambioPais={setPaisId} celular={celular} onCambioCelular={setCelular} />

        <CampoPassword
          id="regPassword"
          valor={password}
          onCambio={setPassword}
          placeholder="Contraseña (mínimo 8 caracteres)"
          autoComplete="new-password"
        />
        <CampoPassword
          id="regPasswordConfirmacion"
          valor={passwordConfirmacion}
          onCambio={setPasswordConfirmacion}
          placeholder="Confirma tu contraseña"
          autoComplete="new-password"
        />

        <CasillaTerminos marcada={aceptaTerminos} onCambio={setAceptaTerminos} />
        <CasillaPolitica marcada={aceptaPolitica} onCambio={setAceptaPolitica} />
        <CasillaComunicaciones marcada={aceptaComunicaciones} onCambio={setAceptaComunicaciones} />

        {error && <p className="mensaje mensaje--error" role="alert">{error}</p>}

        <button type="submit" className="boton boton--primario" disabled={cargando}>
          {cargando ? <><span className="spinner" />Creando cuenta</> : 'Crear cuenta'}
        </button>
      </form>
    </div>
  );
}
