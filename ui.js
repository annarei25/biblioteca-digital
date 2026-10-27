const $ = (selector) => document.querySelector(selector);

// ---------- Constantes ----------
const VISTAS = ['catalogo', 'prestamos', 'formulario', 'resumen'];
const CAMPOS_FORMULARIO = ['titulo', 'autor', 'anio', 'genero', 'comentario', 'coleccion'];

// ---------- Estado de la interfaz (no se guarda) ----------
const filtros = { texto: '', estadoFiltro: 'todos', genero: '' };
let idEditando = null;      // id del libro que se edita (null = modo agregar)
let idPrestando = null;     // id del libro del modal de prestar
let accionPendiente = null; // función que se ejecuta al confirmar
let modalAbierto = null;
let elementoPrevio = null;  // elemento que tenía el foco antes de abrir el modal

// ---------- Elementos del DOM ----------
const elMensaje = $('#mensaje');
const elSaludo = $('#saludo');
const elMenu = $('#menu');
const enlacesMenu = document.querySelectorAll('#menu a[data-vista]');
const enlacePrestamos = $('#menu a[data-vista="prestamos"]');

const vistaFormulario = $('#vista-formulario');

const campoBusqueda = $('#busqueda');
const selectGenero = $('#filtro-genero');
const selectOrdenCampo = $('#orden-campo');
const selectOrdenDireccion = $('#orden-direccion');
const grupoEstado = $('#filtros-estado');
const elContador = $('#contador');
const listaLibros = $('#lista-libros');
const catalogoVacio = $('#catalogo-vacio');

const listaActivos = $('#lista-activos');
const activosVacio = $('#activos-vacio');
const listaHistorial = $('#lista-historial');
const historialVacio = $('#historial-vacio');

const formLibro = $('#form-libro');
const campos = {
  titulo: $('#campo-titulo'),
  autor: $('#campo-autor'),
  anio: $('#campo-anio'),
  genero: $('#campo-genero'),
  comentario: $('#campo-comentario'),
  coleccion: $('#campo-coleccion'),
};
const tituloFormulario = $('#titulo-formulario');
const botonGuardar = $('#boton-guardar');
const botonCancelarEdicion = $('#boton-cancelar-edicion');
const elRestantes = $('#restantes');

const resumenDatos = $('#resumen-datos');
const resumenGeneros = $('#resumen-generos');
const campoUsuario = $('#campo-usuario');
const botonTema = $('#boton-tema');
const botonReset = $('#boton-reset');

const modalPrestar = $('#modal-prestar');
const formPrestar = $('#form-prestar');
const textoPrestar = $('#texto-prestar');
const campoPersona = $('#campo-persona');
const errorPersona = $('#error-persona');

const modalConfirmar = $('#modal-confirmar');
const tituloConfirmar = $('#titulo-modal-confirmar');
const textoConfirmar = $('#texto-confirmar');
const botonConfirmar = $('#boton-confirmar');

// ---------- Utilidades de DOM ----------
function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function crearEtiqueta(texto, tipo) {
  return crearElemento('span', `etiqueta etiqueta-${tipo}`, texto);
}

function crearBoton(texto, clase, accion, id, textoAccesible) {
  const boton = crearElemento('button', ['boton', clase].filter(Boolean).join(' '), texto);
  boton.type = 'button';
  boton.dataset.accion = accion;
  boton.dataset.id = id;
  if (textoAccesible) boton.setAttribute('aria-label', textoAccesible);
  return boton;
}

function crearOpcion(valor, texto) {
  const opcion = document.createElement('option');
  opcion.value = valor;
  opcion.textContent = texto;
  return opcion;
}

function dias(cantidad) {
  return `${cantidad} ${cantidad === 1 ? 'día' : 'días'}`;
}

// ---------- Mensajes en la página (sustituyen a alert) ----------
function mostrarMensaje(texto, tipo = 'exito') {
  elMensaje.textContent = texto;
  elMensaje.className = `mensaje mensaje-${tipo}`;
  elMensaje.hidden = false;
}

function ocultarMensaje() {
  elMensaje.hidden = true;
  elMensaje.textContent = '';
}

// ---------- Navegación entre vistas ----------
function mostrarVista(nombre) {
  for (const vista of VISTAS) {
    $(`#vista-${vista}`).hidden = vista !== nombre;
  }
  for (const enlace of enlacesMenu) {
    const activo = enlace.dataset.vista === nombre;
    enlace.classList.toggle('activo', activo);
    if (activo) enlace.setAttribute('aria-current', 'page');
    else enlace.removeAttribute('aria-current');
  }
  ocultarMensaje();
}

