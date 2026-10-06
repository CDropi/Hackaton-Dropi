// =====================================================================
//  Asigna o quita permisos de admin (jurado/organización) con custom claims.
//
//  Uso (en Google Cloud Shell, después de la configuración de cargarDatosIniciales):
//    npm run admin -- correo@dropi.co            → da permisos
//    npm run admin -- correo@dropi.co --quitar   → los quita
//
//  La persona debe existir en Authentication. El cambio aplica cuando
//  cierra sesión y vuelve a entrar (o al renovarse su token, máx. 1 hora).
// =====================================================================

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Con credenciales de usuario (Cloud Shell) hay que indicar el proyecto explícitamente
const ID_PROYECTO = 'hackaton-dropi';
// initializeApp({ credential: applicationDefault() });
initializeApp({ credential: applicationDefault(), projectId: ID_PROYECTO });

const [, , correo, opcion] = process.argv;

if (!correo) {
  console.error('Uso: npm run admin -- correo@dropi.co [--quitar]');
  process.exit(1);
}

const quitar = opcion === '--quitar';

try {
  const usuario = await getAuth().getUserByEmail(correo);
  await getAuth().setCustomUserClaims(usuario.uid, quitar ? {} : { admin: true });
  console.log(quitar
    ? `✔ ${correo} ya no es admin`
    : `✔ ${correo} ahora es admin (uid: ${usuario.uid})`);
} catch (error) {
  console.error(`✘ No se pudo actualizar ${correo}:`, error.message);
  process.exit(1);
}
