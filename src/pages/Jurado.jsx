import { useCallback, useEffect, useState } from 'react';
import { ROLES, IMAGEN_FONDO } from '../config.js';
import {
  onCambioSesion, iniciarSesionConCorreo, cerrarSesion, esCuentaAdmin, mensajeDeError,
} from '../lib/auth.js';
import { listarEntregasPorRol } from '../lib/dataLayer.js';
import { aFecha, fechaHoraEvento } from '../utils/fechas.js';
import Marca from '../components/Marca.jsx';
import CampoPassword from '../components/CampoPassword.jsx';
import '../styles/ingreso.css';
import '../styles/jurado.css';

// Panel del jurado: /jurado
// Solo entra quien tenga el custom claim admin (scripts/asignarAdmin.mjs).
// Aunque alguien sin permiso abra esta ruta, las reglas de Firestore le
// niegan el list() de entregas: la pantalla de "sin permiso" es solo para
// explicarle qué pasa.
export default function Jurado() {
  const [user, setUser] = useState(undefined);
  const [esAdmin, setEsAdmin] = useState(undefined);

  useEffect(() => {
    document.body.style.backgroundImage = `url("${IMAGEN_FONDO}")`;
    return () => { document.body.style.backgroundImage = ''; };
  }, []);

  useEffect(() => {
    return onCambioSesion(async (u) => {
      setUser(u);
      setEsAdmin(undefined);
      if (!u) return;
      try {
        setEsAdmin(await esCuentaAdmin(u));
      } catch (err) {
        console.error(err);
        setEsAdmin(false);
      }
    });
  }, []);

  if (user === undefined || (user && esAdmin === undefined)) {
    return <div className="pantalla-carga"><span className="spinner spinner--claro" /></div>;
  }

  if (!user) return <main className="acceso"><LoginJurado /></main>;

  if (!esAdmin) {
    return (
      <main className="acceso">
        <div className="acceso-card">
          <Marca tamano="pequena" />
          <h1 className="acceso-titulo">Sin permiso</h1>
          <p className="acceso-texto">
            La cuenta <strong>{user.email}</strong> no tiene permisos de jurado. Si deberías tenerlos,
            pide a la organización que te los asigne y vuelve a iniciar sesión.
          </p>
          <button type="button" className="boton boton--primario" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </main>
    );
  }

  return <PanelJurado user={user} />;
}

function LoginJurado() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleIngresar(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) return setError('Escribe tu correo y tu contraseña.');
    setCargando(true);
    try {
      await iniciarSesionConCorreo(email, password);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err) || '');
      setCargando(false);
    }
  }

  return (
    <div className="acceso-card">
      <Marca />
      <h1 className="acceso-titulo">Panel del jurado</h1>
      <p className="acceso-texto">Ingresa con las credenciales asignadas por la organización.</p>
      <form onSubmit={handleIngresar} noValidate>
        <label htmlFor="juradoEmail" className="sr-only">Correo</label>
        <input
          id="juradoEmail"
          type="email"
          className="campo-input"
          placeholder="Correo"
          autoComplete="username"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <CampoPassword id="juradoPassword" valor={password} onCambio={setPassword} placeholder="Contraseña" />
        {error && <p className="mensaje mensaje--error" role="alert">{error}</p>}
        <button type="submit" className="boton boton--primario" disabled={cargando}>
          {cargando ? <><span className="spinner" />Ingresando</> : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

function PanelJurado({ user }) {
  const [rolActivo, setRolActivo] = useState(ROLES[0].id);
  const [entregas, setEntregas] = useState({}); // { rol: [...] }
  const [error, setError] = useState('');

  const cargar = useCallback(async (rol) => {
    setError('');
    try {
      const lista = await listarEntregasPorRol(rol);
      setEntregas(prev => ({ ...prev, [rol]: lista }));
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las entregas. Si el índice de Firestore se acaba de crear, espera unos minutos.');
    }
  }, []);

  useEffect(() => {
    if (!entregas[rolActivo]) cargar(rolActivo);
  }, [rolActivo, entregas, cargar]);

  const lista = entregas[rolActivo];

  return (
    <div className="jurado">
      <header className="jurado-cabecera">
        <Marca tamano="pequena" />
        <div className="jurado-cabecera-texto">
          <h1 className="jurado-titulo">Panel del jurado</h1>
          <p className="jurado-usuario">{user.email}</p>
        </div>
        <button type="button" className="boton boton--secundario boton--compacto" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </header>

      <div className="jurado-controles">
        <div className="tabs-dias jurado-tabs" role="tablist" aria-label="Categoría">
          {ROLES.map(rol => (
            <button
              key={rol.id}
              type="button"
              role="tab"
              aria-selected={rol.id === rolActivo}
              className={`tab-dia ${rol.id === rolActivo ? 'tab-dia--activo' : ''}`}
              onClick={() => setRolActivo(rol.id)}
            >
              <span className="tab-dia-titulo">{rol.nombre}</span>
              {entregas[rol.id] && (
                <span className="tab-dia-fecha">
                  {entregas[rol.id].length} {entregas[rol.id].length === 1 ? 'entrega' : 'entregas'}
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="boton boton--secundario boton--compacto"
          onClick={() => cargar(rolActivo)}
        >
          Actualizar
        </button>
      </div>

      {error && <p className="mensaje mensaje--error">{error}</p>}
      {!error && !lista && <div className="cargando-bloque"><span className="spinner spinner--claro" /></div>}
      {!error && lista?.length === 0 && (
        <div className="estado-vacio"><p>Todavía no hay entregas en esta categoría.</p></div>
      )}

      {lista?.length > 0 && (
        <ol className="jurado-lista">
          {lista.map((entrega, i) => <TarjetaEntrega key={entrega.uid} entrega={entrega} numero={i + 1} />)}
        </ol>
      )}
    </div>
  );
}

function TarjetaEntrega({ entrega, numero }) {
  const enviadaEn = aFecha(entrega.creadoEn);
  // Defensa extra: las reglas ya validan el prefijo, pero solo se vuelve
  // enlace clicable si es de claude.ai.
  const enlaceSeguro = typeof entrega.enlaceArtifact === 'string' && entrega.enlaceArtifact.startsWith('https://claude.ai/');

  return (
    <li className="jurado-entrega">
      <div className="jurado-entrega-cabecera">
        <span className="jurado-entrega-numero">{numero}</span>
        <div>
          <h2 className="jurado-entrega-nombre">{entrega.perfil?.nombre || 'Participante sin perfil'}</h2>
          <p className="jurado-entrega-contacto">
            {entrega.perfil?.email}{entrega.perfil?.telefono && <><br />{entrega.perfil.telefono}</>}
          </p>
        </div>
      </div>

      {enviadaEn && <p className="jurado-entrega-fecha">Enviada el {fechaHoraEvento(enviadaEn)}</p>}

      {enlaceSeguro ? (
        <a className="boton boton--primario boton--compacto" href={entrega.enlaceArtifact} target="_blank" rel="noopener noreferrer">
          Abrir Artifact
        </a>
      ) : (
        <p className="jurado-entrega-enlace-invalido">{entrega.enlaceArtifact}</p>
      )}

      <h3 className="jurado-entrega-subtitulo">Qué soluciona</h3>
      <p className="jurado-entrega-texto">{entrega.queSoluciona}</p>
      <h3 className="jurado-entrega-subtitulo">Cómo lo hizo</h3>
      <p className="jurado-entrega-texto">{entrega.comoLoHizo}</p>
    </li>
  );
}
