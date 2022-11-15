"use strict";
// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");

module.exports = {
	consolidado: async function (datos) {
		// Campos que siempre están
		let errores = {
			nombre: await this.nombreApodo(datos),
			fecha: this.fecha(datos),
		};
		if (datos.repetido) errores.repetidos = cartelDuplicado;
		// Campos exclusivos de 'personajes'
		if (datos.entidad == "personajes") {
			errores.ano = this.ano(datos);
			errores.RCLI = this.RCLI_personaje(datos);
		}
		// Campos exclusivos de 'hechos'
		if (datos.entidad == "hechos") {
			errores.desdeHasta = this.desdeHasta(datos);
			errores.RCLI = this.RCLI_hecho(datos);
		}
		// Completar con 'hay errores'
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	nombre: (datos) => {
		return nombreExpress(datos, "nombre");
	},
	apodo: (datos) => {
		return nombreExpress(datos, "apodo");
	},
	nombreApodo: async function (datos) {
		let mensaje;
		if (!mensaje) mensaje = this.nombre(datos);
		if (!mensaje) mensaje = await nombreCompleto(datos, "nombre");
		if (datos.entidad == "personajes") {
			if (!mensaje) mensaje = this.apodo(datos);
			if (!mensaje) mensaje = await nombreCompleto(datos, "apodo");
		}
		return mensaje;
	},
	fecha: (datos) => {
		let respuesta = "";
		if (datos.desconocida == "false" || !datos.desconocida) {
			if (!datos.mes_id || !datos.dia) respuesta = cartelFechaIncompleta;
			else {
				let mes = datos.mes_id;
				let dia = datos.dia;
				if ((mes == 2 && dia > 29) || ((mes == 4 || mes == 6 || mes == 9 || mes == 11) && dia > 30))
					respuesta = cartelSupera;
			}
		}
		return respuesta;
	},
	ano: (datos) => {
		let respuesta;
		if (!datos.ano) respuesta = comp.inputVacio;
		else {
			let ano = parseInt(datos.ano);
			respuesta =
				typeof ano != "number"
					? "No es un número válido"
					: ano > new Date().getFullYear()
					? "El año no debe superar el año actual"
					: ano < -32768
					? "El año debe ser mayor"
					: "";
		}
		return respuesta;
	},
	desdeHasta: function (variable) {
		// Variables
		let datos = {...variable};
		let mensaje;
		datos.desde = datos.ano;
		// Revisar 'desde'
		if (!mensaje) {
			datos.ano = datos.desde;
			mensaje = this.ano(datos);
			if (mensaje) mensaje += " (año 'desde')";
		}
		// Revisar 'hasta'
		if (!mensaje) {
			datos.ano = datos.hasta;
			mensaje = this.ano(datos);
			if (mensaje) mensaje += " (año 'hasta')";
		}
		// Revisar 'combinados'
		if (!mensaje) {
			let desde = parseInt(datos.desde);
			let hasta = parseInt(datos.hasta);
			if (desde > hasta) mensaje = "El año 'desde' no debe superar al año 'hasta'";
		}
		// Fin
		return mensaje;
	},
	RCLI_personaje: (datos) => {
		let respuesta;
		if (false) {
		}
		// Respuesta
		else if (!datos.categoria_id) respuesta = "Necesitamos saber sobre su relación con la Iglesia";
		else if (!datos.sexo_id) respuesta = "Necesitamos saber el sexo de la persona";
		else if (datos.categoria_id == "VPC") respuesta = "";
		// Respuestas sólo si CFC
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
		else if (!datos.ap_mar) respuesta = "Necesitamos saber si es una aparición mariana";
		else respuesta = "";

		// Fin
		return respuesta;
	},
};

// Variables
const cartelFechaIncompleta = "Falta elegir el mes y/o el día";
const cartelSupera = "El número de día y el mes elegidos son incompatibles";
const cartelDuplicado = "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";

// Funciones
let prefijo = (valor, campo) => {
	return valor.startsWith("San ") ||
		valor.startsWith("Santa ") ||
		valor.startsWith("Santo ") ||
		valor.startsWith("Beato ") ||
		valor.startsWith("Beata ") ||
		valor.startsWith("Ven. ") ||
		valor.startsWith("Venerable ") 
		? "El " + campo + " no debe tener ningún prefijo (San, Santa, Madre, Don, Papa, etc.)."
		: "";
};
let nombreExpress = (datos, campo) => {
	// Variables
	let dato = datos[campo];
	let respuesta=""
	// Validaciones
	if (dato) {
		if (!respuesta) respuesta = comp.castellano.completo(dato);
		if (!respuesta) respuesta = comp.inicial.basico(dato);
		if (!respuesta && campo == "nombre") respuesta = prefijo(dato, campo);
	}
	return respuesta;
};
let nombreCompleto = async function (datos, campo) {
	let respuesta;
	if (!datos[campo]) respuesta = comp.inputVacio;
	if (!respuesta) respuesta = comp.longitud(datos[campo], 4, 30);
	if (!respuesta) {
		let id = await BD_especificas.validarRepetidos([campo], datos);
		if (id) respuesta = comp.cartelRepetido({...datos, id});
	}
	return respuesta;
};
