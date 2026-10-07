import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IMAGEN_FONDO } from '../config.js';
import {
  onCambioSesion, registrarConCorreo, cerrarSesion, esCuentaAdmin,
} from '../lib/auth.js';
import {
  obtenerPerfil, crearPerfil, obtenerConfigEvento, obtenerCronograma, obtenerReto, obtenerEntrega,
} from '../lib/dataLayer.js';
import Login from '../views/acceso/Login.jsx';
import Registro from '../views/acceso/Registro.jsx';
import CompletarPerfil from '../views/acceso/CompletarPerfil.jsx';
import CronogramaView from '../views/cronograma/CronogramaView.jsx';
import RetoView from '../views/reto/RetoView.jsx';
import PerfilView from '../views/perfil/PerfilView.jsx';
import Marca from '../components/Marca.jsx';
import AccesoHero from '../components/AccesoHero.jsx';
import BannerPrueba from '../components/BannerPrueba.jsx';
import { ROLES } from '../config.js';
import '../styles/ingreso.css';

const NAV_ITEMS = [
  { key: 'cronograma', label: 'Cronograma', icon: '/media/Casa.svg', iconActivo: '/media/Casa.svg' },
  { key: 'reto', label: 'Reto', icon: '/media/Lanzamiento.svg', iconActivo: '/media/Lanzamiento.svg' },
  { key: 'perfil', label: 'Perfil', icon: '/media/Perfil.svg', iconActivo: '/media/Perfil_2.svg' },
];

// Pestaña con la que abre la app: el Reto (centro del menú en celular)
const PESTANA_INICIAL = NAV_ITEMS.findIndex(item => item.key === 'reto');

// En la barra lateral de computador el Reto va primero. En el menú inferior
// de celular se mantiene NAV_ITEMS, con el Reto en el centro.
const ORDEN_LATERAL = ['reto', 'cronograma', 'perfil'];

const ERROR_CARGA = 'No pudimos cargar la información. Revisa tu conexión e intenta de nuevo.';

// La franja de modo prueba va por fuera para que se vea en todas las
// pantallas (acceso y app) sin repetirla en cada return.
export default function Ingreso() {
  return (
    <>
      <BannerPrueba />
      <IngresoContenido />
    </>
  );
}

