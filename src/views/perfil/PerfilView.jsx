import { Link } from 'react-router-dom';
import { CATEGORIAS, PAISES, URL_POLITICA_DATOS, URL_TERMINOS } from '../../config.js';
import { fechaHoraEvento } from '../../utils/fechas.js';
import { entregasAbiertas } from '../../utils/reloj.js';
import '../../styles/perfil.css';

function iniciales(nombre) {
  return nombre.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('');
}

// Datos del participante tal como los devuelve el backend (GET /me):
// id_participante, nombre_contacto, nombre_negocio, cedula, correo,
// whatsapp, pais, cuenta_dropi_id, categoria.
export default function PerfilView({ participante, entrega, onIrAlReto }) {
  const categoria = CATEGORIAS.find(c => c.id === participante.categoria);
  const pais = PAISES.find(p => p.id === participante.pais);

  return (
    <div className="perfil">
      <header className="perfil-cabecera">
        <span className="perfil-avatar" aria-hidden="true">{iniciales(participante.nombre_contacto)}</span>
        <h1 className="perfil-nombre">{participante.nombre_contacto}</h1>
        {participante.nombre_negocio && <p className="perfil-negocio">{participante.nombre_negocio}</p>}
        <span className="perfil-rol">{categoria?.nombre || participante.categoria}</span>
        <div className="perfil-codigo">
          <span className="perfil-codigo-etiqueta">Tu código de participante</span>
          <span className="perfil-codigo-valor">{participante.id_participante}</span>
        </div>
      </header>

      <div className="perfil-columna">
        <dl className="perfil-datos">
          <Dato icono="/media/Email.svg" etiqueta="Correo" valor={participante.correo} />
          <Dato icono="/media/Tel.svg" etiqueta="WhatsApp" valor={participante.whatsapp} />
          <Dato icono="/media/Documento.svg" etiqueta="Cédula" valor={participante.cedula} />
          <Dato icono="/media/Documento.svg" etiqueta="ID de cuenta Dropi" valor={participante.cuenta_dropi_id} />
          {pais && (
            <Dato icono={`/media/banderas/${pais.id.toLowerCase()}.svg`} etiqueta="País" valor={pais.nombre} bandera />
          )}
        </dl>

        <section className="perfil-entrega">
          <h2 className="perfil-entrega-titulo">Tu entrega</h2>
          {entrega === undefined && <span className="spinner spinner--claro" />}
          {entrega === null && (
            <>
              <p className="perfil-entrega-texto">Todavía no has enviado tu solución.</p>
              <button type="button" className="boton boton--secundario boton--compacto" onClick={onIrAlReto}>
                Ir al reto
              </button>
            </>
          )}
          {entrega && (
            <>
              <p className="perfil-entrega-texto">
                <strong>{entrega.titulo}</strong>
                <br />
                Versión {entrega.version}, recibida el {fechaHoraEvento(new Date(entrega.recibido_en))} (hora Colombia).
              </p>
              {entregasAbiertas() && (
                <button type="button" className="boton boton--secundario boton--compacto" onClick={onIrAlReto}>
                  Ver o cambiar mi entrega
                </button>
              )}
            </>
          )}
        </section>

        <Link className="perfil-enlace" to={URL_TERMINOS}>
          <img className="perfil-enlace-icono" src="/media/Terminos.svg" alt="" />
          <span>Términos y condiciones</span>
          <img className="perfil-enlace-flecha" src="/media/Arrow.svg" alt="" />
        </Link>

        <Link className="perfil-enlace" to={URL_POLITICA_DATOS}>
          <img className="perfil-enlace-icono" src="/media/Politica.svg" alt="" />
          <span>Política de tratamiento de datos</span>
          <img className="perfil-enlace-flecha" src="/media/Arrow.svg" alt="" />
        </Link>
      </div>
    </div>
  );
}

function Dato({ icono, etiqueta, valor, bandera = false }) {
  if (!valor) return null;
  return (
    <div className="perfil-dato">
      <img className={bandera ? 'perfil-dato-bandera' : undefined} src={icono} alt="" />
      <div className="perfil-dato-textos">
        <dt className="perfil-dato-etiqueta">{etiqueta}</dt>
        <dd>{valor}</dd>
      </div>
    </div>
  );
}
