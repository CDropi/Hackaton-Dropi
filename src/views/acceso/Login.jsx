import { useState } from 'react';
import { ingresar, recuperarContrasena, mensajeDeError, modoSimulado } from '../../lib/api.js';
import { CUENTA_PRUEBA } from '../../lib/simulado.js';
import { EVENTO } from '../../config.js';
import Marca from '../../components/Marca.jsx';
import CampoPassword from '../../components/CampoPassword.jsx';

// Inicio de sesión con correo y contraseña. El acceso con Google se quitó:
// ahora la cuenta vive en el backend de TI (POST /auth/ingreso).
export default function Login({ onIngreso, onIrARegistro }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviandoReset, setEnviandoReset] = useState(false);

  async function handleIngresar(e) {
    e.preventDefault();
    setError('');
    setAviso('');
    if (!correo.trim() || !password) {
      setError('Escribe tu correo y tu contraseña.');
      return;
    }
    setCargando(true);
    try {
      const participante = await ingresar(correo.trim().toLowerCase(), password);
      onIngreso(participante);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err));
      setCargando(false);
    }
  }

  // Siempre el mismo mensaje, exista o no la cuenta (no revela qué correos
  // están registrados).
  async function handleOlvido() {
    setError('');
    setAviso('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      setError('Escribe tu correo arriba y vuelve a tocar "¿Olvidaste tu contraseña?".');
      return;
    }
    setEnviandoReset(true);
    try {
      await recuperarContrasena(correo.trim().toLowerCase());
    } catch (err) {
      console.error(err);
      if (err?.codigo === 'sin_conexion') {
        setError(mensajeDeError(err));
        setEnviandoReset(false);
        return;
      }
    }
    setAviso('Si hay una cuenta con ese correo, te enviamos un enlace para crear una contraseña nueva. Revisa también la carpeta de spam.');
    setEnviandoReset(false);
  }

  return (
    <div className="acceso-card">
      <div className="solo-movil">
        <Marca />
        <p className="acceso-fechas">{EVENTO.fechas}</p>
      </div>
      <h1 className="acceso-titulo">Inicia sesión</h1>

      <form onSubmit={handleIngresar} noValidate>
        <label htmlFor="loginEmail" className="sr-only">Correo</label>
        <input
          id="loginEmail"
          type="email"
          className="campo-input"
          placeholder="Correo"
          autoComplete="email"
          value={correo}
          onChange={e => setCorreo(e.target.value)}
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

      {/* Solo sin backend: recuerda la cuenta de prueba precargada */}
      {modoSimulado && (
        <div className="mensaje mensaje--aviso acceso-prueba">
          <p>
            <strong>Modo simulado.</strong> Entra con la cuenta de prueba:
            <br />{CUENTA_PRUEBA.correo} · {CUENTA_PRUEBA.password}
          </p>
          <button
            type="button"
            className="enlace-texto enlace-texto--fuerte"
            onClick={() => { setCorreo(CUENTA_PRUEBA.correo); setPassword(CUENTA_PRUEBA.password); }}
          >
            Usar la cuenta de prueba
          </button>
        </div>
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
