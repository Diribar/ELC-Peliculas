"use strict";
// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");

module.exports = {
	consolidado: async function (datos) {
		// Campos  que siempre están
		let errores = {
			nombre: await this.nombreCompleto(datos),
			fecha: this.fecha(datos),
		};
		if (datos.repetido) errores.repetidos = cartelDuplicado;
		// Campos cuando la entidad difiere de 'valores'
		if (datos.entidad != "valores") errores.ano = this.ano(datos);
		// Campos exclusivos de 'personajes'
		if (datos.entidad == "personajes") errores.RCLI = this.RCLI_personaje(datos);
		// Campos exclusivos de 'hechos'
		if (datos.entidad == "hechos") errores.RCLI = this.RCLI_hecho(datos);
		// Completar con 'hay errores'
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	nombreExpress: (datos) => {
		let {nombre} = datos;
		return !nombre
			? ""
			: inicialMayuscula(nombre)
			? cartelMayuscula
			: castellano(nombre)
			? cartelCastellano
			: prefijo(nombre)
			? cartelPrefijo
			: "";
	},
	nombreCompleto: async function (datos) {
		let {nombre} = datos;
		if (nombre) var nombreExpress = this.nombreExpress(datos);
		if (nombre && !nombreExpress) var longitud = validarLongitud(nombre, 4, 30);
		if (nombre && !nombreExpress && !longitud)
			var repetido = (await BD_especificas.validarRepetidos(["nombre"], datos))
				? cartelRepetido({entidad: datos.entidad, id: repetido})
				: "";
		return !nombre
			? cartelCampoVacio
			: nombreExpress
			? nombreExpress
			: longitud
			? longitud
			: repetido
			? repetido
			: "";
	},
	fecha: (datos) => {
		let error = "";
		if (datos.desconocida == "false" || !datos.desconocida) {
			if (!datos.mes_id || !datos.dia) error = cartelFechaIncompleta;
			else {
				let mes = datos.mes_id;
				let dia = datos.dia;
				if ((mes == 2 && dia > 29) || ((mes == 4 || mes == 6 || mes == 9 || mes == 11) && dia > 30))
					error = cartelSupera;
			}
		}
		return error;
	},
	ano: (datos) => {
		let error;
		if (!datos.ano) error = cartelCampoVacio;
		else {
			let ano = parseInt(datos.ano);
			error =
				typeof ano != "number"
					? "No es un número válido"
					: ano > new Date().getFullYear()
					? "El año no debe superar el año actual"
					: ano < -32768
					? "El año debe ser mayor"
					: "";
		}
		return error;
	},
	RCLI_personaje: (datos) => {
		let respuesta;
		if (false) {
		}
		// Respuesta
		else if (!datos.categoria_id) respuesta = "Necesitamos saber sobre su relación con la Iglesia";
		else if (datos.categoria_id == "VPC") respuesta = "";
		// Respuestas sólo si CFC
		else if (!datos.genero) respuesta = "Necesitamos saber el género de la persona";
		else if (!datos.rol_iglesia_id) respuesta = "Necesitamos saber el rol de la persona en la Iglesia";
		else if (!datos.enProcCan) respuesta = "Necesitamos saber si está en Proceso de Canonización";
		else if (datos.enProcCan == "1" && !datos.proceso_id)
			respuesta = "Necesitamos saber el status del Proceso de Canonización";
		else if (!datos.cnt) respuesta = "Necesitamos saber si fue contemporáneo";
		else if (!datos.ap_mar) respuesta = "Necesitamos saber si participó de una Aparición Mariana";
		else if (datos.ap_mar == "1" && !datos.ap_mar_id)
			respuesta = "Necesitamos saber dónde fue la aparición en la que participó";
		else respuesta = "";

		// Fin
		return respuesta;
	},
	RCLI_hecho: (datos) => {
		let respuesta;
		if (false) {
		}
		// Respuestas
		else if (!datos.solo_cfc)
			respuesta = "Necesitamos saber sobre su relación con la historia de la Iglesia";
		else if (datos.solo_cfc == "0") respuesta = "";
		// Respuestas sólo si CFC
		else if (!datos.jss) respuesta = "Necesitamos saber si ocurrió durante la vida de Jesús";
		else if (datos.jss == "0" && !datos.cnt)
			respuesta = "Necesitamos saber si ocurrió durante la vida de los Apóstoles";
		else if ((datos.jss == "1" || datos.cnt == "1") && !datos.exclusivo)
			respuesta = "Necesitamos saber si ocurrió solamente durante su vida";
		else if (datos.jss == "0" && datos.cnt == "0" && !datos.ap_mar)
			respuesta = "Necesitamos saber si es una aparición mariana";
		else respuesta = "";

		// Fin
		return respuesta;
	},
};

// Variables
const cartelFechaIncompleta = "Falta elegir el mes y/o el día";
const cartelCampoVacio = "Necesitamos que completes este campo";
const cartelSupera = "El número de día y el mes elegidos son incompatibles";
const cartelMayuscula = "La primera letra debe ser en mayúscula";
const cartelCastellano = "Sólo se admiten letras del abecedario castellano";
const cartelDuplicado = "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";
const cartelPrefijo = "El nombre no debe tener ningún prefijo (San, Santa, Madre, Don, Papa, etc.).";

// Funciones
let validarLongitud = (dato, corto, largo) => {
	return dato.length < corto
		? "El nombre debe ser más largo"
		: dato.length > largo
		? "El nombre debe ser más corto"
		: "";
};
let inicialMayuscula = (dato) => {
	let formato = /^[A-ZÁÉÍÓÚÜÑ]/;
	return !formato.test(dato);
};
let castellano = (dato) => {
	let formato = /[A-ZÁÉÍÓÚÜÑa-z áéíóúüñ'/()\+-]+$/;
	return !formato.test(dato);
};
let prefijo = (nombre) => {
	return (
		nombre.startsWith("San ") ||
		nombre.startsWith("Santa ") ||
		nombre.startsWith("Santo ") ||
		nombre.startsWith("Beato ") ||
		nombre.startsWith("Beata ") ||
		nombre.startsWith("Ven. ") ||
		nombre.startsWith("Venerable ") ||
		nombre.startsWith("Madre ") ||
		nombre.startsWith("Hna. ") ||
		nombre.startsWith("Hermana ") ||
		nombre.startsWith("Padre ") ||
		nombre.startsWith("Don ") ||
		nombre.startsWith("Doña ") ||
		nombre.startsWith("Papa ")
	);
};
let cartelRepetido = (datos) => {
	let prodNombre = compartidas.obtenerEntidadNombre(datos.entidad);
	return (
		"Este " +
		"<a href='/RCLV/detalle/?entidad=" +
		datos.entidad +
		"&id=" +
		datos.id +
		"' target='_blank'><u><strong>" +
		prodNombre.toLowerCase() +
		"</strong></u></a>" +
		" ya se encuentra en nuestra base de datos"
	);
};
