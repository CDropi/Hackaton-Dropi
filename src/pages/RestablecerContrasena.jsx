import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { getFirebaseAuth } from '../lib/auth.js';
import { IMAGEN_FONDO } from '../config.js';
import Marca from '../components/Marca.jsx';
import CampoPassword from '../components/CampoPassword.jsx';
import '../styles/ingreso.css';

const LARGO_MINIMO_PASSWORD = 8;

// Página propia para el enlace de "olvidé mi contraseña", en vez de la
// pantalla genérica de Firebase. Solo se usa si en la consola
// (Authentication → Plantillas → Restablecer contraseña → URL de acción)
// se pone la URL de la app terminada en /restablecer-contrasena.
// Si no se configura, Firebase usa su propia página y esta no hace falta.
export default function RestablecerContrasena() {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  // 'verificando' | 'listo' | 'invalido' | 'guardando' | 'exito'
  const [estado, setEstado] = useState('verificando');
  const [emailCuenta, setEmailCuenta] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmacion, setPasswordConfirmacion] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.backgroundImage = `url("${IMAGEN_FONDO}")`;
    return () => { document.body.style.backgroundImage = ''; };
  }, []);

  useEffect(() => {
    if (!oobCode) {
      setEstado('invalido');
      return;
    }
    verifyPasswordResetCode(getFirebaseAuth(), oobCode)
      .then(email => { setEmailCuenta(email); setEstado('listo'); })
      .catch(() => setEstado('invalido'));
  }, [oobCode]);

  async function handleGuardar(e) {
    e.preventDefault();
    setError('');
    if (password.length < LARGO_MINIMO_PASSWORD) return setError(`La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.`);
    if (password !== passwordConfirmacion) return setError('Las contraseñas no coinciden.');
    setEstado('guardando');
    try {
      await confirmPasswordReset(getFirebaseAuth(), oobCode, password);
      setEstado('exito');
    } catch (err) {
      console.error(err);
      setError('No se pudo actualizar la contraseña. El enlace puede haber expirado: pide uno nuevo desde la app.');
      setEstado('listo');
    }
  }

  return (
    <main className="acceso">
      <div className="acceso-card">
        <Marca tamano="pequena" />
        <h1 className="acceso-titulo">Nueva contraseña</h1>

        {estado === 'verificando' && <p className="acceso-texto">Verificando el enlace...</p>}

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
            <p className="acceso-texto">Cuenta: <strong>{emailCuenta}</strong></p>
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
