"use strict";
// Variables
const procesos = require("./PA-FN4-Procesos");

module.exports = {
	// ControllerAPI (validaPalabrasClave)
	palabrasClave: (dato) => {
		// Campo palabrasClave
		let errores = {};
		let longitud = dato ? comp.validacs.longitud(dato, 3, 55) : "";
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
		const cartelMusica = variables.inputVacio + '. Si no tiene música, poné "Desconocido"';
		const cartelActores = variables.inputVacio + '. Si no conseguís información, poné "Desconocido"';
		const camposPosibles = [
			{nombre: "nombreCastellano", tipoIdioma: "completo", cartel: variables.inputVacio, corto: 3, largo: 70},
			{nombre: "nombreOriginal", tipoIdioma: "completo", cartel: variables.inputVacio, corto: 3, largo: 70},
			{nombre: "direccion", tipoIdioma: "basico", cartel: variables.inputVacio, corto: 3, largo: 100},
			{nombre: "guion", tipoIdioma: "basico", cartel: variables.inputVacio, corto: 3, largo: 100},
			{nombre: "musica", tipoIdioma: "basico", cartel: cartelMusica, corto: 3, largo: 100},
			{nombre: "produccion", tipoIdioma: "completo", cartel: variables.inputVacio, corto: 3, largo: 100},
			{nombre: "actores", tipoIdioma: "completo", cartel: cartelActores, corto: 3, largo: 500},
			{nombre: "sinopsis", tipoIdioma: "completo", cartel: variables.inputVacio, corto: 11, largo: 1004},
		];
		// Campos individuales estándar
		for (let campo of camposPosibles) {
			const nombre = campo.nombre;
			const tipoIdioma = campo.tipoIdioma;
			if (campos.includes(nombre)) {
				// Variables
				const dato = datos[nombre];
				let respuesta = "";
				// Validaciones
				if (datos[nombre]) {
					if (!respuesta) respuesta = comp.validacs.longitud(dato, campo.corto, campo.largo);
					if (!respuesta) respuesta = comp.validacs.castellano[tipoIdioma](dato);
					if (!respuesta) respuesta = comp.validacs.inicial[tipoIdioma](dato);
				} else respuesta = datos.entidad != "capitulos" ? variables.inputVacio : "";

				// Fin
				errores[nombre] = respuesta;
			}
		}

		// ***** CAMPOS INDIVIDUALES PARTICULARES *******
		if (campos.includes("anoEstreno"))
			errores.anoEstreno = !datos.anoEstreno
				? datos.entidad != "capitulos"
					? variables.inputVacio
					: ""
				: formatoAno(datos.anoEstreno)
				? "Debe ser un número de 4 dígitos"
				: datos.anoEstreno < 1900
				? "El año debe ser mayor a 1900"
				: datos.anoEstreno > new Date().getFullYear()
				? "El número no puede superar al año actual"
				: "";
		if (campos.includes("anoFin"))
			errores.anoFin = !datos.anoFin
				? datos.entidad != "capitulos"
					? variables.inputVacio
					: ""
				: formatoAno(datos.anoFin)
				? "Debe ser un número de 4 dígitos"
				: datos.anoFin < 1900
				? "El año debe ser mayor a 1900"
				: datos.anoFin > new Date().getFullYear()
				? "El número no puede superar al año actual"
				: "";
		if (campos.includes("duracion"))
			errores.duracion = !datos.duracion
				? datos.entidad != "capitulos"
					? variables.inputVacio
					: ""
				: formatoNumero(datos.duracion, 20)
				? formatoNumero(datos.duracion, 20)
				: datos.duracion > 300
				? "Debe ser un número menor"
				: "";
		if (campos.includes("paises_id"))
			errores.paises_id = !datos.paises_id
				? datos.entidad != "capitulos"
					? variables.inputVacio
					: ""
				: datos.paises_id.length > 2 * 1 + 3 * 4
				? "Se aceptan hasta 4 países."
				: "";
		if (campos.includes("idiomaOriginal_id"))
			errores.idiomaOriginal_id = !datos.idiomaOriginal_id && datos.entidad != "capitulos" ? variables.inputVacio : "";

		// Personas
		if (campos.includes("avatar"))
			errores.avatar = datos.avatar || datos.entidad != "capitulos" ? comp.validacs.avatar(datos) : "";

		// ***** CAMPOS COMBINADOS *******
		// Año de Estreno y Año Fin
		if (datos.anoEstreno && !errores.anoEstreno && datos.anoFin && !errores.anoFin && datos.anoEstreno > datos.anoFin) {
			errores.anoEstreno = "El año de estreno debe ser menor o igual que el año de finalización";
		}
		// Nombre Original y Año de Estreno
		if (datos.nombreOriginal && !errores.nombreOriginal && datos.anoEstreno && !errores.anoEstreno && datos.entidad) {
			let id = await BD_especificas.validaRepetidos(["nombreOriginal", "anoEstreno"], datos);
			if (id) errores.nombreOriginal = comp.validacs.cartelRepetido({...datos, id});
		}
		// Nombre Castellano y Año de Estreno
		if (datos.nombreCastellano && !errores.nombreCastellano && datos.anoEstreno && !errores.anoEstreno && datos.entidad) {
			let id = await BD_especificas.validaRepetidos(["nombreCastellano", "anoEstreno"], datos);
			if (id) errores.nombreCastellano = comp.validacs.cartelRepetido({...datos, id});
		}
		// Actores y Tipo de Actuación
		if (datos.tipoActuacion_id && !errores.actores) {
			errores.actores =
				datos.tipoActuacion_id == anime_id && datos.actores != "Dibujos Animados"
					? 'Debe decir "Dibujos Animados"'
					: datos.tipoActuacion_id == documental_id && datos.actores != "Documental"
					? 'Debe decir "Documental"'
					: datos.tipoActuacion_id == actuada_id && ["Dibujos Animados", "Documental"].includes(datos.actores)
					? "Deben figurar los nombres de los actores y actrices"
					: "";
		}

		// ***** RESUMEN *******
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	// ControllerAPI (validaDatosAdics)
	datosAdics: (campos, datos) => {
		// Definir variables
		let errores = {};
		let camposPosibles = ["cfc", "bhr", "musical", "color", "tipoActuacion_id"];
		// Datos generales
		for (let campo of camposPosibles)
			if (campos.includes(campo))
				errores[campo] =
					!datos[campo] && datos[campo] !== false && datos.entidad != "capitulos" ? variables.inputVacio : ""; // Se usa 'false', para distinguir cuando el valor esté contestado de cuando no

		// RCLVs
		const rclvs_id = [...variables.entidades.rclvs_id, "sinRCLV"];
		if (campos.some((n) => rclvs_id.includes(n)))
			errores.RCLV =
				datos.entidad != "capitulos" && // no es un capítulo
				rclvs_id.every((n) => !datos[n] || datos[n] == 1) // ningún campo tiene un valor distinto de 1
					? "Necesitamos que respondas alguna de las opciones"
					: "";

		// Consolida la información
		errores.hay = Object.values(errores).some((n) => !!n);

		// Fin
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
		// Variables
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
		errores.avatarUrl = !datos.avatarUrl
			? "Necesitamos que agregues una imagen"
			: !datos.avatarUrl.includes("pics.filmaffinity.com/")
			? "No parece ser una imagen de FilmAffinity"
			: !datos.avatarUrl.includes("large.jpg")
			? "Necesitamos que consigas el link de la imagen grande"
			: "";

		// Contenido
		let contenido = datos.contenido ? procesos.FA.contenidoFA(datos.contenido) : {};
		errores.contenido = !datos.contenido
			? variables.inputVacio
			: !Object.keys(contenido).length
			? "No se obtuvo ningún dato"
			: "";

		// Ajustes finales
		errores.hay = Object.values(errores).some((n) => !!n);
		errores.campos = Object.keys(contenido).length;

		// Final
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