function IngresoContenido() {
  // undefined = todavía no se sabe, null = sin sesión, objeto = con sesión
  const [user, setUser] = useState(undefined);
  // undefined = cargando, null = no tiene perfil, objeto = perfil
  const [perfil, setPerfil] = useState(undefined);
  const [esAdmin, setEsAdmin] = useState(false);
  const [pantallaAcceso, setPantallaAcceso] = useState('login'); // 'login' | 'registro'
  const [datosPendientes, setDatosPendientes] = useState(null);
  const [errorPerfil, setErrorPerfil] = useState('');

  // Mientras se registra con correo, la sesión se abre ANTES de que exista
  // el perfil. Esta marca evita que en ese instante se muestre "Completa tu
  // perfil": el registro mismo se encarga de guardar el perfil.
  const registrandoRef = useRef(false);

  useEffect(() => {
    document.body.style.backgroundImage = `url("${IMAGEN_FONDO}")`;
    return () => { document.body.style.backgroundImage = ''; };
  }, []);

  const cargarPerfil = useCallback(async (u) => {
    setPerfil(undefined);
    setErrorPerfil('');
    try {
      const [p, admin] = await Promise.all([obtenerPerfil(u.uid), esCuentaAdmin(u)]);
      setEsAdmin(admin);
      setPerfil(p);
    } catch (err) {
      console.error(err);
      setErrorPerfil(ERROR_CARGA);
    }
  }, []);

  useEffect(() => {
    return onCambioSesion((u) => {
      setUser(u);
      if (!u) {
        setPerfil(undefined);
        setEsAdmin(false);
        setDatosPendientes(null);
        return;
      }
      if (registrandoRef.current) return;
      cargarPerfil(u);
    });
  }, [cargarPerfil]);

  async function handleRegistrar({ email, password, nombre, telefono, rol }) {
    registrandoRef.current = true;
    try {
      const nuevoUser = await registrarConCorreo(email, password);
      try {
        setPerfil(await crearPerfil(nuevoUser, { nombre, telefono, rol }));
      } catch (err) {
        // La cuenta quedó creada pero el perfil no: se pide completar con
        // los datos que ya había escrito.
        console.error('No se pudo crear el perfil:', err);
        setDatosPendientes({ nombre, telefono, rol });
        setPerfil(null);
      }
    } finally {
      registrandoRef.current = false;
    }
  }

  async function handleCerrarSesion() {
    try {
      await cerrarSesion();
    } catch (err) {
      console.error('Error cerrando sesión:', err);
    }
    setPantallaAcceso('login');
  }

  // ---- Sin sesión ----
  if (user === undefined) return <PantallaCarga />;

  if (!user) {
    return (
      <main className="acceso acceso--dividido">
        <AccesoHero />
        <div className="acceso-columna">
          {pantallaAcceso === 'login'
            ? <Login onIrARegistro={() => setPantallaAcceso('registro')} />
            : <Registro onRegistrar={handleRegistrar} onVolver={() => setPantallaAcceso('login')} />}
        </div>
      </main>
    );
  }

  // ---- Con sesión, cargando el perfil ----
  if (errorPerfil) {
    return (
      <main className="acceso">
        <div className="acceso-card">
          <Marca tamano="pequena" />
          <p className="mensaje mensaje--error">{errorPerfil}</p>
          <button type="button" className="boton boton--primario" onClick={() => cargarPerfil(user)}>Reintentar</button>
          <button type="button" className="enlace-texto" onClick={handleCerrarSesion}>Cerrar sesión</button>
        </div>
      </main>
    );
  }

  if (perfil === undefined) return <PantallaCarga />;

  // ---- Cuenta de jurado sin perfil de participante ----
  if (perfil === null && esAdmin) {
    return (
      <main className="acceso">
        <div className="acceso-card">
          <Marca tamano="pequena" />
          <h1 className="acceso-titulo">Cuenta de jurado</h1>
          <p className="acceso-texto">Esta cuenta no participa en la Hackatón. Revisa las entregas desde el panel del jurado.</p>
          <Link className="boton boton--primario" to="/jurado">Ir al panel del jurado</Link>
          <button type="button" className="enlace-texto" onClick={handleCerrarSesion}>Cerrar sesión</button>
        </div>
      </main>
    );
  }

  if (perfil === null) {
    return (
      <main className="acceso acceso--dividido">
        <AccesoHero />
        <div className="acceso-columna">
          <CompletarPerfil
            user={user}
            datosIniciales={datosPendientes}
            onCompletado={(p) => { setDatosPendientes(null); setPerfil(p); }}
            onCerrarSesion={handleCerrarSesion}
          />
        </div>
      </main>
    );
  }

  return <AppParticipante perfil={perfil} onCerrarSesion={handleCerrarSesion} />;
}

function PantallaCarga() {
  return <div className="pantalla-carga"><span className="spinner spinner--claro" /></div>;
}

