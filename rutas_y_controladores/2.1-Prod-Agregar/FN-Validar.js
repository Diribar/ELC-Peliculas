"use strict";
// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");
const procesos = require("./FN-Procesos");

module.exports = {
	// ControllerAPI (validarPalabrasClave)
	palabrasClave: (dato) => {
		// Campo palabrasClave
		cartelCampoVacio = "Necesitamos que completes este campo";
		let errores = {};
		errores.palabrasClave = !dato ? cartelCampoVacio : longitud(dato, 3, 50) ? longitud(dato, 3, 50) : "";
		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},

	// ControllerAPI (validarPalabrasClave)
	desambiguar: (dato) => {
		// Detectar si es una película, que pertenece a una colección y cuya colección no está en la BD
		// Variables
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
		let cantDatosObtenidos = datos.contenido ? procesos.contenidoFA(datos.contenido) : {};
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
		let cartelMusica = cartelCampoVacio + '. Si no tiene música, poné "No tiene música"';
		let cartelActuacion =
			cartelCampoVacio + '. Si no tiene actuacion (ej. un Documental), poné "No tiene actuacion"';
		let camposPosibles = [
			{nombre: "nombre_original", idioma: "medio", cartel: cartelCampoVacio, corto: 3, largo: 50},
			{nombre: "nombre_castellano", idioma: "medio", cartel: cartelCampoVacio, corto: 3, largo: 50},
			{nombre: "direccion", idioma: "basico", cartel: cartelCampoVacio, corto: 3, largo: 100},
			{nombre: "guion", idioma: "basico", cartel: cartelCampoVacio, corto: 3, largo: 100},
			{nombre: "musica", idioma: "basico", cartel: cartelMusica, corto: 3, largo: 100},
			{nombre: "produccion", idioma: "medio", cartel: cartelCampoVacio, corto: 3, largo: 100},
			{nombre: "actuacion", idioma: "medio", cartel: cartelActuacion, corto: 3, largo: 500},
			{nombre: "sinopsis", idioma: "amplio", cartel: cartelCampoVacio, corto: 15, largo: 1004},
		];
		// ***** CAMPOS INDIVIDUALES ESTÁNDAR *******
		for (let campo of camposPosibles) {
			let nombre = campo.nombre;
			let idioma = campo.idioma;
			if (campos.includes(nombre))
				errores[nombre] = !datos[nombre]
					? campo.cartel
					: longitud(datos[nombre], campo.corto, campo.largo)
					? longitud(datos[nombre], campo.corto, campo.largo)
					: castellano[idioma](datos[nombre])
					? cartelCastellano
					: inicialMayuscula(datos[nombre])
					? cartelMayuscula
					: "";
		}
		// ***** CAMPOS INDIVIDUALES PARTICULARES *******
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
				? "Se aceptan hasta 4 países."
				: "";
		if (campos.includes("idioma_original_id"))
			errores.idioma_original_id = !datos.idioma_original_id ? cartelCampoVacio : "";
		// Personas
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
			datos.entidad &&
			(await BD_especificas.validarRepetidos(["nombre_original", "ano_estreno"], datos))
		)
			errores.nombre_original = cartelRepetido(datos);
		// Nombre Castellano y Año de Estreno
		if (
			datos.nombre_castellano &&
			!errores.nombre_castellano &&
			datos.ano_estreno &&
			!errores.ano_estreno &&
			datos.entidad
		)
			if (await BD_especificas.validarRepetidos(["nombre_castellano", "ano_estreno"], datos))
				errores.nombre_castellano = cartelRepetido(datos);
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
			"publico_sugerido_id",
			"categoria_id",
			"subcategoria_id",
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
			let subcategoria = await BD_genericas.obtenerPorId("subcategorias", datos.subcategoria_id);
			let rclv_necesario = subcategoria.rclv_necesario;
			// Relación con la vida
			errores.personaje_id = "";
			errores.hecho_id = "";
			errores.valor_id = "";
			if (rclv_necesario == "personaje")
				errores.personaje_id =
					!datos.personaje_id || datos.personaje_id == 1 ? cartelSelectVacio : "";
			else if (rclv_necesario == "hecho")
				errores.hecho_id = !datos.hecho_id || datos.hecho_id == 1 ? cartelSelectVacio : "";
			else {
				let alguno =
					(!datos.personaje_id || datos.personaje_id == 1) &&
					(!datos.hecho_id || datos.hecho_id == 1) &&
					(!datos.valor_id || datos.valor_id == 1);
				errores.valor_id = alguno ? "Se debe completar alguno de estos 3 campos" : "";
			}
		}
		// ***** RESUMEN *******
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
};

// Variables **************************
let cartelCampoVacio = "Necesitamos que completes esta información";
let cartelCastellano = "Sólo se admiten letras del abecedario castellano";
let cartelMayuscula = "La primera letra debe ser en mayúscula";

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
let cartelRepetido = (datos) => {
	let prodNombre = compartidas.obtenerEntidadNombre(datos.entidad);
	return (
		"Este/a " +
		"<a href='/producto/detalle/?entidad=" +
		datos.entidad +
		"&id=" +
		averiguar.id +
		"' target='_blank'><u><strong>" +
		prodNombre.toLowerCase() +
		"</strong></u></a>" +
		" ya se encuentra en nuestra base de datos"
	);
};
let castellano = {
	amplio: (dato) => {
		let formato = /^[a-záéíóúüñ ,.&$:;…"°'¿?¡!+/()\d\r\n\-]+$/i;
		// Original:  /^[¡¿A-ZÁÉÍÓÚÜÑ"\d][A-ZÁÉÍÓÚÜÑa-záéíóúüñ ,.&$:;…"°'¿?¡!+-/()\d\r\n\#]+$/;
		return !formato.test(dato);
	},
	medio: (dato) => {
		let formato = /^[a-záéíóúüñ ,.'"()\d\-]+$/i;
		return !formato.test(dato);
	},
	basico: (dato) => {
		let formato = /^[a-záéíóúüñ ,.']+$/i;
		return !formato.test(dato);
	},
};
let inicialMayuscula = (dato) => {
	let formato = /^[¡¿A-ZÁÉÍÓÚÜÑ"\d]/;
	return !formato.test(dato);
};
