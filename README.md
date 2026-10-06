# Hackatón Dropi — app web

App de la Hackatón virtual de Dropi (19 al 25 de octubre de 2026): registro con
rol, cronograma del bootcamp con enlaces de Google Meet, reto por rol, entrega
del Artifact y panel del jurado.

Base: la app de ExpoWinners (React 19 + Vite 8 + Firebase, desplegada en Vercel).
Se eliminó todo lo de entradas, QR, staff, Ruta Winner, Academy y premios.

## Rutas

| Ruta | Qué es |
|---|---|
| `/` | Participantes: iniciar sesión, registrarse, cronograma, reto, entrega y perfil |
| `/jurado` | Panel del jurado (solo cuentas con permiso de admin) |
| `/restablecer-contrasena` | Página propia para cambiar la contraseña (opcional, ver abajo) |

## Instalar y correr

Si vienes del proyecto de ExpoWinners, **borra la carpeta `node_modules`** antes:
cambiaron las dependencias (ya no se usan `qrcode.react` ni `html5-qrcode`).

```bash
npm install
npm run dev
```

## Estructura

```
src/
  config.js                 ← firebaseConfig, textos, roles, países
  lib/firebase.js           ← única inicialización de Firebase
  lib/auth.js               ← registro, login, Google, recuperación, permisos
  lib/dataLayer.js          ← todas las lecturas/escrituras de Firestore
  pages/Ingreso.jsx         ← flujo de acceso + app del participante
  pages/Jurado.jsx          ← panel del jurado
  views/acceso/             ← Login, Registro, CompletarPerfil
  views/cronograma/         ← días y charlas
  views/reto/               ← caso de estudio + formulario de entrega
  views/perfil/             ← datos del participante
firestore.rules             ← reglas de seguridad (pegar en la consola)
scripts/                    ← carga de datos y permisos de jurado (Cloud Shell)
```

## Antes de publicar

1. **Reglas de Firestore:** esta versión agrega el campo `aceptaPolitica` al
   perfil. Copia `firestore.rules` y vuelve a publicarlo en Firestore → Reglas.
   Sin este paso, el registro falla.
2. **Verifica `firebaseConfig`** en `src/config.js` contra la consola (se
   transcribió de una captura).
3. **Dominios autorizados** (Authentication → Configuración): agrega el
   dominio de Vercel y el dominio final.
4. Sin `dist/` ni `node_modules/` en los zips.

## Página de restablecer contraseña (opcional)

Por defecto, el enlace del correo de recuperación abre la página genérica de
Firebase y funciona sin hacer nada. Para usar la página propia de la app:
Authentication → Plantillas → Restablecer contraseña → editar → URL de acción
personalizada → `https://<dominio-de-la-app>/restablecer-contrasena`.

## Lecturas de Firestore (plan Spark: 50.000 lecturas al día)

Al entrar: perfil (1) + configuración (1) + cronograma (1 por día).
Al abrir Reto: reto (1 + 1 que hace la regla) + entrega (1).
No hay listeners en tiempo real y nada se vuelve a leer al cambiar de pestaña.
