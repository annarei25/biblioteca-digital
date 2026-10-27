# Biblioteca Digital

Primer parcial de Programación Web. Aplicación de una sola página para gestionar una biblioteca: un catálogo de libros que se prestan a personas y se devuelven, un formulario para agregar y editar libros, y un resumen con ajustes de usuario.

Está hecha solo con HTML, CSS y JavaScript, sin librerías ni frameworks.

## Cómo ejecutarla

Abre `index.html` en el navegador. No necesita instalación ni servidor.

## Qué hace

- **Catálogo:** tarjetas generadas desde los datos, con búsqueda, filtros por estado y género, orden y contador.
- **Mis préstamos:** préstamos activos por fecha límite, marca de vencidos con días de retraso e historial de devoluciones.
- **Agregar y editar libro:** un solo formulario con validación bajo cada campo y contador de caracteres.
- **Resumen y ajustes:** totales calculados, tema claro/oscuro, nombre del usuario y restablecer biblioteca.
- Los datos se conservan al recargar con `localStorage`.
- Modales propios para pedir el nombre y confirmar; se cierran con Cancelar o Escape.

## Estructura

| Archivo | Contenido |
|---|---|
| `index.html` | HTML semántico, SEO básico, las cuatro vistas y los modales |
| `styles.css` | Estilos: Grid, Flexbox, tema claro/oscuro, transiciones, animaciones y diseño responsivo |
| `logica.js` | Reglas de negocio y persistencia. No usa el DOM |
| `ui.js` | Dibuja la pantalla a partir de los datos y maneja los eventos |
| `logo.svg` | Logotipo |

## Decisiones de diseño

- **Lógica separada de la interfaz:** `logica.js` no dibuja nada; `ui.js` solo llama a sus funciones y dibuja el resultado.
- **Dos colecciones como única fuente de verdad:** `libros` y `prestamos`. Si un libro está disponible, vencido o cuántos días de retraso lleva, se calcula; no se guarda.
- **Devolver no borra:** se registra la fecha de devolución y el préstamo queda en el historial.
- **Fechas como texto `AAAA-MM-DD`:** se guardan fácil en JSON y se comparan directamente.
- **Sin `alert`, `prompt` ni `confirm`:** los mensajes se escriben en la página y los datos se piden con modales propios.
- **Sin `innerHTML`:** todo el contenido se crea con `createElement` y `textContent`.
- **Fuentes del sistema:** funcionan sin conexión.

## Reglas de negocio

1. Máximo 3 préstamos activos a la vez.
2. Un libro prestado no se puede prestar de nuevo.
3. Los libros de colección no se prestan.
4. Cada préstamo vence a los 14 días.
5. Un libro con préstamo activo no se puede eliminar ni marcar como de colección.
6. No se admiten libros duplicados (mismo título y autor).
