import { ROLES, PAISES, URL_POLITICA_DATOS } from '../config.js';

// Piezas del formulario de perfil que comparten Registro (correo) y
// CompletarPerfil (Google): selector de rol, celular con indicativo y la
// autorización de tratamiento de datos.

export function SelectorRol({ valor, onCambio }) {
  return (
    <fieldset className="selector-rol">
      <legend className="selector-rol-titulo">¿Con qué rol participas?</legend>
      <div className="selector-rol-opciones">
        {ROLES.map(rol => (
          <label key={rol.id} className={`selector-rol-opcion ${valor === rol.id ? 'selector-rol-opcion--activa' : ''}`}>
            <input
              type="radio"
              name="rol"
              value={rol.id}
              checked={valor === rol.id}
              onChange={() => onCambio(rol.id)}
              className="sr-only"
            />
            <span className="selector-rol-nombre">{rol.nombre}</span>
            <span className="selector-rol-descripcion">{rol.descripcion}</span>
          </label>
        ))}
      </div>
      <p className="selector-rol-nota">El rol define en qué categoría compites y no se puede cambiar después.</p>
    </fieldset>
  );
}

export function CampoCelular({ pais, onCambioPais, celular, onCambioCelular }) {
  return (
    <div className="campo-celular">
      <label htmlFor="paisCelular" className="sr-only">País</label>
      <select
        id="paisCelular"
        className="campo-input campo-celular-pais"
        value={pais}
        onChange={e => onCambioPais(e.target.value)}
      >
        {PAISES.map(p => (
          <option key={p.id} value={p.id}>{p.id} {p.indicativo}</option>
        ))}
      </select>
      <label htmlFor="numeroCelular" className="sr-only">Número de celular</label>
      <input
        id="numeroCelular"
        className="campo-input campo-celular-numero"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="Número de celular"
        value={celular}
        onChange={e => onCambioCelular(e.target.value.replace(/[^0-9 ]/g, ''))}
      />
    </div>
  );
}

export function CasillaPolitica({ marcada, onCambio }) {
  return (
    <label className="casilla-politica">
      <input type="checkbox" checked={marcada} onChange={e => onCambio(e.target.checked)} />
      <span>
        Autorizo el tratamiento de mis datos según la{' '}
        <a href={URL_POLITICA_DATOS} target="_blank" rel="noopener noreferrer">política de tratamiento de datos</a>{' '}
        de Dropi.
      </span>
    </label>
  );
}

// "+57 3001234567": el formato que aceptan las reglas (^[+]?[0-9 ]{7,20}$)
export function armarTelefono(paisId, celular) {
  const indicativo = PAISES.find(p => p.id === paisId)?.indicativo || '';
  return `${indicativo} ${celular.replace(/\D/g, '')}`;
}

// Valida lo mismo que las reglas de Firestore, para avisar antes de enviar.
// Devuelve el mensaje de error o '' si todo está bien.
export function validarDatosPerfil({ nombre, paisId, celular, rol, aceptaPolitica }) {
  const nombreLimpio = nombre.trim();
  if (nombreLimpio.length < 2 || nombreLimpio.length > 80) return 'Escribe tu nombre completo.';
  const digitos = celular.replace(/\D/g, '');
  if (digitos.length < 7 || digitos.length > 15) return 'Escribe un número de celular válido.';
  if (!/^[+]?[0-9 ]{7,20}$/.test(armarTelefono(paisId, celular))) return 'Escribe un número de celular válido.';
  if (!ROLES.some(r => r.id === rol)) return 'Elige si participas como Dropshipper o como Proveedor.';
  if (!aceptaPolitica) return 'Para participar debes autorizar el tratamiento de tus datos.';
  return '';
}
