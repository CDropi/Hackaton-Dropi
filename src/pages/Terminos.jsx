import DocumentoLegal from './DocumentoLegal.jsx';
import { TERMINOS } from '../data/terminos.js';
import { URL_POLITICA_DATOS } from '../config.js';

export default function Terminos() {
  return <DocumentoLegal documento={TERMINOS} otro={{ ruta: URL_POLITICA_DATOS, nombre: 'Política de tratamiento de datos' }} />;
}
