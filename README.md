# Hackatón Dropi — app web (solo frontend)

App de la Hackatón Dropi (del 4 al 14 de diciembre de 2026): registro e
inicio de sesión con correo, cronograma del bootcamp (lives de YouTube),
guía del concurso y entrega por pasos (solución, cuestionario, video y
aceptaciones).

El backend lo construye TI. Esta app se conecta a sus servicios según el
documento **"Hackatón Dropi: especificación de servicios (API) para TI"**.
Ya no usa Firebase ni acceso con Google.

## Instalar y correr

```bash
npm install
npm run dev
```

## Modo simulado y modo prueba

- **Modo simulado:** con `API.urlBase` vacía en `src/config.js`, la app
  guarda cuentas y entregas en el navegador (`src/lib/simulado.js`). Sirve
  para diseñar y probar sin backend. El ID de cuenta Dropi `000000` simula
  una cuenta que no es de Dropi.
- **Modo prueba:** `PRUEBA` en `src/config.js` simula una fecha (por
  defecto el 5 de diciembre a las 10:00 a. m.). Otra fecha sin tocar código:
  `?fecha=2026-12-14T13:30:00` al final de la URL. Se apaga solo el 4 de
  diciembre.

## Conectar con TI

1. Poner en `src/config.js` → `API.urlBase` la URL que entregue TI.
2. Elegir `API.sesion`: `"cookie"` (recomendado) o `"bearer"`.
3. Pedir a TI que autorice el dominio de la app en CORS (API y bucket S3).

## Estructura

```
src/
  config.js            ← API, fechas, cronograma, categorías, opciones del formulario
  data/guia.js         ← textos de la guía del concurso, criterios y aceptaciones
  lib/api.js           ← todos los servicios de TI (y desvío al modo simulado)
  lib/simulado.js      ← backend de mentiras en el navegador
  lib/errores.js       ← códigos de error del contrato y sus mensajes
  pages/Ingreso.jsx    ← sesión + app (Cronograma, Reto, Perfil)
  views/acceso/        ← Login y Registro
  views/reto/          ← Guía, formulario de entrega, video y resumen
  views/cronograma/    ← lives del bootcamp
  views/perfil/        ← datos del participante
```

## Pendientes

- `FECHAS.registroAbre`: hora exacta del live de lanzamiento.
- `CRONOGRAMA`: fechas, horas, líderes y enlaces de YouTube.
- `HERRAMIENTAS_MCP` y `ADJUNTOS_PERMITIDOS`: confirmar con TI.
- `URL_TERMINOS`: enlace de los términos y condiciones (legal).
- Íconos de la pestaña del navegador: siguen siendo los de ExpoWinners.
