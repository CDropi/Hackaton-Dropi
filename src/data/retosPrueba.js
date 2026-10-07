// Retos de EJEMPLO para el modo prueba (PRUEBA en config.js).
// Solo sirven para ver cómo se ve la pantalla con texto real de largo
// parecido; los retos verdaderos se cargan en Firestore (colección `retos`).
// Si quieren probar con el texto definitivo, pueden pegarlo aquí.
export const RETOS_PRUEBA = {
  dropshipper: {
    titulo: "Más ventas, menos devoluciones",
    contexto: "Vendes 15 productos en tu tienda y cada semana despachas más de **300 pedidos** contra entrega. El problema: casi 1 de cada 4 pedidos no se recibe, y cada devolución se come la ganancia de varias ventas.\n\nHoy decides qué productos pautar mirando solo las ventas, sin saber cuáles te dejan plata de verdad después de fletes y devoluciones.",
    reto: "Crea con Claude un Artifact que te ayude a **ver la rentabilidad real** de tus productos y decidir cuáles escalar y cuáles pausar.\n\nPuede ser una calculadora, un tablero o cualquier herramienta que resuelva el problema de verdad.",
  },
  proveedor: {
    titulo: "El inventario que nadie ve",
    contexto: "Eres proveedor en Dropi y tienes **42 referencias** activas. Cada semana recibes pedidos de más de 200 dropshippers, pero no sabes qué productos se van a agotar hasta que ya es tarde.\n\nTu equipo revisa el inventario a mano en una hoja de cálculo, y los dropshippers se enteran del agotado cuando su cliente ya pagó.",
    reto: "Crea con Claude un Artifact que te ayude a **anticipar los agotados** y avisar a tiempo a tus dropshippers.\n\nPuede ser una calculadora, un tablero o cualquier herramienta que resuelva el problema de verdad.",
  },
  marca: {
    titulo: "Que tus clientes vuelvan",
    contexto: "Tienes una marca propia de cuidado personal y vendes por tu tienda, Instagram y WhatsApp. Dropi gestiona tus envíos, y cada mes llegan **cientos de clientes nuevos**.\n\nPero casi ninguno vuelve a comprar: no sabes quién compró qué, cuándo se le acaba el producto ni cuándo escribirle.",
    reto: "Crea con Claude un Artifact que te ayude a **convertir compradores de una vez en clientes recurrentes**.\n\nPuede ser un tablero de clientes, un calendario de recompra o cualquier herramienta que resuelva el problema de verdad.",
  },
};