elMenu.addEventListener('click', (evento) => {
  const enlace = evento.target.closest('a[data-vista]');
  if (!enlace) return;
  evento.preventDefault();
  mostrarVista(enlace.dataset.vista);
});

// ---------- Tema claro / oscuro ----------
function temaActual() {
  if (estado.tema) return estado.tema;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
}

function aplicarTema() {
  const tema = temaActual();
  document.documentElement.dataset.tema = tema;
  botonTema.textContent = tema === 'oscuro' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
}

botonTema.addEventListener('click', () => {
  establecerTema(temaActual() === 'oscuro' ? 'claro' : 'oscuro');
  aplicarTema();
});

// ---------- Menú: saludo y contador de préstamos ----------
function renderMenu() {
  enlacePrestamos.textContent = `Mis préstamos (${prestamosActivos().length})`;
  elSaludo.textContent = estado.usuario ? `Hola, ${estado.usuario}` : '';
}

// ============================================================
// VISTA 1: CATÁLOGO
// ============================================================
function crearTarjeta(libro) {
  const prestamo = prestamoActivo(libro.id);
  const tarjeta = crearElemento('article', 'tarjeta');
  tarjeta.classList.toggle('prestada', Boolean(prestamo));

  const etiquetas = crearElemento('div', 'etiquetas');
  if (prestamo) {
    etiquetas.append(crearEtiqueta('Prestado', 'aviso'));
    if (estaVencido(prestamo)) etiquetas.append(crearEtiqueta('Vencido', 'error'));
  } else if (libro.coleccion) {
    etiquetas.append(crearEtiqueta('De colección', 'coleccion'));
  } else {
    etiquetas.append(crearEtiqueta('Disponible', 'ok'));
  }

  tarjeta.append(
    etiquetas,
    crearElemento('h3', 'tarjeta-titulo', libro.titulo),
    crearElemento('p', 'tarjeta-autor', libro.autor),
    crearElemento('p', 'tarjeta-datos', `${libro.anio} - ${libro.genero}`)
  );

  if (libro.comentario) {
    tarjeta.append(crearElemento('p', 'tarjeta-comentario', libro.comentario));
  }

  if (prestamo) {
    tarjeta.append(
      crearElemento('p', 'tarjeta-prestamo', `Prestado a ${prestamo.persona}`),
      crearElemento('p', 'tarjeta-prestamo', `Devolver antes del ${formatearFecha(prestamo.fechaLimite)}`)
    );
  }

  const acciones = crearElemento('div', 'tarjeta-acciones');
  const principal = prestamo
    ? crearBoton('Devolver', '', 'devolver', libro.id, `Devolver ${libro.titulo}`)
    : crearBoton('Prestar', '', 'prestar', libro.id, `Prestar ${libro.titulo}`);
  principal.disabled = libro.coleccion; // los de colección nunca se prestan

  acciones.append(
    principal,
    crearBoton('Editar', 'boton-secundario', 'editar', libro.id, `Editar ${libro.titulo}`),
    crearBoton('Eliminar', 'boton-peligro', 'eliminar', libro.id, `Eliminar ${libro.titulo}`)
  );
  tarjeta.append(acciones);
  return tarjeta;
}

function renderSelectorGeneros() {
  const generos = generosExistentes();
  if (!generos.includes(filtros.genero)) filtros.genero = '';
  selectGenero.replaceChildren(
    crearOpcion('', 'Todos los géneros'),
    ...generos.map((genero) => crearOpcion(genero, genero))
  );
  selectGenero.value = filtros.genero;
}

function renderCatalogo() {
  renderSelectorGeneros();
  // Primero se filtra y después se ordena
  const filtrados = filtrarLibros(estado.libros, filtros);
  const ordenados = ordenarLibros(filtrados, estado.orden.campo, estado.orden.direccion);

  elContador.textContent = `Mostrando ${filtrados.length} de ${estado.libros.length} libros`;
  listaLibros.replaceChildren(...ordenados.map(crearTarjeta));
  catalogoVacio.hidden = ordenados.length > 0;
}

// Un solo listener para todos los botones de las tarjetas (delegación)
listaLibros.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button[data-accion]');
  if (!boton || boton.disabled) return;
  const { accion, id } = boton.dataset;

  if (accion === 'prestar') abrirModalPrestar(id);
  if (accion === 'devolver') devolver(prestamoActivo(id).id);
  if (accion === 'editar') cargarEnFormulario(buscarLibro(id));
  if (accion === 'eliminar') pedirEliminar(id);
});

