# Hackatón Dropi — app web (solo frontend)

App de la Hackatón Dropi (del 4 al 14 de diciembre de 2026): registro e
inicio de sesión, cronograma del bootcamp (lives de YouTube), guía del
concurso, entrega por pasos (solución, cuestionario, video y aceptaciones),
acceso al Discord de participantes, y términos y política de datos.

El backend lo construye TI. Todos los servicios que la app usa están en
`src/lib/api.js`, con la ruta y los datos de cada uno.

## Instalar y correr

```bash
npm install
npm run dev
```

## Modo simulado y modo prueba

- **Modo simulado:** con `API.urlBase` vacía en `src/config.js`, la app
  guarda cuentas y entregas en el navegador (`src/lib/simulado.js`).
  Cuenta de prueba: `prueba@dropi.co` / `prueba1234`. Un correo de
  `@nodropi.co` simula una cuenta que no es de Dropi.
- **Modo prueba:** `PRUEBA` en `src/config.js` simula una fecha. Otra fecha
  sin tocar código: `?fecha=2026-12-14T13:30:00` al final de la URL. Se apaga
  solo el 4 de diciembre.

## Conectar con TI

1. Poner en `src/config.js` → `API.urlBase` la URL que entregue TI.
2. Elegir `API.sesion`: `"cookie"` (recomendado) o `"bearer"`.
3. Pedir a TI que autorice el dominio de la app en CORS (API y bucket S3).
4. Discord: `DISCORD.modo` en `"automatico"` cuando TI tenga sus servicios,
   o en `"enlace"` con la invitación de participantes (plan B).

## Estructura

```
src/
  config.js            ← API, fechas, cronograma, categorías, países, Discord, modo prueba
  data/guia.js         ← textos de la guía del concurso, criterios y aceptaciones
  data/terminos.js     ← términos y condiciones (generado desde el Word de legal)
  data/politica.js     ← política de tratamiento de datos (generado desde el Word de legal)
  lib/api.js           ← servicios de TI (y desvío al modo simulado)
  lib/simulado.js      ← backend de prueba en el navegador
  lib/errores.js       ← códigos de error del contrato y sus mensajes
  pages/               ← Ingreso (acceso y app), restablecer contraseña, páginas legales
  views/acceso/        ← inicio de sesión y registro
  views/reto/          ← guía, formulario de entrega, video y resumen
  views/cronograma/    ← lives del bootcamp
  views/perfil/        ← datos del participante
  components/          ← piezas compartidas (logo, campos, Discord…)
```

## Pendientes

- `FECHAS.registroAbre`: hora exacta de apertura del registro el 4 de diciembre.
- `CRONOGRAMA`: fechas, horas, líderes y enlaces de YouTube.
- `HERRAMIENTAS_MCP` y `ADJUNTOS_PERMITIDOS`: confirmar con TI.
- `DISCORD.enlace`: invitación de participantes, si se usa el plan B.
- Fechas de vigencia en los documentos legales.
