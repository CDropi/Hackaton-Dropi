import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/base.css';
import Ingreso from './pages/Ingreso.jsx';
import Jurado from './pages/Jurado.jsx';
import RestablecerContrasena from './pages/RestablecerContrasena.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Ingreso />} />
        <Route path="/jurado" element={<Jurado />} />
        <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