campoBusqueda.addEventListener('input', () => {
  filtros.texto = campoBusqueda.value;
  renderCatalogo();
});

selectGenero.addEventListener('change', () => {
  filtros.genero = selectGenero.value;
  renderCatalogo();
});

grupoEstado.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button[data-estado]');
  if (!boton) return;
  filtros.estadoFiltro = boton.dataset.estado;
  sincronizarBotonesEstado();
  renderCatalogo();
});

function sincronizarBotonesEstado() {
  for (const boton of grupoEstado.querySelectorAll('button[data-estado]')) {
    const activo = boton.dataset.estado === filtros.estadoFiltro;
    boton.classList.toggle('activo', activo);
    boton.setAttribute('aria-pressed', String(activo));
  }
}

function cambiarOrden() {
  establecerOrden(selectOrdenCampo.value, selectOrdenDireccion.value);
  renderCatalogo();
}
selectOrdenCampo.addEventListener('change', cambiarOrden);
selectOrdenDireccion.addEventListener('change', cambiarOrden);

// ============================================================
// VISTA 2: MIS PRÉSTAMOS
// ============================================================
function crearItemActivo(prestamo) {
  const vencido = estaVencido(prestamo);
  const item = crearElemento('li', 'item-prestamo');
  item.classList.toggle('vencido', vencido);

  const info = crearElemento('div', 'item-info');
  info.append(
    crearElemento('strong', 'item-titulo', tituloDe(prestamo.idLibro)),
    crearElemento('p', null, `Prestado a ${prestamo.persona}`),
    crearElemento('p', null, `Fecha límite: ${formatearFecha(prestamo.fechaLimite)}`)
  );
  if (vencido) {
    const aviso = crearElemento('p', 'item-retraso');
    aviso.append(
      crearEtiqueta('Vencido', 'error'),
      document.createTextNode(` ${dias(diasRetraso(prestamo))} de retraso`)
    );
    info.append(aviso);
  }

  item.append(
    info,
    crearBoton('Devolver', '', 'devolver', prestamo.id, `Devolver ${tituloDe(prestamo.idLibro)}`)
  );
  return item;
}

function crearItemHistorial(prestamo) {
  const retraso = diasRetraso(prestamo);
  const item = crearElemento('li', 'item-prestamo');

  const info = crearElemento('div', 'item-info');
  info.append(
    crearElemento('strong', 'item-titulo', tituloDe(prestamo.idLibro)),
    crearElemento('p', null, `Persona: ${prestamo.persona}`),
    crearElemento('p', null, `Prestado el ${formatearFecha(prestamo.fechaPrestamo)} y devuelto el ${formatearFecha(prestamo.fechaDevolucion)}`)
  );

  const resultado = retraso > 0
    ? crearEtiqueta(`Con retraso (${dias(retraso)})`, 'error')
    : crearEtiqueta('A tiempo', 'ok');

  item.append(info, resultado);
  return item;
}

function renderPrestamos() {
  const activos = listarPrestamosActivos();
  listaActivos.replaceChildren(...activos.map(crearItemActivo));
  activosVacio.hidden = activos.length > 0;

  const historial = listarHistorial();
  listaHistorial.replaceChildren(...historial.map(crearItemHistorial));
  historialVacio.hidden = historial.length > 0;
}

listaActivos.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button[data-accion="devolver"]');
  if (boton) devolver(boton.dataset.id);
});

// Devolver (se usa desde el catálogo y desde Mis préstamos)
function devolver(idPrestamo) {
  const prestamo = estado.prestamos.find((p) => p.id === idPrestamo);
  const titulo = prestamo ? tituloDe(prestamo.idLibro) : '';
  const resultado = devolverPrestamo(idPrestamo);

  if (!resultado.ok) {
    mostrarMensaje(resultado.error, 'error');
    return;
  }
  renderTodo();
  if (resultado.diasRetraso === 0) {
    mostrarMensaje(`«${titulo}» se devolvió a tiempo.`);
  } else {
    mostrarMensaje(`«${titulo}» se devolvió con ${dias(resultado.diasRetraso)} de retraso.`, 'aviso');
  }
}

// ============================================================
// MODALES
// ============================================================
function abrirModal(modal, elementoFoco) {
  elementoPrevio = document.activeElement;
  modal.hidden = false;
  modalAbierto = modal;
  elementoFoco.focus();
}

