import { ROLES, URL_POLITICA_DATOS } from '../../config.js';
import { aFecha, fechaEvento } from '../../utils/fechas.js';
import '../../styles/perfil.css';

function iniciales(nombre) {
  return nombre.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('');
}

export default function PerfilView({ perfil, entrega, onIrAlReto, onCerrarSesion }) {
  const rol = ROLES.find(r => r.id === perfil.rol);

  return (
    <div className="perfil">
      <header className="perfil-cabecera">
        <span className="perfil-avatar" aria-hidden="true">{iniciales(perfil.nombre)}</span>
        <h1 className="perfil-nombre">{perfil.nombre}</h1>
        <span className="perfil-rol">{rol?.nombre || perfil.rol}</span>
      </header>

      <div className="perfil-columna">
        <dl className="perfil-datos">
          <div className="perfil-dato">
            <img src="/media/Email.svg" alt="" />
            <dt className="sr-only">Correo</dt>
            <dd>{perfil.email}</dd>
          </div>
          <div className="perfil-dato">
            <img src="/media/Tel.svg" alt="" />
            <dt className="sr-only">Celular</dt>
            <dd>{perfil.telefono}</dd>
          </div>
        </dl>

        <section className="perfil-entrega">
          <h2 className="perfil-entrega-titulo">Tu entrega</h2>
          {entrega === undefined && <span className="spinner spinner--claro" />}
          {entrega === null && (
            <>
              <p className="perfil-entrega-texto">Todavía no has enviado tu Artifact.</p>
              <button type="button" className="boton boton--secundario boton--compacto" onClick={onIrAlReto}>
                Ir al reto
              </button>
            </>
          )}
          {entrega && (
            <p className="perfil-entrega-texto">
              <strong>Enviada</strong>
              {aFecha(entrega.creadoEn) && <> el {fechaEvento(aFecha(entrega.creadoEn), { day: 'numeric', month: 'long' })}</>}.
              Los resultados se anunciarán al cierre de la Hackatón.
            </p>
          )}
        </section>

        <a className="perfil-enlace" href={URL_POLITICA_DATOS} target="_blank" rel="noopener noreferrer">
          <img className="perfil-enlace-icono" src="/media/Politica.svg" alt="" />
          <span>Política de tratamiento de datos</span>
          <img className="perfil-enlace-flecha" src="/media/Arrow.svg" alt="" />
        </a>

        {/* Cerrar sesión ya no va aquí: en celular es el botón de vidrio fijo
            arriba a la derecha y en computador está en la barra lateral.
        <button type="button" className="boton boton--secundario perfil-salir solo-movil" onClick={onCerrarSesion}>
          <img src="/media/LogOut.svg" alt="" />
          Cerrar sesión
        </button> */}
      </div>
    </div>
  );
}
