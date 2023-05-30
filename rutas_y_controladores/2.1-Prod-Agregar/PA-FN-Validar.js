"use strict";
// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");
const procesos = require("./PA-FN-Procesos");

module.exports = {
	// ControllerAPI (validaPalabrasClave)
	palabrasClave: (dato) => {
		// Campo palabrasClave
		let errores = {};
		let longitud = dato ? comp.validacs.longitud(dato, 3, 35) : "";
		errores.palabrasClave = !dato ? variables.inputVacio : longitud ? longitud : "";
		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	// ControllerAPI (validaDatosDuros_input)
	// ControllerVista (DD - Form y Grabar)
	datosDuros: async (campos, datos) => {
		// Variables
		let errores = {};
		if (!datos.entidadNombre) datos.entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(datos.entidad);
		let cartelMusica = variables.inputVacio + '. Si no tiene música, poné "Desconocido"';
		let cartelActores = variables.inputVacio + '. Si no conseguís información, poné "Desconocido"';
		let camposPosibles = [
			{nombre: "nombre_original", tipoIdioma: "completo", cartel: variables.inputVacio, corto: 3, largo: 70},
			{nombre: "nombre_castellano", tipoIdioma: "completo", cartel: variables.inputVacio, corto: 3, largo: 70},
			{nombre: "direccion", tipoIdioma: "basico", cartel: variables.inputVacio, corto: 3, largo: 100},
			{nombre: "guion", tipoIdioma: "basico", cartel: variables.inputVacio, corto: 3, largo: 100},
			{nombre: "musica", tipoIdioma: "basico", cartel: cartelMusica, corto: 3, largo: 100},
			{nombre: "produccion", tipoIdioma: "completo", cartel: variables.inputVacio, corto: 3, largo: 100},
			{nombre: "actores", tipoIdioma: "completo", cartel: cartelActores, corto: 3, largo: 500},
			{nombre: "sinopsis", tipoIdioma: "completo", cartel: variables.inputVacio, corto: 11, largo: 1004},
		];
		// ***** CAMPOS INDIVIDUALES ESTÁNDAR *******
		for (let campo of camposPosibles) {
			let nombre = campo.nombre;
			let tipoIdioma = campo.tipoIdioma;
			if (campos.includes(nombre)) {
				// Variables
				let dato = datos[nombre];
				let respuesta = "";
				// Validaciones
				if (datos[nombre]) {
					if (!respuesta) respuesta = comp.validacs.longitud(dato, campo.corto, campo.largo);
					if (!respuesta) respuesta = comp.validacs.castellano[tipoIdioma](dato);
					if (!respuesta) respuesta = comp.validacs.inicial[tipoIdioma](dato);
				} else respuesta = variables.inputVacio;
				// Excepción para actores
				// if (nombre == "actores" && respuesta == variables.inputVacio) respuesta = "";
				// Fin
				errores[nombre] = respuesta;
			}
		}
		// ***** CAMPOS INDIVIDUALES PARTICULARES *******
		if (campos.includes("ano_estreno"))
			errores.ano_estreno = !datos.ano_estreno
				? variables.inputVacio
				: formatoAno(datos.ano_estreno)
				? "Debe ser un número de 4 dígitos"
				: datos.ano_estreno < 1900
				? "El año debe ser mayor a 1900"
				: datos.ano_estreno > new Date().getFullYear()
				? "El número no puede superar al año actual"
				: "";
		if (campos.includes("ano_fin"))
			errores.ano_fin = !datos.ano_fin
				? variables.inputVacio
				: formatoAno(datos.ano_fin)
				? "Debe ser un número de 4 dígitos"
				: datos.ano_fin < 1900
				? "El año debe ser mayor a 1900"
				: datos.ano_fin > new Date().getFullYear()
				? "El número no puede superar al año actual"
				: "";
		if (campos.includes("duracion"))
			errores.duracion = !datos.duracion
				? variables.inputVacio
				: formatoNumero(datos.duracion, 20)
				? formatoNumero(datos.duracion, 20)
				: datos.duracion > 300
				? "Debe ser un número menor"
				: "";
		if (campos.includes("paises_id"))
			errores.paises_id = !datos.paises_id
				? variables.inputVacio
				: datos.paises_id.length > 2 * 1 + 3 * 3
				? "Se aceptan hasta 4 países."
				: "";
		if (campos.includes("idioma_original_id"))
			errores.idioma_original_id = !datos.idioma_original_id ? variables.inputVacio : "";
		// Personas
		if (campos.includes("avatar")) errores.avatar = comp.validacs.avatar(datos);

		// ***** CAMPOS COMBINADOS *******
		// Año de Estreno y Año Fin
		if (datos.ano_estreno && !errores.ano_estreno && datos.ano_fin && !errores.ano_fin && datos.ano_estreno > datos.ano_fin) {
			errores.ano_estreno = "El año de estreno debe ser menor o igual que el año de finalización";
		}
		// Nombre Original y Año de Estreno
		if (datos.nombre_original && !errores.nombre_original && datos.ano_estreno && !errores.ano_estreno && datos.entidad) {
			let id = await BD_especificas.validaRepetidos(["nombre_original", "ano_estreno"], datos);
			if (id) errores.nombre_original = comp.validacs.cartelRepetido({...datos, id});
		}
		// Nombre Castellano y Año de Estreno
		if (datos.nombre_castellano && !errores.nombre_castellano && datos.ano_estreno && !errores.ano_estreno && datos.entidad) {
			let id = await BD_especificas.validaRepetidos(["nombre_castellano", "ano_estreno"], datos);
			if (id) errores.nombre_castellano = comp.validacs.cartelRepetido({...datos, id});
		}

		// ***** RESUMEN *******
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	// ControllerAPI (validaDatosAdics)
	datosAdics: (campos, datos) => {
		// Definir variables
		let errores = {};
		let camposPosibles = ["cfc", "ocurrio", "musical", "color", "tipo_actuacion_id"];
		// Datos generales
		for (let campo of camposPosibles)
			if (campos.includes(campo)) errores[campo] = !datos[campo] && datos[campo] !== false ? variables.selectVacio : "";
		// Se usa 'false', para distinguir cuando el valor esté contestado de cuando no

		// RCLV
		const entidadesRCLV = variables.entidades.rclvs;
		let tieneRCLV_id;
		for (let entidadRCLV of entidadesRCLV) {
			let campo_id = comp.obtieneDesdeEntidad.campo_id(entidadRCLV);
			if (datos[campo_id] != 1 && datos[campo_id]) tieneRCLV_id = true;
		}
		errores.RCLV = datos.sinRCLV ? "" : !tieneRCLV_id ? "Necesitamos que respondas alguna de las opciones" : "";

		// ***** RESUMEN *******
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	// ControllerAPI (validaIngresoFA)
	IM: (datos) => {
		let errores = {};
		// Final
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	// ControllerAPI (validaIngresoFA)
	FA: (datos) => {
		let errores = {};
		// Dirección
		let url = datos.url;
		errores.url = !url
			? variables.inputVacio
			: !url.includes("www.filmaffinity.com/") ||
			  url.indexOf("www.filmaffinity.com/") + 21 >= url.indexOf("/film") ||
			  url.indexOf("/film") + 5 >= url.indexOf(".html")
			? "No parece ser una dirección de Film Affinity"
			: "";
		// Avatar
		errores.avatar_url = !datos.avatar_url
			? "Necesitamos que agregues una imagen"
			: !datos.avatar_url.includes("pics.filmaffinity.com/")
			? "No parece ser una imagen de FilmAffinity"
			: !datos.avatar_url.includes("large.jpg")
			? "Necesitamos que consigas el link de la imagen grande"
			: "";
		// Contenido
		let contenido = datos.contenido ? procesos.contenidoFA(datos.contenido) : {};
		errores.contenido = !datos.contenido
			? variables.inputVacio
			: !Object.keys(contenido).length
			? "No se obtuvo ningún dato"
			: "";
		// Final
		errores.hay = Object.values(errores).some((n) => !!n);
		errores.campos = Object.keys(contenido).length;
		return errores;
	},
};

// Variables **************************
let formatoAno = (dato) => {
	let formato = /^\d{4}$/;
	return !formato.test(dato);
};
let formatoNumero = (dato, minimo) => {
	let formato = /^\d+$/;
	return !formato.test(dato) ? "Debe ser un número" : dato < minimo ? "Debe ser un número mayor a " + minimo : "";
};
