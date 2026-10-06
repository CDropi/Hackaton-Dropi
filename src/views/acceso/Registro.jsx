import { useState } from 'react';
import { iniciarSesionConGoogle, esNavegadorInterno, mensajeDeError } from '../../lib/auth.js';
import Marca from '../../components/Marca.jsx';
import CampoPassword from '../../components/CampoPassword.jsx';
import BotonRegresar from '../../components/BotonRegresar.jsx';
import {
  SelectorRol, CampoCelular, CasillaPolitica, armarTelefono, validarDatosPerfil,
} from '../../components/CamposPerfil.jsx';

const LARGO_MINIMO_PASSWORD = 8;

// Registro con correo y contraseña. La cuenta y el perfil los crea
// Ingreso.jsx (onRegistrar), para controlar el orden de las dos escrituras.
export default function Registro({ onRegistrar, onVolver }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [paisId, setPaisId] = useState('CO');
  const [celular, setCelular] = useState('');
  const [rol, setRol] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmacion, setPasswordConfirmacion] = useState('');
  const [aceptaPolitica, setAceptaPolitica] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navegadorInterno = esNavegadorInterno();

  async function handleRegistrar(e) {
    e.preventDefault();
    setError('');
    const errorPerfil = validarDatosPerfil({ nombre, paisId, celular, rol, aceptaPolitica });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Escribe un correo válido.');
    if (errorPerfil) return setError(errorPerfil);
    if (password.length < LARGO_MINIMO_PASSWORD) return setError(`La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.`);
    if (password !== passwordConfirmacion) return setError('Las contraseñas no coinciden.');

    setCargando(true);
    try {
      await onRegistrar({
        email,
        password,
        nombre,
        telefono: armarTelefono(paisId, celular),
        rol,
      });
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err) || '');
      setCargando(false);
    }
  }

  // Con Google la cuenta se crea de una vez; el rol y el celular se piden
  // después en CompletarPerfil.
  async function handleGoogle() {
    setError('');
    try {
      await iniciarSesionConGoogle();
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err) || '');
    }
  }

  return (
    <div className="acceso-card acceso-card--registro">
      <div className="acceso-barra">
        <BotonRegresar onClick={onVolver} etiqueta="Volver a iniciar sesión" />
      </div>
      <Marca tamano="pequena" />
      <h1 className="acceso-titulo">Crea tu cuenta</h1>

      {!navegadorInterno && (
        <>
          <button type="button" className="boton boton--google" onClick={handleGoogle}>
            <span className="boton-google-g" aria-hidden="true">G</span>
            Registrarme con Google
          </button>
          <div className="separador"><span>o con tu correo</span></div>
        </>
      )}

      <form onSubmit={handleRegistrar} noValidate>
        <label htmlFor="regNombre" className="sr-only">Nombre completo</label>
        <input
          id="regNombre"
          className="campo-input"
          placeholder="Nombre completo"
          autoComplete="name"
          maxLength={80}
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
        <label htmlFor="regEmail" className="sr-only">Correo</label>
        <input
          id="regEmail"
          type="email"
          className="campo-input"
          placeholder="Correo"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <CampoCelular pais={paisId} onCambioPais={setPaisId} celular={celular} onCambioCelular={setCelular} />

        <SelectorRol valor={rol} onCambio={setRol} />

        <CampoPassword
          id="regPassword"
          valor={password}
          onCambio={setPassword}
          placeholder={`Contraseña (mínimo ${LARGO_MINIMO_PASSWORD} caracteres)`}
          autoComplete="new-password"
        />
        <CampoPassword
          id="regPasswordConfirmacion"
          valor={passwordConfirmacion}
          onCambio={setPasswordConfirmacion}
          placeholder="Confirma tu contraseña"
          autoComplete="new-password"
        />

        <CasillaPolitica marcada={aceptaPolitica} onCambio={setAceptaPolitica} />

        {error && <p className="mensaje mensaje--error" role="alert">{error}</p>}

        <button type="submit" className="boton boton--primario" disabled={cargando}>
          {cargando ? <><span className="spinner" />Creando cuenta</> : 'Crear cuenta'}
        </button>
      </form>
    </div>
  );
}
