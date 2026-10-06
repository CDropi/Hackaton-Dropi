import { useState } from 'react';
import { crearPerfil } from '../../lib/dataLayer.js';
import { mensajeDeError } from '../../lib/auth.js';
import { PAISES } from '../../config.js';
import Marca from '../../components/Marca.jsx';
import {
  SelectorRol, CampoCelular, CasillaPolitica, armarTelefono, validarDatosPerfil,
} from '../../components/CamposPerfil.jsx';

// Aparece cuando hay sesión pero no hay perfil en Firestore:
// - la primera vez que alguien entra con Google
// - si en el registro con correo se creó la cuenta pero falló el perfil
//   (en ese caso llega `datosIniciales` con lo que ya había escrito)
export default function CompletarPerfil({ user, datosIniciales, onCompletado, onCerrarSesion }) {
  // datosIniciales.telefono llega como "+57 3001234567"
  const [indicativoInicial, ...restoTelefono] = (datosIniciales?.telefono || '').split(' ');
  const paisInicial = PAISES.find(p => p.indicativo === indicativoInicial)?.id || 'CO';
  const [nombre, setNombre] = useState(datosIniciales?.nombre || user.displayName || '');
  const [paisId, setPaisId] = useState(paisInicial);
  const [celular, setCelular] = useState(restoTelefono.join(''));
  const [rol, setRol] = useState(datosIniciales?.rol || '');
  const [aceptaPolitica, setAceptaPolitica] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleGuardar(e) {
    e.preventDefault();
    setError('');
    const errorPerfil = validarDatosPerfil({ nombre, paisId, celular, rol, aceptaPolitica });
    if (errorPerfil) return setError(errorPerfil);

    setCargando(true);
    try {
      const perfil = await crearPerfil(user, { nombre, telefono: armarTelefono(paisId, celular), rol });
      onCompletado(perfil);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err) || '');
      setCargando(false);
    }
  }

  return (
    <div className="acceso-card acceso-card--registro">
      <Marca tamano="pequena" />
      <h1 className="acceso-titulo">Completa tu perfil</h1>
      <p className="acceso-texto">
        Entraste como <strong>{user.email}</strong>. Solo faltan estos datos para participar.
      </p>

      <form onSubmit={handleGuardar} noValidate>
        <label htmlFor="perfilNombre" className="sr-only">Nombre completo</label>
        <input
          id="perfilNombre"
          className="campo-input"
          placeholder="Nombre completo"
          autoComplete="name"
          maxLength={80}
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
        <CampoCelular pais={paisId} onCambioPais={setPaisId} celular={celular} onCambioCelular={setCelular} />
        <SelectorRol valor={rol} onCambio={setRol} />
        <CasillaPolitica marcada={aceptaPolitica} onCambio={setAceptaPolitica} />

        {error && <p className="mensaje mensaje--error" role="alert">{error}</p>}

        <button type="submit" className="boton boton--primario" disabled={cargando}>
          {cargando ? <><span className="spinner" />Guardando</> : 'Empezar'}
        </button>
      </form>

      <button type="button" className="enlace-texto" onClick={onCerrarSesion}>
        Usar otra cuenta
      </button>
    </div>
  );
}