function cerrarModal() {
  if (!modalAbierto) return;
  modalAbierto.hidden = true;
  modalAbierto = null;
  idPrestando = null;
  accionPendiente = null;
  if (elementoPrevio && elementoPrevio.isConnected) elementoPrevio.focus();
}

// Cerrar con Cancelar o haciendo clic fuera de la ventana
for (const modal of [modalPrestar, modalConfirmar]) {
  modal.addEventListener('click', (evento) => {
    if (evento.target === modal || evento.target.closest('[data-cerrar]')) cerrarModal();
  });
}

// --- Prestar ---
function abrirModalPrestar(idLibro) {
  const permiso = puedePrestar(idLibro);
  if (!permiso.ok) {
    mostrarMensaje(permiso.error, 'error'); // por ejemplo, el cuarto préstamo
    return;
  }
  idPrestando = idLibro;
  textoPrestar.textContent = `Libro: «${tituloDe(idLibro)}»`;
  campoPersona.value = estado.usuario; // prellenado con el nombre guardado
  errorPersona.textContent = '';
  campoPersona.removeAttribute('aria-invalid');
  abrirModal(modalPrestar, campoPersona);
}

formPrestar.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const titulo = tituloDe(idPrestando);
  const persona = campoPersona.value.trim();
  const resultado = prestarLibro(idPrestando, persona);

  if (!resultado.ok) {
    if (resultado.campo === 'persona') {
      errorPersona.textContent = resultado.error; // el error va dentro del modal
      campoPersona.setAttribute('aria-invalid', 'true');
      campoPersona.focus();
    } else {
      cerrarModal();
      mostrarMensaje(resultado.error, 'error');
    }
    return;
  }

  cerrarModal();
  renderTodo();
  mostrarMensaje(`«${titulo}» prestado a ${persona}.`);
});

// --- Confirmar (eliminar y restablecer) ---
function pedirConfirmacion({ titulo, texto, textoBoton, alConfirmar }) {
  tituloConfirmar.textContent = titulo;
  textoConfirmar.textContent = texto;
  botonConfirmar.textContent = textoBoton;
  accionPendiente = alConfirmar;
  abrirModal(modalConfirmar, botonConfirmar);
}

botonConfirmar.addEventListener('click', () => {
  const accion = accionPendiente;
  cerrarModal();
  if (accion) accion();
});

function pedirEliminar(idLibro) {
  const permiso = puedeEliminarLibro(idLibro);
  if (!permiso.ok) {
    mostrarMensaje(permiso.error, 'error');
    return;
  }
  const titulo = tituloDe(idLibro);
  pedirConfirmacion({
    titulo: 'Eliminar libro',
    texto: `¿Eliminar «${titulo}»? Se borrará también su historial de préstamos.`,
    textoBoton: 'Eliminar',
    alConfirmar: () => {
      const resultado = eliminarLibro(idLibro);
      if (!resultado.ok) {
        mostrarMensaje(resultado.error, 'error');
        return;
      }
      if (idEditando === idLibro) reiniciarFormulario();
      renderTodo();
      mostrarMensaje(`«${titulo}» eliminado.`);
    },
  });
}

// --- Escape: cierra el modal; si no hay modal, limpia el formulario ---
document.addEventListener('keydown', (evento) => {
  if (evento.key !== 'Escape') return;
  if (modalAbierto) {
    cerrarModal();
    return;
  }
  if (!vistaFormulario.hidden) reiniciarFormulario();
});

// ============================================================
// VISTA 3: AGREGAR / EDITAR LIBRO
// ============================================================
function actualizarRestantes() {
  elRestantes.textContent = campos.comentario.maxLength - campos.comentario.value.length;
}

function leerFormulario() {
  return {
    titulo: campos.titulo.value,
    autor: campos.autor.value,
    anio: campos.anio.value,
    genero: campos.genero.value,
    comentario: campos.comentario.value,
    coleccion: campos.coleccion.checked,
  };
}

// Escribe el error bajo cada campo y manda el foco al primero con error
function mostrarErrores(errores) {
  for (const nombre of CAMPOS_FORMULARIO) {
    const mensaje = errores[nombre] ?? '';
    $(`#error-${nombre}`).textContent = mensaje;
    if (mensaje) campos[nombre].setAttribute('aria-invalid', 'true');
    else campos[nombre].removeAttribute('aria-invalid');
  }
  const primero = CAMPOS_FORMULARIO.find((nombre) => errores[nombre]);
  if (primero) campos[primero].focus();
}

