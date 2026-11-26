import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Marca from '../components/Marca.jsx';
import BotonRegresar from '../components/BotonRegresar.jsx';
import '../styles/ingreso.css';
import '../styles/legal.css';

// Página de un documento legal de la app (términos y condiciones o política
// de datos). El texto viene de data/terminos.js y data/politica.js, que se
// generan desde los documentos de Word de legal. Cada numeral es un bloque
// que se abre y se cierra, para que el documento no abrume al leerlo.

// Separa el documento en lo que va antes del primer numeral (fecha de
// publicación) y una sección por cada título "h2" con su contenido.
function agrupar(bloques) {
  const preambulo = [];
  const secciones = [];
  for (const bloque of bloques) {
    if (bloque[0] === 'h2') secciones.push({ titulo: bloque[1], bloques: [] });
    else if (secciones.length) secciones.at(-1).bloques.push(bloque);
    else preambulo.push(bloque);
  }
  return { preambulo, secciones };
}

function Bloque({ bloque }) {
  const [tipo, contenido] = bloque;
  if (tipo === 'h3') return <h3 className="legal-h3">{contenido}</h3>;
  return (
    <p className={tipo === 'q' ? 'legal-p legal-p--sangria' : 'legal-p'}>
      <Partes partes={contenido} />
    </p>
  );
}

// Vuelve clicables los correos y las direcciones web dentro del texto
const PATRON_ENLACE = /(https?:\/\/[^\s)]+[^\s).,;]|[\w.+-]+@[\w-]+\.[\w.-]*\w)/g;
function conEnlaces(texto, clave) {
  return texto.split(PATRON_ENLACE).map((parte, i) => {
    if (i % 2 === 0) return parte;
    const href = parte.includes('@') && !parte.startsWith('http') ? `mailto:${parte}` : parte;
    return <a key={`${clave}-${i}`} href={href} target="_blank" rel="noopener noreferrer">{parte}</a>;
  });
}

function Partes({ partes }) {
  return partes.map((p, i) => (Array.isArray(p)
    ? <strong key={i}>{conEnlaces(p[1], i)}</strong>
    : <span key={i}>{conEnlaces(p, i)}</span>));
}

export default function DocumentoLegal({ documento, otro }) {
  const navigate = useNavigate();
  const { preambulo, secciones } = agrupar(documento.bloques);

  useEffect(() => {
    document.title = `${documento.titulo} | Hackatón Dropi`;
    window.scrollTo(0, 0);
    return () => { document.title = 'Hackatón Dropi'; };
  }, [documento]);

  // Si se abrió en una pestaña nueva (desde el registro), no hay a dónde
  // volver: se va al inicio de la app.
  function volver() {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  }

  return (
    <main className="legal">
      <header className="legal-cabecera">
        <BotonRegresar onClick={volver} etiqueta="Volver" />
        <Link to="/" className="legal-marca" aria-label="Ir a la app"><Marca tamano="pequena" /></Link>
      </header>

      <article className="legal-documento">
        <h1 className="legal-titulo">{documento.titulo}</h1>

        {preambulo.map((bloque, i) => (
          <p key={i} className="legal-meta"><Partes partes={bloque[1]} /></p>
        ))}

        <div className="legal-secciones">
          {secciones.map(seccion => (
            <details key={seccion.titulo} className="legal-seccion">
              <summary className="legal-seccion-titulo">{seccion.titulo}</summary>
              <div className="legal-seccion-cuerpo">
                {seccion.bloques.map((bloque, i) => <Bloque key={i} bloque={bloque} />)}
              </div>
            </details>
          ))}
        </div>

        {otro && (
          <p className="legal-otro">
            Consulta también: <Link to={otro.ruta}>{otro.nombre}</Link>
          </p>
        )}
      </article>
    </main>
  );
}
