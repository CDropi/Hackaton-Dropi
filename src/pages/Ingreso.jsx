import { useCallback, useEffect, useRef, useState } from 'react';
import {
  obtenerSesion, registrar, salir, obtenerEntregaActual, mensajeDeError,
} from '../lib/api.js';
import Login from '../views/acceso/Login.jsx';
import Registro from '../views/acceso/Registro.jsx';
import CronogramaView from '../views/cronograma/CronogramaView.jsx';
import RetoView from '../views/reto/RetoView.jsx';
import PerfilView from '../views/perfil/PerfilView.jsx';
import Marca from '../components/Marca.jsx';
import AccesoHero from '../components/AccesoHero.jsx';
import BannerPrueba from '../components/BannerPrueba.jsx';
import { CATEGORIAS } from '../config.js';
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

// La sesión ahora la maneja el backend de TI (antes Firebase Auth):
// al abrir, GET /me dice si hay sesión y quién es el participante.
function IngresoContenido() {
  // undefined = cargando, null = sin sesión, objeto = participante
  const [participante, setParticipante] = useState(undefined);
  const [pantallaAcceso, setPantallaAcceso] = useState('login'); // 'login' | 'registro'
  const [errorSesion, setErrorSesion] = useState('');

  const cargarSesion = useCallback(async () => {
    setParticipante(undefined);
    setErrorSesion('');
    try {
      const sesion = await obtenerSesion();
      setParticipante(sesion?.participante || null);
    } catch (err) {
      console.error(err);
      setErrorSesion(mensajeDeError(err));
    }
  }, []);

  useEffect(() => { cargarSesion(); }, [cargarSesion]);

  // Registro e ingreso abren la sesión y devuelven el participante
  async function handleRegistrar(datos) {
    setParticipante(await registrar(datos));
  }

  async function handleCerrarSesion() {
    try {
      await salir();
    } catch (err) {
      console.error('Error cerrando sesión:', err);
    }
    setParticipante(null);
    setPantallaAcceso('login');
  }

  if (errorSesion) {
    return (
      <main className="acceso">
        <div className="acceso-card">
          <Marca tamano="pequena" />
          <p className="mensaje mensaje--error">{errorSesion}</p>
          <button type="button" className="boton boton--primario" onClick={cargarSesion}>Reintentar</button>
        </div>
      </main>
    );
  }

  if (participante === undefined) return <PantallaCarga />;

  if (!participante) {
    return (
      <main className="acceso acceso--dividido">
        <AccesoHero />
        <div className="acceso-columna">
          {pantallaAcceso === 'login'
            ? <Login onIngreso={setParticipante} onIrARegistro={() => setPantallaAcceso('registro')} />
            : <Registro onRegistrar={handleRegistrar} onVolver={() => setPantallaAcceso('login')} />}
        </div>
      </main>
    );
  }

  return <AppParticipante participante={participante} onCerrarSesion={handleCerrarSesion} />;
}

function PantallaCarga() {
  return <div className="pantalla-carga"><span className="spinner spinner--claro" /></div>;
}

// La app con sesión: Cronograma, Reto (guía + entrega) y Perfil.
// El cronograma y la guía vienen de config.js y data/guia.js, así que lo
// único que se pide al backend al entrar es la entrega actual.
function AppParticipante({ participante, onCerrarSesion }) {
  const [navActivo, setNavActivo] = useState(PESTANA_INICIAL);
  // undefined = cargando, null = sin entrega, objeto = última versión
  const [entrega, setEntrega] = useState(undefined);
  const [errorEntrega, setErrorEntrega] = useState('');
  const scrollRef = useRef(null);

  const cargarEntrega = useCallback(async () => {
    setErrorEntrega('');
    setEntrega(undefined);
    try {
      setEntrega(await obtenerEntregaActual());
    } catch (err) {
      console.error(err);
      setErrorEntrega(mensajeDeError(err));
    }
  }, []);

  useEffect(() => { cargarEntrega(); }, [cargarEntrega]);

  function cambiarPestana(i) {
    setNavActivo(i);
    scrollRef.current?.scrollTo({ top: 0 });
  }

  const pestana = NAV_ITEMS[navActivo].key;
  const nombreCategoria = CATEGORIAS.find(c => c.id === participante.categoria)?.nombre || participante.categoria;

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
          <span className="app-lateral-usuario-nombre">{participante.nombre_contacto}</span>
          <span className="app-lateral-usuario-rol">{nombreCategoria}</span>
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

        {pestana === 'cronograma' && <CronogramaView participante={participante} />}
        {pestana === 'reto' && (
          <RetoView
            participante={participante}
            entrega={entrega}
            error={errorEntrega}
            onReintentar={cargarEntrega}
            onEntregaEnviada={setEntrega}
          />
        )}
        {pestana === 'perfil' && (
          <PerfilView
            participante={participante}
            entrega={entrega}
            onIrAlReto={() => cambiarPestana(PESTANA_INICIAL)}
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