// Vuelve al modo "agregar"
function reiniciarFormulario() {
  formLibro.reset();
  idEditando = null;
  mostrarErrores({});
  actualizarRestantes();
  tituloFormulario.textContent = 'Agregar libro';
  botonGuardar.textContent = 'Agregar libro';
  botonCancelarEdicion.hidden = true;
}

// Pasa al modo "editar" con los datos del libro
function cargarEnFormulario(libro) {
  reiniciarFormulario();
  idEditando = libro.id;
  campos.titulo.value = libro.titulo;
  campos.autor.value = libro.autor;
  campos.anio.value = libro.anio;
  campos.genero.value = libro.genero;
  campos.comentario.value = libro.comentario;
  campos.coleccion.checked = libro.coleccion;
  actualizarRestantes();
  tituloFormulario.textContent = 'Editar libro';
  botonGuardar.textContent = 'Guardar cambios';
  botonCancelarEdicion.hidden = false;
  mostrarVista('formulario');
  campos.titulo.focus();
}

formLibro.addEventListener('submit', (evento) => {
  evento.preventDefault(); // evita que la página se recargue
  ocultarMensaje();

  const datos = leerFormulario();
  const resultado = idEditando ? editarLibro(idEditando, datos) : agregarLibro(datos);

  if (!resultado.ok) {
    mostrarErrores(resultado.errores);
    return;
  }

  const accion = idEditando ? 'actualizado' : 'agregado';
  reiniciarFormulario();
  renderTodo();
  mostrarMensaje(`Libro «${resultado.libro.titulo}» ${accion} correctamente.`);
});

campos.comentario.addEventListener('input', actualizarRestantes);
botonCancelarEdicion.addEventListener('click', reiniciarFormulario);

// ============================================================
// VISTA 4: RESUMEN Y AJUSTES
// ============================================================
function renderResumen() {
  const resumen = calcularResumen();
  const datos = [
    ['Total de libros', resumen.total],
    ['Disponibles', resumen.disponibles],
    ['Prestados', resumen.prestados],
    ['Vencidos', resumen.vencidos],
  ];

  resumenDatos.replaceChildren(
    ...datos.map(([etiqueta, valor]) => {
      const dato = crearElemento('div', 'dato');
      dato.append(
        crearElemento('p', 'dato-valor', String(valor)),
        crearElemento('p', 'dato-etiqueta', etiqueta)
      );
      return dato;
    })
  );

  const generos = Object.entries(resumen.porGenero);
  if (generos.length === 0) {
    resumenGeneros.replaceChildren(crearElemento('li', null, 'No hay libros.'));
  } else {
    resumenGeneros.replaceChildren(
      ...generos.map(([genero, cantidad]) => crearElemento('li', null, `${genero}: ${cantidad}`))
    );
  }
}

campoUsuario.addEventListener('input', () => {
  establecerUsuario(campoUsuario.value);
  renderMenu();
});

botonReset.addEventListener('click', () => {
  pedirConfirmacion({
    titulo: 'Restablecer biblioteca',
    texto: 'Se borrarán todos los datos guardados y volverán los libros y préstamos iniciales.',
    textoBoton: 'Restablecer',
    alConfirmar: () => {
      restablecerBiblioteca();
      Object.assign(filtros, { texto: '', estadoFiltro: 'todos', genero: '' });
      reiniciarFormulario();
      aplicarTema();
      sincronizarControles();
      renderTodo();
      mostrarMensaje('Biblioteca restablecida.');
    },
  });
});

// ============================================================
// ARRANQUE
// ============================================================
function renderTodo() {
  renderMenu();
  renderCatalogo();
  renderPrestamos();
  renderResumen();
}

// Pone los controles según el estado (filtros, orden y usuario guardados)
function sincronizarControles() {
  campoBusqueda.value = filtros.texto;
  selectOrdenCampo.value = estado.orden.campo;
  selectOrdenDireccion.value = estado.orden.direccion;
  campoUsuario.value = estado.usuario;
  sincronizarBotonesEstado();
}

function iniciar() {
  cargarEstado();

  campos.genero.replaceChildren(
    crearOpcion('', 'Elige un género'),
    ...GENEROS.map((genero) => crearOpcion(genero, genero))
  );

  aplicarTema();
  sincronizarControles();
  reiniciarFormulario();
  renderTodo();
  mostrarVista('catalogo');
}

iniciar();
