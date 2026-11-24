import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Marca from '../components/Marca.jsx';
import BotonRegresar from '../components/BotonRegresar.jsx';
import '../styles/ingreso.css';
import '../styles/legal.css';

// Página de un documento legal de la app (términos y condiciones o política
// de datos). El texto viene de data/terminos.js y data/politica.js, que se
// generan desde los documentos de Word de legal.

// "3.7 Datos sensibles" → "3-7-datos-sensibles" (para los enlaces del índice)
function slug(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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
  const secciones = documento.bloques.filter(b => b[0] === 'h2');

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

        {secciones.length > 3 && (
          <details className="legal-indice">
            <summary>Contenido</summary>
            <ol>
              {secciones.map(([, titulo]) => (
                <li key={titulo}><a href={`#${slug(titulo)}`}>{titulo}</a></li>
              ))}
            </ol>
          </details>
        )}

        {documento.bloques.map((bloque, i) => {
          const [tipo, contenido] = bloque;
          if (tipo === 'h2') return <h2 key={i} id={slug(contenido)} className="legal-h2">{contenido}</h2>;
          if (tipo === 'h3') return <h3 key={i} id={slug(contenido)} className="legal-h3">{contenido}</h3>;
          return (
            <p key={i} className={tipo === 'q' ? 'legal-p legal-p--sangria' : 'legal-p'}>
              <Partes partes={contenido} />
            </p>
          );
        })}

        {otro && (
          <p className="legal-otro">
            Consulta también: <Link to={otro.ruta}>{otro.nombre}</Link>
          </p>
        )}
      </article>
    </main>
  );
}
