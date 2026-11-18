import { useState } from 'react';
import { mensajeDeError } from '../../lib/api.js';
import { FECHAS } from '../../config.js';
import { estadoRegistro, desdeColombia } from '../../utils/reloj.js';
import { fechaHoraEvento } from '../../utils/fechas.js';
import Marca from '../../components/Marca.jsx';
import CampoPassword from '../../components/CampoPassword.jsx';
import BotonRegresar from '../../components/BotonRegresar.jsx';
import {
  SelectorCategoria, CampoCelular, CampoCedula, CasillaTerminos, CasillaPolitica,
  armarWhatsapp, normalizarCedula, validarRegistro,
} from '../../components/CamposPerfil.jsx';

// Registro con correo y contraseña (ya no hay acceso con Google).
// La cuenta la crea Ingreso.jsx con onRegistrar → POST /auth/registro.
// La app bloquea el registro fuera de FECHAS (config.js); el backend de TI
// aplica las mismas fechas con la hora de su servidor.
export default function Registro({ onRegistrar, onVolver }) {
  const [nombreContacto, setNombreContacto] = useState('');
  const [nombreNegocio, setNombreNegocio] = useState('');
  const [cedula, setCedula] = useState('');
  const [correo, setCorreo] = useState('');
  const [cuentaDropiId, setCuentaDropiId] = useState('');
  const [paisId, setPaisId] = useState('CO');
  const [celular, setCelular] = useState('');
  const [categoria, setCategoria] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmacion, setPasswordConfirmacion] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaPolitica, setAceptaPolitica] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const estado = estadoRegistro();

  async function handleRegistrar(e) {
    e.preventDefault();
    setError('');
    const mensaje = validarRegistro({
      nombreContacto, nombreNegocio, cedula, correo, paisId, celular, cuentaDropiId,
      categoria, password, passwordConfirmacion, aceptaTerminos, aceptaPolitica,
    });
    if (mensaje) return setError(mensaje);

    setCargando(true);
    try {
      await onRegistrar({
        nombre_contacto: nombreContacto.trim(),
        nombre_negocio: nombreNegocio.trim(),
        cedula: normalizarCedula(cedula),
        correo: correo.trim().toLowerCase(),
        whatsapp: armarWhatsapp(paisId, celular),
        pais: paisId,
        cuenta_dropi_id: cuentaDropiId.trim(),
        categoria,
        password,
        aceptaciones: {
          version_terminos: '1.0',
          terminos: true,
          politica_datos: true,
        },
      });
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err));
      setCargando(false);
    }
  }

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
            ? <>Podrás inscribirte desde el <strong>{fechaHoraEvento(desdeColombia(FECHAS.registroAbre))}</strong> (hora Colombia), con el live de lanzamiento.</>
            : <>Las inscripciones cerraron el <strong>{fechaHoraEvento(desdeColombia(FECHAS.registroCierra))}</strong> (hora Colombia). Si ya te registraste, inicia sesión.</>}
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
      <p className="acceso-texto">Solo pueden participar usuarios registrados en Dropi. Usa los datos de tu cuenta Dropi.</p>

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
        <label htmlFor="regNegocio" className="sr-only">Nombre de tu negocio</label>
        <input
          id="regNegocio"
          className="campo-input"
          placeholder="Nombre de tu negocio o tienda"
          autoComplete="organization"
          maxLength={80}
          value={nombreNegocio}
          onChange={e => setNombreNegocio(e.target.value)}
        />
        <CampoCedula valor={cedula} onCambio={setCedula} />
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
        <label htmlFor="regCuentaDropi" className="sr-only">ID de tu cuenta Dropi</label>
        <input
          id="regCuentaDropi"
          className="campo-input"
          placeholder="ID de tu cuenta Dropi"
          inputMode="numeric"
          autoComplete="off"
          maxLength={20}
          value={cuentaDropiId}
          onChange={e => setCuentaDropiId(e.target.value.replace(/\D/g, ''))}
        />
        <CampoCelular pais={paisId} onCambioPais={setPaisId} celular={celular} onCambioCelular={setCelular} />

        <SelectorCategoria valor={categoria} onCambio={setCategoria} />

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

        {error && <p className="mensaje mensaje--error" role="alert">{error}</p>}

        <button type="submit" className="boton boton--primario" disabled={cargando}>
          {cargando ? <><span className="spinner" />Creando cuenta</> : 'Crear cuenta'}
        </button>
      </form>
    </div>
  );
}
