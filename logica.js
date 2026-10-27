// ---------- Constantes ----------
const DIAS_PRESTAMO = 14;
const MAX_PRESTAMOS_ACTIVOS = 3;
const MAX_COMENTARIO_LIBRO = 120;
const GENEROS = [
  "Novela",
  "Ciencia",
  "Historia",
  "Fantasía",
  "Tecnología",
  "Poesía",
];
const CAMPOS_ORDEN = ["titulo", "autor", "anio"];

const CLAVES = {
  libros: "biblioteca.libros",
  prestamos: "biblioteca.prestamos",
  tema: "biblioteca.tema",
  usuario: "biblioteca.usuario",
  orden: "biblioteca.orden",
};

const estado = {
  libros: [],
  prestamos: [],
  tema: null,
  usuario: "",
  orden: { campo: "titulo", direccion: "asc" },
};

function aISO(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function desdeISO(iso) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

function hoy() {
  return aISO(new Date());
}

function sumarDias(iso, dias) {
  const fecha = desdeISO(iso);
  fecha.setDate(fecha.getDate() + dias);
  return aISO(fecha);
}

function diasEntre(desde, hasta) {
  return Math.round((desdeISO(hasta) - desdeISO(desde)) / 86400000);
}

function formatearFecha(iso) {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}

function generarId(prefijo) {
  return (
    prefijo + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  );
}

function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function crearDatosIniciales() {
  const h = hoy();
  const libros = [
    {
      id: "l1",
      titulo: "Cien años de soledad",
      autor: "Gabriel García Márquez",
      anio: 1967,
      genero: "Novela",
      comentario: "Realismo mágico en Macondo.",
      coleccion: false,
    },
    {
      id: "l2",
      titulo: "El principito",
      autor: "Antoine de Saint-Exupéry",
      anio: 1943,
      genero: "Novela",
      comentario: "",
      coleccion: false,
    },
    {
      id: "l3",
      titulo: "Breve historia del tiempo",
      autor: "Stephen Hawking",
      anio: 1988,
      genero: "Ciencia",
      comentario: "",
      coleccion: false,
    },
    {
      id: "l4",
      titulo: "Sapiens",
      autor: "Yuval Noah Harari",
      anio: 2011,
      genero: "Historia",
      comentario: "",
      coleccion: false,
    },
    {
      id: "l5",
      titulo: "Clean Code",
      autor: "Robert C. Martin",
      anio: 2008,
      genero: "Tecnología",
      comentario: "Guía para escribir código legible.",
      coleccion: false,
    },
    {
      id: "l6",
      titulo: "Veinte poemas de amor y una canción desesperada",
      autor: "Pablo Neruda",
      anio: 1924,
      genero: "Poesía",
      comentario: "",
      coleccion: false,
    },
    {
      id: "l7",
      titulo: "Don Quijote de la Mancha",
      autor: "Miguel de Cervantes",
      anio: 1605,
      genero: "Novela",
      comentario: "Edición de colección.",
      coleccion: true,
    },
    {
      id: "l8",
      titulo: "El origen de las especies",
      autor: "Charles Darwin",
      anio: 1859,
      genero: "Ciencia",
      comentario: "Edición de colección.",
      coleccion: true,
    },
    {
      id: "l9",
      titulo: "Ángeles y demonios",
      autor: "Dan Brown",
      anio: 2000,
      genero: "Novela",
      comentario: "",
      coleccion: false,
    },
  ];

  const prestamos = [
    {
      id: "p1",
      idLibro: "l1",
      persona: "Ana",
      fechaPrestamo: sumarDias(h, -5),
      fechaLimite: sumarDias(h, 9),
      fechaDevolucion: null,
    },

    {
      id: "p2",
      idLibro: "l2",
      persona: "Carlos",
      fechaPrestamo: sumarDias(h, -20),
      fechaLimite: sumarDias(h, -6),
      fechaDevolucion: null,
    },

    {
      id: "p3",
      idLibro: "l3",
      persona: "Lucía",
      fechaPrestamo: sumarDias(h, -30),
      fechaLimite: sumarDias(h, -16),
      fechaDevolucion: sumarDias(h, -20),
    },

    {
      id: "p4",
      idLibro: "l4",
      persona: "Pedro",
      fechaPrestamo: sumarDias(h, -40),
      fechaLimite: sumarDias(h, -26),
      fechaDevolucion: sumarDias(h, -21),
    },
  ];

  return { libros, prestamos };
}

function leerGuardado(clave, porDefecto) {
  try {
    const texto = localStorage.getItem(clave);
    return texto === null ? porDefecto : JSON.parse(texto);
  } catch {
    return porDefecto;
  }
}

function guardar() {
  try {
    localStorage.setItem(CLAVES.libros, JSON.stringify(estado.libros));
    localStorage.setItem(CLAVES.prestamos, JSON.stringify(estado.prestamos));
    localStorage.setItem(CLAVES.usuario, JSON.stringify(estado.usuario));
    localStorage.setItem(CLAVES.orden, JSON.stringify(estado.orden));
    if (estado.tema !== null) {
      localStorage.setItem(CLAVES.tema, JSON.stringify(estado.tema));
    }
  } catch {}
}

function cargarEstado() {
  const libros = leerGuardado(CLAVES.libros, null);
  const prestamos = leerGuardado(CLAVES.prestamos, null);
  const hayDatos = Array.isArray(libros) && Array.isArray(prestamos);

  if (hayDatos) {
    estado.libros = libros;
    estado.prestamos = prestamos;
  } else {
    const iniciales = crearDatosIniciales();
    estado.libros = iniciales.libros;
    estado.prestamos = iniciales.prestamos;
  }

  const tema = leerGuardado(CLAVES.tema, null);
  estado.tema = tema === "claro" || tema === "oscuro" ? tema : null;

  const usuario = leerGuardado(CLAVES.usuario, "");
  estado.usuario = typeof usuario === "string" ? usuario : "";

  const orden = leerGuardado(CLAVES.orden, null);
  if (
    orden &&
    CAMPOS_ORDEN.includes(orden.campo) &&
    ["asc", "desc"].includes(orden.direccion)
  ) {
    estado.orden = orden;
  }

  if (!hayDatos) guardar();
}

function restablecerBiblioteca() {
  try {
    Object.values(CLAVES).forEach((clave) => localStorage.removeItem(clave));
  } catch {
    // sin almacenamiento: no hay nada que borrar
  }
  const iniciales = crearDatosIniciales();
  estado.libros = iniciales.libros;
  estado.prestamos = iniciales.prestamos;
  estado.tema = null;
  estado.usuario = "";
  estado.orden = { campo: "titulo", direccion: "asc" };
  guardar();
}

// ---------- Ajustes ----------
function establecerTema(tema) {
  estado.tema = tema;
  guardar();
}

function establecerUsuario(nombre) {
  estado.usuario = nombre.trim();
  guardar();
}

function establecerOrden(campo, direccion) {
  estado.orden = { campo, direccion };
  guardar();
}

// ---------- Consultas (todo lo calculado sale de aquí) ----------
function buscarLibro(id) {
  return estado.libros.find((libro) => libro.id === id);
}

function tituloDe(idLibro) {
  const libro = buscarLibro(idLibro);
  return libro ? libro.titulo : "Libro eliminado";
}

function prestamoActivo(idLibro) {
  return estado.prestamos.find(
    (p) => p.idLibro === idLibro && p.fechaDevolucion === null,
  );
}

function prestamosActivos() {
  return estado.prestamos.filter((p) => p.fechaDevolucion === null);
}

function estaDisponible(libro) {
  return !libro.coleccion && !prestamoActivo(libro.id);
}

function estaVencido(prestamo) {
  return prestamo.fechaDevolucion === null && prestamo.fechaLimite < hoy();
}

// Días de retraso: 0 si va a tiempo. Sirve para préstamos activos y devueltos.
function diasRetraso(prestamo) {
  const referencia = prestamo.fechaDevolucion ?? hoy();
  return Math.max(0, diasEntre(prestamo.fechaLimite, referencia));
}

// Activos: la fecha límite más próxima primero
function listarPrestamosActivos() {
  return prestamosActivos().sort((a, b) =>
    a.fechaLimite.localeCompare(b.fechaLimite),
  );
}

// Historial: del más reciente al más antiguo
function listarHistorial() {
  return estado.prestamos
    .filter((p) => p.fechaDevolucion !== null)
    .sort(
      (a, b) =>
        b.fechaDevolucion.localeCompare(a.fechaDevolucion) ||
        b.fechaPrestamo.localeCompare(a.fechaPrestamo),
    );
}

function generosExistentes() {
  const generos = [...new Set(estado.libros.map((libro) => libro.genero))];
  return generos.sort(new Intl.Collator("es").compare);
}

function calcularResumen() {
  const activos = prestamosActivos();
  const porGenero = {};
  for (const libro of estado.libros) {
    porGenero[libro.genero] = (porGenero[libro.genero] || 0) + 1;
  }
  return {
    total: estado.libros.length,
    disponibles: estado.libros.filter(estaDisponible).length,
    prestados: activos.length,
    vencidos: activos.filter(estaVencido).length,
    porGenero,
  };
}

// ---------- Filtrar y ordenar (no modifican los datos originales) ----------
function filtrarLibros(
  libros,
  { texto = "", estadoFiltro = "todos", genero = "" },
) {
  const busqueda = normalizar(texto);
  return libros.filter((libro) => {
    const coincideTexto =
      normalizar(libro.titulo).includes(busqueda) ||
      normalizar(libro.autor).includes(busqueda);
    const coincideEstado =
      estadoFiltro === "todos" ||
      (estadoFiltro === "disponibles" && estaDisponible(libro)) ||
      (estadoFiltro === "prestados" && Boolean(prestamoActivo(libro.id)));
    const coincideGenero = genero === "" || libro.genero === genero;
    return coincideTexto && coincideEstado && coincideGenero;
  });
}

function ordenarLibros(libros, campo, direccion) {
  const colador = new Intl.Collator("es"); // ordena bien tildes y la ñ
  const factor = direccion === "desc" ? -1 : 1;
  // [...libros] crea una copia: el arreglo original no cambia
  return [...libros].sort((a, b) => {
    const resultado =
      campo === "anio" ? a.anio - b.anio : colador.compare(a[campo], b[campo]);
    return resultado * factor;
  });
}

// ---------- Préstamos ----------
function validarNombrePersona(nombre) {
  const largo = nombre.trim().length;
  if (largo < 2 || largo > 40)
    return "El nombre debe tener entre 2 y 40 caracteres.";
  return "";
}

function puedePrestar(idLibro) {
  const libro = buscarLibro(idLibro);
  if (!libro) return { ok: false, error: "El libro no existe." };
  if (libro.coleccion)
    return { ok: false, error: "Los libros de colección no se prestan." };
  if (prestamoActivo(idLibro))
    return { ok: false, error: "Este libro ya está prestado." };
  if (prestamosActivos().length >= MAX_PRESTAMOS_ACTIVOS) {
    return {
      ok: false,
      error: `Ya hay ${MAX_PRESTAMOS_ACTIVOS} préstamos activos. Devuelve un libro antes de prestar otro.`,
    };
  }
  return { ok: true };
}

function prestarLibro(idLibro, persona) {
  const permiso = puedePrestar(idLibro);
  if (!permiso.ok) return { ok: false, campo: "general", error: permiso.error };

  const errorNombre = validarNombrePersona(persona);
  if (errorNombre) return { ok: false, campo: "persona", error: errorNombre };

  const fecha = hoy();
  estado.prestamos.push({
    id: generarId("p"),
    idLibro,
    persona: persona.trim(),
    fechaPrestamo: fecha,
    fechaLimite: sumarDias(fecha, DIAS_PRESTAMO),
    fechaDevolucion: null,
  });
  guardar();
  return { ok: true };
}

// Devolver NO borra: registra la fecha de devolución
function devolverPrestamo(idPrestamo) {
  const prestamo = estado.prestamos.find(
    (p) => p.id === idPrestamo && p.fechaDevolucion === null,
  );
  if (!prestamo)
    return { ok: false, error: "No hay un préstamo activo para devolver." };
  prestamo.fechaDevolucion = hoy();
  guardar();
  return { ok: true, diasRetraso: diasRetraso(prestamo) };
}

// ---------- Libros ----------
function existeDuplicado(titulo, autor, idIgnorado) {
  return estado.libros.some(
    (libro) =>
      libro.id !== idIgnorado &&
      normalizar(libro.titulo) === normalizar(titulo) &&
      normalizar(libro.autor) === normalizar(autor),
  );
}

// Devuelve un objeto con un mensaje por campo. Vacío = todo correcto.
function validarLibro(datos, idEditando = null) {
  const errores = {};
  const titulo = datos.titulo.trim();
  const autor = datos.autor.trim();
  const anio = Number(datos.anio);

  if (titulo.length < 3 || titulo.length > 60) {
    errores.titulo = "El título debe tener entre 3 y 60 caracteres.";
  }
  if (autor === "") {
    errores.autor = "El autor no puede estar vacío.";
  }
  if (
    String(datos.anio).trim() === "" ||
    !Number.isInteger(anio) ||
    anio < 1000 ||
    anio > 2026
  ) {
    errores.anio = "El año debe ser un número entre 1000 y 2026.";
  }
  if (!GENEROS.includes(datos.genero)) {
    errores.genero = "Elige un género de la lista.";
  }
  if (datos.comentario.length > MAX_COMENTARIO_LIBRO) {
    errores.comentario = `El comentario no puede pasar de ${MAX_COMENTARIO_LIBRO} caracteres.`;
  }
  if (!errores.titulo && existeDuplicado(titulo, autor, idEditando)) {
    errores.titulo = "Ya existe un libro con el mismo título y autor.";
  }
  if (idEditando && datos.coleccion && prestamoActivo(idEditando)) {
    errores.coleccion =
      "Un libro con préstamo activo no puede marcarse como de colección.";
  }
  return errores;
}

function construirLibro(id, datos) {
  return {
    id,
    titulo: datos.titulo.trim(),
    autor: datos.autor.trim(),
    anio: Number(datos.anio),
    genero: datos.genero,
    comentario: datos.comentario.trim(),
    coleccion: Boolean(datos.coleccion),
  };
}

function agregarLibro(datos) {
  const errores = validarLibro(datos);
  if (Object.keys(errores).length > 0) return { ok: false, errores };

  const libro = construirLibro(generarId("l"), datos);
  estado.libros.push(libro);
  guardar();
  return { ok: true, libro };
}

function editarLibro(id, datos) {
  const original = buscarLibro(id);
  if (!original)
    return { ok: false, errores: { titulo: "El libro ya no existe." } };

  const errores = validarLibro(datos, id);
  if (Object.keys(errores).length > 0) return { ok: false, errores };

  Object.assign(original, construirLibro(id, datos));
  guardar();
  return { ok: true, libro: original };
}

function puedeEliminarLibro(id) {
  const libro = buscarLibro(id);
  if (!libro) return { ok: false, error: "El libro no existe." };
  if (prestamoActivo(id)) {
    return {
      ok: false,
      error: `«${libro.titulo}» tiene un préstamo activo y no se puede eliminar.`,
    };
  }
  return { ok: true };
}

// Elimina el libro y su historial de préstamos devueltos
function eliminarLibro(id) {
  const permiso = puedeEliminarLibro(id);
  if (!permiso.ok) return permiso;

  const libro = buscarLibro(id);
  estado.libros = estado.libros.filter((l) => l.id !== id);
  estado.prestamos = estado.prestamos.filter((p) => p.idLibro !== id);
  guardar();
  return { ok: true, libro };
}
