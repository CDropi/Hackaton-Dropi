import { CATEGORIAS, PAISES, URL_POLITICA_DATOS, URL_TERMINOS } from '../config.js';
import SelectorPais from './SelectorPais.jsx';

// Piezas del formulario de registro: categoría, celular (WhatsApp) con
// indicativo, cédula y las autorizaciones. Antes también las usaba
// CompletarPerfil, la pantalla del acceso con Google, que ya no existe.

export function SelectorCategoria({ valor, onCambio }) {
  return (
    <fieldset className="selector-rol">
      <legend className="selector-rol-titulo">¿En qué categoría participas?</legend>
      <div className="selector-rol-opciones">
        {CATEGORIAS.map(rol => (
          <label key={rol.id} className={`selector-rol-opcion ${valor === rol.id ? 'selector-rol-opcion--activa' : ''}`}>
            <input
              type="radio"
              name="categoria"
              value={rol.id}
              checked={valor === rol.id}
              onChange={() => onCambio(rol.id)}
              className="sr-only"
            />
            <span className="selector-rol-radio" aria-hidden="true" />
            <span className="selector-rol-textos">
              <span className="selector-rol-nombre">{rol.nombre}</span>
              <span className="selector-rol-descripcion">{rol.descripcion}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="selector-rol-nota">Si tu negocio no está aquí, elige la categoría más cercana. No se puede cambiar después.</p>
    </fieldset>
  );
}

export function CampoCelular({ pais, onCambioPais, celular, onCambioCelular }) {
  return (
    <div className="campo-celular">
      {/* Antes era un <select> nativo: no permite mostrar imágenes y en
          Windows los emojis de bandera se ven como letras ("CO"). */}
      <SelectorPais valor={pais} onCambio={onCambioPais} />
      <label htmlFor="numeroCelular" className="sr-only">Número de celular</label>
      <input
        id="numeroCelular"
        className="campo-input campo-celular-numero"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="WhatsApp"
        value={celular}
        onChange={e => onCambioCelular(e.target.value.replace(/[^0-9 ]/g, ''))}
      />
    </div>
  );
}

// Cédula: se guarda sin puntos, guiones ni espacios ("1.234.567" → "1234567").
// Acepta letras porque en algunos países el documento las lleva.
// Mismo formato que exigen las reglas: ^[A-Z0-9]{5,20}$
export function normalizarCedula(valor) {
  return valor.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function CampoCedula({ valor, onCambio }) {
  return (
    <>
      <label htmlFor="numeroCedula" className="sr-only">Cédula</label>
      <input
        id="numeroCedula"
        className="campo-input"
        placeholder="Cédula"
        autoComplete="off"
        maxLength={24}
        value={valor}
        onChange={e => onCambio(e.target.value.replace(/[^0-9A-Za-z.\- ]/g, ''))}
      />
    </>
  );
}

export function CasillaTerminos({ marcada, onCambio }) {
  return (
    <label className="casilla-politica">
      <input type="checkbox" checked={marcada} onChange={e => onCambio(e.target.checked)} />
      <span>
        Acepto los{' '}
        {URL_TERMINOS
          ? <a href={URL_TERMINOS} target="_blank" rel="noopener noreferrer">términos y condiciones</a>
          : <strong>términos y condiciones</strong>}{' '}
        de la Hackatón.
      </span>
    </label>
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

// "+573001234567": formato internacional sin espacios, como lo pide el
// contrato de TI (^\+[1-9][0-9]{7,14}$)
export function armarWhatsapp(paisId, celular) {
  const indicativo = PAISES.find(p => p.id === paisId)?.indicativo || '';
  return `${indicativo}${celular.replace(/\D/g, '')}`;
}

// Valida lo mismo que el backend (ver "Validaciones y límites" en el
// documento para TI). Devuelve el mensaje de error o '' si todo está bien.
export function validarRegistro(d) {
  const largo = (t) => t.trim().length;
  if (largo(d.nombreContacto) < 2 || largo(d.nombreContacto) > 80) return 'Escribe tu nombre completo.';
  if (largo(d.nombreNegocio) < 2 || largo(d.nombreNegocio) > 80) return 'Escribe el nombre de tu negocio.';
  if (!/^[A-Z0-9]{5,20}$/.test(normalizarCedula(d.cedula))) return 'Escribe un número de cédula válido.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo.trim()) || largo(d.correo) > 120) return 'Escribe un correo válido.';
  if (!/^\+[1-9][0-9]{7,14}$/.test(armarWhatsapp(d.paisId, d.celular))) return 'Escribe un número de WhatsApp válido.';
  if (!/^[0-9]{1,20}$/.test(d.cuentaDropiId.trim())) return 'Escribe el ID de tu cuenta Dropi (solo números).';
  if (!CATEGORIAS.some(c => c.id === d.categoria)) return 'Elige en qué categoría participas.';
  if (d.password.length < 8 || d.password.length > 128) return 'La contraseña debe tener al menos 8 caracteres.';
  if (d.password !== d.passwordConfirmacion) return 'Las contraseñas no coinciden.';
  if (!d.aceptaTerminos) return 'Para participar debes aceptar los términos y condiciones.';
  if (!d.aceptaPolitica) return 'Para participar debes autorizar el tratamiento de tus datos.';
  return '';
}
