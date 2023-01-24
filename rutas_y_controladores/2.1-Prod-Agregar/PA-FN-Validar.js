"use strict";
// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const procesos = require("./PA-FN-Procesos");

module.exports = {
	// ControllerAPI (validaPalabrasClave)
	palabrasClave: (dato) => {
		// Campo palabrasClave
		let errores = {};
		let longitud = dato ? comp.longitud(dato, 3, 50) : "";
		errores.palabrasClave = !dato ? comp.inputVacio : longitud ? longitud : "";
		// Fin
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	// ControllerAPI (validaDatosDuros_input)
	// ControllerVista (DD - Form y Grabar)
	datosDuros: async (campos, datos) => {
		// Definir variables
		let errores = {};
		let cartelMusica = comp.inputVacio + '. Si no tiene música, poné "No tiene música"';
		let cartelActores =
			comp.inputVacio + '. Si no tiene actores (ej. un Documental), poné "No tiene actores"';
		let camposPosibles = [
			{nombre: "nombre_original", idioma: "completo", cartel: comp.inputVacio, corto: 3, largo: 70},
			{
				nombre: "nombre_castellano",
				idioma: "completo",
				cartel: comp.inputVacio,
				corto: 3,
				largo: 70,
			},
			{nombre: "direccion", idioma: "basico", cartel: comp.inputVacio, corto: 3, largo: 100},
			{nombre: "guion", idioma: "basico", cartel: comp.inputVacio, corto: 3, largo: 100},
			{nombre: "musica", idioma: "basico", cartel: cartelMusica, corto: 3, largo: 100},
			{nombre: "produccion", idioma: "completo", cartel: comp.inputVacio, corto: 3, largo: 100},
			{nombre: "actores", idioma: "completo", cartel: cartelActores, corto: 3, largo: 500},
			{nombre: "sinopsis", idioma: "sinopsis", cartel: comp.inputVacio, corto: 11, largo: 1004},
		];
		// ***** CAMPOS INDIVIDUALES ESTÁNDAR *******
		for (let campo of camposPosibles) {
			let nombre = campo.nombre;
			let idioma = campo.idioma;
			if (campos.includes(nombre)) {
				// Variables
				let dato = datos[nombre];
				let respuesta = "";
				// Validaciones
				if (datos[nombre]) {
					if (!respuesta) respuesta = comp.longitud(dato, campo.corto, campo.largo);
					if (!respuesta) respuesta = comp.castellano[idioma](dato);
					if (!respuesta) respuesta = comp.inicial[idioma](dato);
				} else respuesta = comp.inputVacio;
				// Fin
				errores[nombre] = respuesta;
			}
		}
		// ***** CAMPOS INDIVIDUALES PARTICULARES *******
		if (campos.includes("ano_estreno"))
			errores.ano_estreno = !datos.ano_estreno
				? comp.inputVacio
				: formatoAno(datos.ano_estreno)
				? "Debe ser un número de 4 dígitos"
				: datos.ano_estreno < 1900
				? "El año debe ser mayor a 1900"
				: datos.ano_estreno > new Date().getFullYear()
				? "El número no puede superar al año actual"
				: "";
		if (campos.includes("ano_fin"))
			errores.ano_fin = !datos.ano_fin
				? comp.inputVacio
				: formatoAno(datos.ano_fin)
				? "Debe ser un número de 4 dígitos"
				: datos.ano_fin < 1900
				? "El año debe ser mayor a 1900"
				: datos.ano_fin > new Date().getFullYear()
				? "El número no puede superar al año actual"
				: "";
		if (campos.includes("duracion"))
			errores.duracion = !datos.duracion
				? comp.inputVacio
				: formatoNumero(datos.duracion, 20)
				? formatoNumero(datos.duracion, 20)
				: datos.duracion > 300
				? "Debe ser un número menor"
				: "";
		if (campos.includes("paises_id"))
			errores.paises_id = !datos.paises_id
				? comp.inputVacio
				: datos.paises_id.length > 2 * 1 + 3 * 3
				? "Se aceptan hasta 4 países."
				: "";
		if (campos.includes("idioma_original_id"))
			errores.idioma_original_id = !datos.idioma_original_id ? comp.inputVacio : "";
		// Personas
		if (campos.includes("avatar")) errores.avatar = comp.avatar(datos);

		// ***** CAMPOS COMBINADOS *******
		// Año de Estreno y Año Fin
		if (
			datos.ano_estreno &&
			!errores.ano_estreno &&
			datos.ano_fin &&
			!errores.ano_fin &&
			datos.ano_estreno > datos.ano_fin
		) {
			errores.ano_estreno = "El año de estreno debe ser menor o igual que el año de finalización";
		}
		// Nombre Original y Año de Estreno
		if (
			datos.nombre_original &&
			!errores.nombre_original &&
			datos.ano_estreno &&
			!errores.ano_estreno &&
			datos.entidad
		) {
			let id = await BD_especificas.validaRepetidos(["nombre_original", "ano_estreno"], datos);
			if (id) errores.nombre_original = comp.cartelRepetido({...datos, id});
		}
		// Nombre Castellano y Año de Estreno
		if (
			datos.nombre_castellano &&
			!errores.nombre_castellano &&
			datos.ano_estreno &&
			!errores.ano_estreno &&
			datos.entidad
		) {
			let id = await BD_especificas.validaRepetidos(["nombre_castellano", "ano_estreno"], datos);
			if (id) errores.nombre_castellano = comp.cartelRepetido({...datos, id});
		}

		// ***** RESUMEN *******
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	// ControllerAPI (validaDatosPers)
	datosPers: async (campos, datos) => {
		// Definir variables
		let errores = {};
		let camposPosibles = ["cfc", "ocurrio", "musical", "tipo_actuacion_id", "publico_id"];
		// Datos generales + calificación
		for (let campo of camposPosibles)
			if (campos.includes(campo)) errores[campo] = !datos[campo] ? comp.selectVacio : "";

		// RCLV - Combinados
		if (datos.ocurrio) {
			// Variables
			let sinResponder =
				(!datos.personaje_id || datos.personaje_id == 1) && (!datos.hecho_id || datos.hecho_id == 1);
			// Resultado
			errores.RCLV =
				// Acciones para 'no lo voy a responder por ahora'
				datos.sinRCLV
					? ""
					: // Acciones para "ocurrio"
					datos.ocurrio == "1" && sinResponder
					? "Necesitamos que respondas por el Personaje o el Hecho Histórico"
					: // Acciones para "no ocurrió"
					datos.ocurrio == "0" && (!datos.valor_id || datos.valor_id == 1)
					? "Necesitamos que respondas por el Valor"
					: // Acciones si no se cumple ninguna de las anteriores
					  "";
		}
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
		let url = datos.direccion;
		errores.direccion = !url
			? comp.inputVacio
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
			? comp.inputVacio
			: !Object.keys(cantDatosObtenidos).length
			? "No se obtuvo ningún dato"
			: "";
		// Final
		errores.hay = Object.values(errores).some((n) => !!n);
		errores.campos = Object.keys(cantDatosObtenidos).length;
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
	return !formato.test(dato)
		? "Debe ser un número"
		: dato < minimo
		? "Debe ser un número mayor a " + minimo
		: "";
};
