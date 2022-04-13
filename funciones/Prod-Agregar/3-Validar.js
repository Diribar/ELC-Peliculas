"use strict";
// Definir variables
const procesarProd = require("./2-Procesar");
const BD_genericas = require("../BD/Genericas");
const especificas = require("../Varias/Especificas");

module.exports = {
	// ControllerAPI (validarPalabrasClave)
	palabrasClave: (dato) => {
		cartelCampoVacio = "Necesitamos que completes este campo";
		let errores = {};
		errores.palabrasClave = !dato ? cartelCampoVacio : longitud(dato, 2, 50) ? longitud(dato, 2, 50) : "";
		return errores;
	},

	// ControllerAPI (validarPalabrasClave)
	desambiguar: (dato) => {
		// Detectar si es una película, que pertenece a una colección y cuya colección no está en la BD
		let errores = {hay: false};
		// Si es una película y está en una colección
		if (dato.TMDB_entidad == "movie" && dato.en_coleccion) {
			errores = {
				colec_TMDB_id: dato.en_colec_TMDB_id,
				hay: true,
			};
			// Si la colección no está en nuestra BD
			if (!dato.en_colec_id) errores.mensaje = "agregarColeccion";
			else {
				errores = {
					...errores,
					mensaje: "agregarCapitulos",
					en_colec_id: dato.en_colec_id,
				};
			}
		}
		// Enviar el feedback
		return errores;
	},

	// ControllerAPI (validarCopiarFA)
	copiarFA: (datos) => {
		let errores = {};
		// Dirección
		let url = datos.direccion;
		errores.direccion = !url
			? cartelCampoVacio
			: !url.includes("www.filmaffinity.com/") ||
			  !(
					url.indexOf("www.filmaffinity.com/") + 21 < url.indexOf("/film") &&
					url.indexOf("/film") + 5 < url.indexOf(".html")
			  )
			? "No parece ser una dirección de Film Affinity"
			: "";
		// Avatar
		errores.avatar = !datos.avatar
			? "Necesitamos que agregues una imagen"
			: !datos.avatar.includes("pics.filmaffinity.com/")
			? "No parece ser una imagen de FilmAffinity"
			: !datos.avatar.includes("large.jpg")
			? "Necesitamos que consigas el link de la imagen grande"
			: "";
		// Contenido
		let cantDatosObtenidos = datos.contenido ? procesarProd.contenidoFA(datos.contenido) : {};
		errores.contenido = !datos.contenido
			? cartelCampoVacio
			: !Object.keys(cantDatosObtenidos).length
			? "No se obtuvo ningún dato"
			: "";
		// Final
		errores.hay = Object.values(errores).some((n) => !!n);
		errores.campos = Object.keys(cantDatosObtenidos).length;
		return errores;
	},

	// ControllerAPI (validarDatosDuros_input)
	// ControllerVista (DD - Form y Grabar)
	datosDuros: async (campos, datos) => {
		// Definir variables
		let errores = {};
		let camposPosibles = [
			{nombre: "nombre_original", corto: 2, largo: 50},
			{nombre: "nombre_castellano", corto: 2, largo: 50},
			{nombre: "direccion", corto: 2, largo: 100},
			{nombre: "guion", corto: 2, largo: 100},
			{nombre: "produccion", corto: 2, largo: 100},
			{nombre: "sinopsis", corto: 15, largo: 800},
		];
		// ***** CAMPOS INDIVIDUALES *******
		for (let campo of camposPosibles) {
			if (campos.includes(campo.nombre))
				errores[campo.nombre] = !datos[campo.nombre]
					? cartelCampoVacio
					: longitud(datos[campo.nombre], campo.corto, campo.largo)
					? longitud(datos[campo.nombre], campo.corto, campo.largo)
					: especificas.letrasValidasCastellano(datos[campo.nombre])
					? cartelCastellano
					: "";
		}
		if (campos.includes("ano_estreno"))
			errores.ano_estreno = !datos.ano_estreno
				? cartelCampoVacio
				: formatoAno(datos.ano_estreno)
				? "Debe ser un número de 4 dígitos"
				: datos.ano_estreno < 1900
				? "El año debe ser mayor a 1900"
				: datos.ano_estreno > new Date().getFullYear()
				? "El número no puede superar al año actual"
				: "";
		if (campos.includes("ano_fin"))
			errores.ano_fin = !datos.ano_fin
				? cartelCampoVacio
				: formatoAno(datos.ano_fin)
				? "Debe ser un número de 4 dígitos"
				: datos.ano_fin < 1900
				? "El año debe ser mayor a 1900"
				: datos.ano_fin > new Date().getFullYear()
				? "El número no puede superar al año actual"
				: "";
		if (campos.includes("duracion"))
			errores.duracion = !datos.duracion
				? cartelCampoVacio
				: formatoNumero(datos.duracion, 20)
				? formatoNumero(datos.duracion, 20)
				: datos.duracion > 300
				? "Debe ser un número menor"
				: "";
		if (campos.includes("paises_id"))
			errores.paises_id = !datos.paises_id
				? cartelCampoVacio
				: datos.paises_id.length > 2 * 1 + 4 * 3
				? "Se aceptan hasta 4 países. Seleccioná algún país elegido para borrarlo"
				: "";
		if (campos.includes("idioma_original_id"))
			errores.idioma_original_id = !datos.idioma_original_id ? cartelCampoVacio : "";
		// Personas
		if (campos.includes("musica"))
			errores.musica = !datos.musica
				? cartelCampoVacio + '. Si no tiene música, poné "No tiene música"'
				: longitud(datos.musica, 2, 100)
				? longitud(datos.musica, 2, 100)
				: especificas.letrasValidasCastellano(datos.musica)
				? cartelCastellano
				: "";
		if (campos.includes("actuacion"))
			errores.actuacion = !datos.actuacion
				? cartelCampoVacio + '. Si no tiene actuacion (ej. un Documental), poné "No tiene actuacion"'
				: longitud(datos.actuacion, 2, 500)
				? longitud(datos.actuacion, 2, 500)
				: especificas.letrasValidasCastellano(datos.actuacion)
				? cartelCastellano
				: "";
		if (campos.includes("avatar"))
			errores.avatar = !datos.avatar
				? "Necesitamos que agregues una imagen"
				: extensiones(datos.avatar)
				? "Las extensiones de archivo válidas son jpg y png"
				: "";
		// ***** CAMPOS COMBINADOS *******
		// Nombre Original y Año de Estreno
		if (
			datos.nombre_original &&
			!errores.nombre_original &&
			datos.ano_estreno &&
			!errores.ano_estreno &&
			datos.entidad
		)
			errores.nombre_original = await validarRepetidos("nombre_original", datos);
		// Nombre Castellano y Año de Estreno
		if (
			datos.nombre_castellano &&
			!errores.nombre_castellano &&
			datos.ano_estreno &&
			!errores.ano_estreno &&
			datos.entidad
		)
			errores.nombre_castellano = await validarRepetidos("nombre_castellano", datos);
		// Año de Estreno y Año Fin
		if (datos.ano_estreno && !errores.ano_estreno && datos.ano_fin && !errores.ano_fin) {
			if (datos.ano_estreno > datos.ano_fin)
				errores.ano_estreno = "El año de estreno debe ser menor o igual que el año de finalización";
		}
		// ***** RESUMEN *******
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},

	// ControllerAPI (validarDatosPers)
	datosPers: async (campos, datos) => {
		// Definir variables
		let errores = {};
		let camposPosibles = [
			"en_castellano_id",
			"en_color_id",
			"categoria_id",
			"subcategoria_id",
			"publico_sugerido_id",
			"fe_valores_id",
			"entretiene_id",
			"calidad_tecnica_id",
		];
		// Datos generales + calificación
		for (let campo of camposPosibles) {
			if (campos.includes(campo)) errores[campo] = !datos[campo] ? cartelSelectVacio : "";
		}
		// RCLV - Combinados
		if (datos.subcategoria_id) {
			// Obtener el registro de la subcategoría
			let subcategoria = await BD_genericas.obtenerPorCampos("subcategorias", {
				id: datos.subcategoria_id,
			});
			// Relación con la vida
			if (subcategoria.personaje)
				errores.personaje_id =
					!datos.personaje_id || datos.personaje_id == 1 ? cartelSelectVacio : "";
			if (subcategoria.hecho)
				errores.hecho_id = !datos.hecho_id || datos.hecho_id == 1 ? cartelSelectVacio : "";
			if (subcategoria.valor)
				errores.valor_id = !datos.valor_id || datos.valor_id == 1 ? cartelSelectVacio : "";
		}
		// ***** RESUMEN *******
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
};

// Variables **************************
let cartelCampoVacio = "Necesitamos que completes esta información";
let cartelCastellano =
	"Sólo se admiten letras del abecedario castellano, y la primera letra debe ser en mayúscula";
let cartelSelectVacio = "Necesitamos que elijas una opción";

let longitud = (dato, corto, largo) => {
	return dato.length < corto
		? "El contenido debe ser más largo"
		: dato.length > largo
		? "El contenido debe ser más corto. Tiene " + dato.length + " caracteres, el límite es " + largo + "."
		: "";
};
let formatoAno = (dato) => {
	let formato = /^\d{4}$/;
	return !formato.test(dato);
};
let formatoNumero = (dato, minimo) => {
	let formato = /^\d+$/;
	return !formato.test(dato)
		? "Debe ser un número"
		: dato < minimo
		? "Debe ser un número mayor a " + minimo
		: "";
};
let extensiones = (nombre) => {
	if (!nombre) return false;
	let ext = nombre.slice(nombre.length - 4);
	return ![".jpg", ".png"].includes(ext);
};
let validarRepetidos = async (campo, datos) => {
	// Averiguar si existe algún caso en la BD
	let averiguar = await BD_genericas.obtenerPorCampos(datos.entidad, {
		[campo]: datos[campo],
		ano_estreno: datos.ano_estreno,
	});
	// Si se encontró algún caso, compara las ID
	let repetido = averiguar ? averiguar.id != datos.id : false;
	// Si hay casos --> mensaje de error con la entidad y el id
	let mensaje = "";
	if (repetido) {
		let prodNombre = especificas.entidadNombre(datos.entidad);
		mensaje =
			"Esta " +
			"<a href='/producto/detalle/?entidad=" +
			datos.entidad +
			"&id=" +
			averiguar.id +
			"' target='_blank'><u><strong>" +
			prodNombre.toLowerCase() +
			"</strong></u></a>" +
			" ya se encuentra en nuestra base de datos";
	}
	return mensaje;
};
