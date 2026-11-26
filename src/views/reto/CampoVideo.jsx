import { useEffect, useRef, useState } from 'react';

// Límites del video (documento del concurso y contrato de TI)
const LIMITES_VIDEO = {
  segundos: 60,
  bytes: 200 * 1024 * 1024,
  ladoLargo: 1920,
  ladoCorto: 1080,
};
const EXTENSIONES = ['.mp4', '.mov'];
const ESPERA_MEDICION_MS = 8000;

const mb = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;

// Mide duración y resolución con el reproductor del navegador. Algunos .mov
// de iPhone (HEVC) no se pueden leer en Chrome de Windows: en ese caso se
// devuelve null y el EC2 mide el video después (el contrato lo acepta).
function medirVideo(archivo) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(archivo);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    const terminar = (medidas) => {
      clearTimeout(reloj);
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      resolve(medidas);
    };
    const reloj = setTimeout(() => terminar(null), ESPERA_MEDICION_MS);
    video.onloadedmetadata = () => {
      if (!Number.isFinite(video.duration) || !video.videoWidth) return terminar(null);
      terminar({ duracion_seg: Math.round(video.duration), ancho: video.videoWidth, alto: video.videoHeight });
    };
    video.onerror = () => terminar(null);
    video.src = url;
  });
}

// Revisa las reglas del video. Devuelve el problema o '' si cumple.
function problemaDelVideo(archivo, medidas) {
  const nombre = archivo.name.toLowerCase();
  if (!EXTENSIONES.some(ext => nombre.endsWith(ext))) return 'El video debe ser MP4 o MOV.';
  if (archivo.size > LIMITES_VIDEO.bytes) return `El video pesa ${mb(archivo.size)}. El máximo es 200 MB.`;
  if (!medidas) return '';
  if (medidas.duracion_seg > LIMITES_VIDEO.segundos) return `El video dura ${medidas.duracion_seg} segundos. El máximo es 60.`;
  const largo = Math.max(medidas.ancho, medidas.alto);
  const corto = Math.min(medidas.ancho, medidas.alto);
  if (largo > LIMITES_VIDEO.ladoLargo || corto > LIMITES_VIDEO.ladoCorto) {
    return `El video es de ${medidas.ancho} × ${medidas.alto}. El máximo es 1080p (1920 × 1080); no se aceptan videos en 4K.`;
  }
  return '';
}

// valor: { archivo, medidas, nombre_original } para un video nuevo,
//        { reutilizar: true } para mantener el de la versión anterior,
//        o null si todavía no hay video.
export default function CampoVideo({ valor, onCambio, videoAnterior }) {
  const [midiendo, setMidiendo] = useState(false);
  const [error, setError] = useState('');
  const [vistaPrevia, setVistaPrevia] = useState('');
  const inputRef = useRef(null);

  // Vista previa del video elegido
  useEffect(() => {
    if (!valor?.archivo) { setVistaPrevia(''); return undefined; }
    const url = URL.createObjectURL(valor.archivo);
    setVistaPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [valor?.archivo]);

  async function alElegir(e) {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    setError('');
    setMidiendo(true);
    const medidas = await medirVideo(archivo);
    setMidiendo(false);
    const problema = problemaDelVideo(archivo, medidas);
    if (problema) {
      setError(problema);
      return;
    }
    onCambio({ archivo, medidas, nombre_original: archivo.name });
  }

  return (
    <div className="campo-video">
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,.mp4,.mov"
        className="sr-only"
        id="entregaVideo"
        onChange={alElegir}
      />

      {valor?.reutilizar && videoAnterior && (
        <div className="campo-video-actual">
          <span className="campo-video-check"><img src="/media/Chulo.svg" alt="" /></span>
          <div>
            <p className="campo-video-nombre">Mantienes el video de tu versión anterior</p>
            <p className="campo-video-detalle">
              {videoAnterior.nombre_original}
              {videoAnterior.duracion_seg ? `, ${videoAnterior.duracion_seg} s` : ''}
            </p>
          </div>
        </div>
      )}

      {valor?.archivo && (
        <div className="campo-video-elegido">
          {vistaPrevia && <video className="campo-video-preview" src={vistaPrevia} controls playsInline />}
          <p className="campo-video-nombre">{valor.nombre_original}</p>
          <p className="campo-video-detalle">
            {mb(valor.archivo.size)}
            {valor.medidas
              ? `, ${valor.medidas.duracion_seg} s, ${valor.medidas.ancho} × ${valor.medidas.alto}`
              : ', medidas por confirmar'}
          </p>
          {!valor.medidas && (
            <p className="mensaje mensaje--aviso">
              No pudimos medir este video en tu navegador. Puedes enviarlo; revisaremos la duración y la calidad al recibirlo.
            </p>
          )}
        </div>
      )}

      {error && <p className="mensaje mensaje--error" role="alert">{error}</p>}

      <div className="campo-video-acciones">
        <label htmlFor="entregaVideo" className={`boton ${valor ? 'boton--secundario' : 'boton--primario'} boton--compacto`}>
          {midiendo ? <><span className="spinner" />Revisando el video</> : valor ? 'Subir otro video' : 'Elegir mi video'}
        </label>
        {videoAnterior && !valor?.reutilizar && (
          <button type="button" className="enlace-texto" onClick={() => { setError(''); onCambio({ reutilizar: true }); }}>
            Mantener el video anterior
          </button>
        )}
      </div>
      <p className="campo-largo-ayuda">MP4 o MOV, máximo 60 segundos, 200 MB y 1080p.</p>
    </div>
  );
}
