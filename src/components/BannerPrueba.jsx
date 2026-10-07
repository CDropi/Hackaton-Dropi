import { useEffect } from 'react';
import { modoPrueba, ahora } from '../utils/reloj.js';
import { fechaEvento } from '../utils/fechas.js';

// Franja amarilla que avisa que la app está en modo prueba. El color se
// sale a propósito de la paleta: no debe confundirse con el diseño final.
export default function BannerPrueba() {
  useEffect(() => {
    if (!modoPrueba) return;
    document.body.classList.add('modo-prueba');
    return () => document.body.classList.remove('modo-prueba');
  }, []);

  if (!modoPrueba) return null;

  const simulada = fechaEvento(ahora(), {
    weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  });

  return (
    <div className="banner-prueba" role="status">
      Modo prueba: las entregas no se guardan. Simulando {simulada}
    </div>
  );
}
