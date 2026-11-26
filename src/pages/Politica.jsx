import DocumentoLegal from './DocumentoLegal.jsx';
import { POLITICA } from '../data/politica.js';
import { URL_TERMINOS } from '../config.js';

export default function Politica() {
  return <DocumentoLegal documento={POLITICA} otro={{ ruta: URL_TERMINOS, nombre: 'Términos y condiciones' }} />;
}
