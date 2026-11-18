import { useState } from 'react';

// Campo de contraseña con el botón de ver/ocultar. Antes este bloque estaba
// copiado cinco veces entre Ingreso, Staff y Restablecer.
export default function CampoPassword({ id, valor, onCambio, placeholder, autoComplete = 'current-password' }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="campo-password">
      <label htmlFor={id} className="sr-only">{placeholder}</label>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className="campo-input campo-input--password"
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={valor}
        onChange={e => onCambio(e.target.value)}
      />
      <button
        type="button"
        className="campo-password-toggle"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        <img src={visible ? '/media/NoVer.svg' : '/media/Ver.svg'} alt="" />
      </button>
    </div>
  );
}
