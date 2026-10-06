import { useState } from 'react';
import {
  iniciarSesionConCorreo, iniciarSesionConGoogle, enviarCorreoRecuperacion,
  esNavegadorInterno, mensajeDeError,
} from '../../lib/auth.js';
import { EVENTO } from '../../config.js';
import Marca from '../../components/Marca.jsx';
import CampoPassword from '../../components/CampoPassword.jsx';

export default function Login({ onIrARegistro }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviandoReset, setEnviandoReset] = useState(false);
  const navegadorInterno = esNavegadorInterno();

  async function handleIngresar(e) {
    e.preventDefault();
    setError('');
    setAviso('');
    if (!email.trim() || !password) {
      setError('Escribe tu correo y tu contraseña.');
      return;
    }
    setCargando(true);
    try {
      await iniciarSesionConCorreo(email, password);
      // Ingreso.jsx detecta la sesión nueva y carga el perfil solo.
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err) || '');
    } finally {
      setCargando(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setAviso('');
    try {
      await iniciarSesionConGoogle();
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err) || '');
    }
  }

  // Siempre el mismo mensaje, exista o no la cuenta (no revela qué correos
  // están registrados).
  async function handleOlvido() {
    setError('');
    setAviso('');
    if (!email.trim()) {
      setError('Escribe tu correo arriba y vuelve a tocar "¿Olvidaste tu contraseña?".');
      return;
    }
    setEnviandoReset(true);
    try {
      await enviarCorreoRecuperacion(email);
    } catch (err) {
      console.error(err);
      if (err?.code === 'auth/invalid-email') {
        setError('El correo no es válido.');
        setEnviandoReset(false);
        return;
      }
    }
    setAviso('Si hay una cuenta con ese correo, te enviamos un enlace para crear una contraseña nueva. Revisa también la carpeta de spam.');
    setEnviandoReset(false);
  }

  return (
    <div className="acceso-card">
      <Marca />
      <p className="acceso-fechas">{EVENTO.fechas}</p>
      <h1 className="acceso-titulo">Inicia sesión</h1>

      <form onSubmit={handleIngresar} noValidate>
        <label htmlFor="loginEmail" className="sr-only">Correo</label>
        <input
          id="loginEmail"
          type="email"
          className="campo-input"
          placeholder="Correo"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <CampoPassword id="loginPassword" valor={password} onCambio={setPassword} placeholder="Contraseña" />

        {error && <p className="mensaje mensaje--error" role="alert">{error}</p>}
        {aviso && <p className="mensaje mensaje--aviso" role="status">{aviso}</p>}

        <button type="submit" className="boton boton--primario" disabled={cargando}>
          {cargando ? <><span className="spinner" />Ingresando</> : 'Ingresar'}
        </button>
      </form>

      <button type="button" className="enlace-texto" onClick={handleOlvido} disabled={enviandoReset}>
        {enviandoReset ? 'Enviando...' : '¿Olvidaste tu contraseña?'}
      </button>

      <div className="separador"><span>o</span></div>

      {navegadorInterno ? (
        <p className="mensaje mensaje--aviso">
          Para entrar con Google, abre esta página en el navegador de tu celular (Chrome o Safari).
        </p>
      ) : (
        <button type="button" className="boton boton--google" onClick={handleGoogle}>
          <span className="boton-google-g" aria-hidden="true">G</span>
          Continuar con Google
        </button>
      )}

      <p className="acceso-pie">
        ¿Aún no tienes cuenta?{' '}
        <button type="button" className="enlace-texto enlace-texto--fuerte" onClick={onIrARegistro}>
          Regístrate
        </button>
      </p>
    </div>
  );
}
