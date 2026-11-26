import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/base.css';
import Ingreso from './pages/Ingreso.jsx';
import RestablecerContrasena from './pages/RestablecerContrasena.jsx';
import { FONDOS, URL_TERMINOS, URL_POLITICA_DATOS } from './config.js';

// Los documentos legales son largos: se cargan solo cuando alguien los abre,
// para no hacer más pesada la carga inicial de la app.
const Terminos = lazy(() => import('./pages/Terminos.jsx'));
const Politica = lazy(() => import('./pages/Politica.jsx'));
const cargando = <div className="pantalla-carga"><span className="spinner spinner--claro" /></div>;

// Los fondos se pasan al CSS como variables, para que el CSS elija el de
// celular o el de computador según el ancho (ver body::before en base.css).
document.documentElement.style.setProperty('--fondo-movil', `url("${FONDOS.movil}")`);
document.documentElement.style.setProperty('--fondo-escritorio', `url("${FONDOS.escritorio}")`);
document.documentElement.style.setProperty('--fondo-app', `url("${FONDOS.app}")`);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Ingreso />} />
        <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />
        <Route path={URL_TERMINOS} element={<Suspense fallback={cargando}><Terminos /></Suspense>} />
        <Route path={URL_POLITICA_DATOS} element={<Suspense fallback={cargando}><Politica /></Suspense>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