// La app ya con sesión y perfil: Cronograma, Reto y Perfil.
//
// Lecturas por sesión: config + cronograma al entrar; reto y entrega solo
// la primera vez que se abre la pestaña que los necesita. Nada se vuelve a
// leer al cambiar de pestaña.
function AppParticipante({ perfil, onCerrarSesion }) {
  const [navActivo, setNavActivo] = useState(PESTANA_INICIAL);
  // undefined = cargando. Ahora que la app abre en el Reto, el formulario
  // de entrega no debe pintarse antes de conocer la ventana de entregas.
  const [config, setConfig] = useState(undefined);
  const [cronograma, setCronograma] = useState(null);
  const [errorInicio, setErrorInicio] = useState('');
  const [reto, setReto] = useState(undefined);
  const [entrega, setEntrega] = useState(undefined);
  const [errorReto, setErrorReto] = useState('');
  const scrollRef = useRef(null);

  const cargarInicio = useCallback(async () => {
    setErrorInicio('');
    setCronograma(null);
    try {
      const [c, crono] = await Promise.all([obtenerConfigEvento(), obtenerCronograma()]);
      setConfig(c);
      setCronograma(crono);
    } catch (err) {
      console.error(err);
      setErrorInicio(ERROR_CARGA);
    }
  }, []);

  const cargarEntrega = useCallback(async () => {
    try {
      setEntrega(await obtenerEntrega(perfil.uid));
    } catch (err) {
      console.error(err);
      setErrorReto(ERROR_CARGA);
    }
  }, [perfil.uid]);

  const cargarReto = useCallback(async () => {
    setErrorReto('');
    try {
      const [r, e] = await Promise.all([obtenerReto(perfil.rol), obtenerEntrega(perfil.uid)]);
      setReto(r);
      setEntrega(e);
    } catch (err) {
      console.error(err);
      setErrorReto(ERROR_CARGA);
    }
  }, [perfil.rol, perfil.uid]);

  useEffect(() => { cargarInicio(); }, [cargarInicio]);

  useEffect(() => {
    const pestana = NAV_ITEMS[navActivo].key;
    if (pestana === 'reto' && reto === undefined && !errorReto) cargarReto();
    if (pestana === 'perfil' && entrega === undefined && !errorReto) cargarEntrega();
  }, [navActivo, reto, entrega, errorReto, cargarReto, cargarEntrega]);

  function cambiarPestana(i) {
    setNavActivo(i);
    scrollRef.current?.scrollTo({ top: 0 });
  }

  const pestana = NAV_ITEMS[navActivo].key;
  const nombreRol = ROLES.find(r => r.id === perfil.rol)?.nombre || perfil.rol;

  return (
    <div className="app-shell">
      {/* Barra lateral: solo en computador. En celular se usa el menú inferior. */}
      <aside className="app-lateral">
        <Marca tamano="pequena" />
        <nav className="app-lateral-nav" aria-label="Secciones">
          {ORDEN_LATERAL.map(key => {
            const i = NAV_ITEMS.findIndex(item => item.key === key);
            const item = NAV_ITEMS[i];
            return (
            <button
              key={item.key}
              type="button"
              className={`app-lateral-item ${i === navActivo ? 'app-lateral-item--activo' : ''}`}
              aria-current={i === navActivo ? 'page' : undefined}
              onClick={() => cambiarPestana(i)}
            >
              <img src={i === navActivo ? item.iconActivo : item.icon} alt="" width={20} height={20} />
              {item.label}
            </button>
            );
          })}
        </nav>
        <div className="app-lateral-usuario">
          <span className="app-lateral-usuario-nombre">{perfil.nombre}</span>
          <span className="app-lateral-usuario-rol">{nombreRol}</span>
          {/* En computador cerrar sesión vive aquí, siempre visible.
              En celular sigue en la pestaña Perfil. */}
          <button type="button" className="app-lateral-salir" onClick={onCerrarSesion}>
            <img src="/media/LogOut.svg" alt="" width={16} height={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Cerrar sesión en celular: botón de vidrio fijo arriba a la derecha,
          como en ExpoWinners. En computador se oculta (está en la barra lateral). */}
      <button
        type="button"
        className="btn-salir-flotante"
        onClick={onCerrarSesion}
        aria-label="Cerrar sesión"
      >
        <img src="/media/LogOut.svg" alt="" />
      </button>

      <div className="app-scroll" ref={scrollRef}>
        <div className="app-marca"><Marca tamano="pequena" /></div>

        {pestana === 'cronograma' && (
          <CronogramaView perfil={perfil} cronograma={cronograma} error={errorInicio} onReintentar={cargarInicio} />
        )}
        {pestana === 'reto' && (
          <RetoView
            perfil={perfil}
            reto={reto}
            entrega={entrega}
            config={config}
            error={errorReto || (!config && errorInicio)}
            onReintentar={() => { cargarReto(); if (!config) cargarInicio(); }}
            onEntregaEnviada={setEntrega}
          />
        )}
        {pestana === 'perfil' && (
          <PerfilView
            perfil={perfil}
            entrega={entrega}
            onIrAlReto={() => cambiarPestana(1)}
            onCerrarSesion={onCerrarSesion}
          />
        )}
      </div>

      <div className="nav-wrapper">
        <nav className="bottom-nav" style={{ '--nav-hole-x': `${navActivo * 50}%` }} aria-label="Secciones">
          <div className="nav-items-row">
            {NAV_ITEMS.map((item, i) => (
              <button
                key={item.key}
                type="button"
                className={`nav-item ${i === navActivo ? 'active' : ''}`}
                aria-label={item.label}
                aria-current={i === navActivo ? 'page' : undefined}
                onClick={() => cambiarPestana(i)}
              >
                <img src={item.icon} alt="" width={22} height={22} />
                <span className="nav-item-texto">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
        <div className="nav-indicator" style={{ transform: `translateX(${navActivo * 100}%)` }}>
          <div className="nav-indicator-circle">
            <img src={NAV_ITEMS[navActivo].iconActivo} alt="" width={26} height={26} />
          </div>
        </div>
      </div>
    </div>
  );
}
