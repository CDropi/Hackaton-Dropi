import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { restablecerContrasena, mensajeDeError } from '../lib/api.js';
import Marca from '../components/Marca.jsx';
import CampoPassword from '../components/CampoPassword.jsx';
import '../styles/ingreso.css';

const LARGO_MINIMO_PASSWORD = 8;

// Página del enlace de "olvidé mi contraseña". El correo que envía el
// backend de TI trae este enlace: /restablecer-contrasena?token=<token>
// (servicios POST /auth/recuperar y POST /auth/restablecer).
export default function RestablecerContrasena() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // 'listo' | 'invalido' | 'guardando' | 'exito'
  // El token se valida al guardar: el contrato no tiene un servicio aparte
  // para verificarlo antes.
  const [estado, setEstado] = useState(token ? 'listo' : 'invalido');
  const [password, setPassword] = useState('');
  const [passwordConfirmacion, setPasswordConfirmacion] = useState('');
  const [error, setError] = useState('');

  async function handleGuardar(e) {
    e.preventDefault();
    setError('');
    if (password.length < LARGO_MINIMO_PASSWORD) return setError(`La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.`);
    if (password !== passwordConfirmacion) return setError('Las contraseñas no coinciden.');
    setEstado('guardando');
    try {
      await restablecerContrasena(token, password);
      setEstado('exito');
    } catch (err) {
      console.error(err);
      if (err?.codigo === 'token_invalido') {
        setEstado('invalido');
        return;
      }
      setError(mensajeDeError(err));
      setEstado('listo');
    }
  }

  return (
    <main className="acceso">
      <div className="acceso-card">
        <Marca tamano="pequena" />
        <h1 className="acceso-titulo">Nueva contraseña</h1>

        {estado === 'invalido' && (
          <>
            <p className="acceso-texto">
              <strong>Este enlace ya no es válido.</strong> Puede haber expirado o ya se usó. Pide uno nuevo desde la app.
            </p>
            <Link to="/" className="boton boton--primario">Volver a la app</Link>
          </>
        )}

        {(estado === 'listo' || estado === 'guardando') && (
          <form onSubmit={handleGuardar} noValidate>
            <CampoPassword
              id="pwNueva"
              valor={password}
              onCambio={setPassword}
              placeholder={`Nueva contraseña (mínimo ${LARGO_MINIMO_PASSWORD} caracteres)`}
              autoComplete="new-password"
            />
            <CampoPassword
              id="pwConfirmar"
              valor={passwordConfirmacion}
              onCambio={setPasswordConfirmacion}
              placeholder="Confirma tu contraseña"
              autoComplete="new-password"
            />
            {error && <p className="mensaje mensaje--error" role="alert">{error}</p>}
            <button type="submit" className="boton boton--primario" disabled={estado === 'guardando'}>
              {estado === 'guardando' ? <><span className="spinner" />Guardando</> : 'Guardar contraseña'}
            </button>
          </form>
        )}

        {estado === 'exito' && (
          <>
            <p className="acceso-texto">Tu contraseña se actualizó.</p>
            <Link to="/" className="boton boton--primario">Iniciar sesión</Link>
          </>
        )}
      </div>
    </main>
  );
}
