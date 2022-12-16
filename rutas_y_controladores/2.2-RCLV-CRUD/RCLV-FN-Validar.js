"use strict";
// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");

module.exports = {
	consolidado: async function (datos) {
		// Campos que siempre están
		let errores = {
			nombre: await this.nombre(datos),
			fecha: this.fecha(datos),
		};
		if (datos.repetido) errores.repetidos = cartelDuplicado;
		// Campos exclusivos
		if (datos.entidad != "valores") errores.ano = this.ano(datos);
		if (datos.entidad == "personajes") errores.RCLI = this.RCLI_personaje(datos);
		if (datos.entidad == "hechos") errores.RCLI = this.RCLI_hecho(datos);
		// Completar con 'hay errores'
		errores.hay = Object.values(errores).some((n) => !!n);
		return errores;
	},
	nombre: async function (datos) {
		// Funciones
		let mientrasEscribe = (campo) => {
			let prefijo = () => {
				return nombre.startsWith("San ") ||
					nombre.startsWith("Santa ") ||
					nombre.startsWith("Santo ") ||
					nombre.startsWith("Beato ") ||
					nombre.startsWith("Beata ") ||
					nombre.startsWith("Ven. ") ||
					nombre.startsWith("Venerable ")
					? "El nombre no debe tener ningún prefijo (San, Santa, Madre, Don, Papa, etc.)."
					: "";
			};
			// Variables
			let respuesta = "";
			let dato = datos[campo];
			// Validaciones
			if (dato) {
				if (!respuesta) respuesta = comp.castellano.completo(dato);
				if (!respuesta) respuesta = comp.inicial.basico(dato);
				if (!respuesta && entidad == "personajes" && campo == "nombre") respuesta = prefijo();
			}
			// Fin
			if (respuesta && campo != "nombre") respuesta += " (nombre alternativo)";
			return respuesta;
		};
		let alTerminar = async (campo) => {
			// Variables
			let respuesta = "";
			let dato = datos[campo];
			// Validaciones
			if (!dato && campo == "nombre") respuesta = comp.inputVacio;
			if (dato) {
				if (!respuesta) respuesta = comp.longitud(dato, 4, 30);
				// Nombre repetido
				if (!respuesta) {
					let id = await BD_especificas.validaRepetidos([campo], datos);
					if (id) respuesta = comp.cartelRepetido({...datos, id});
				}
			}
			// Fin
			return respuesta;
		};

		// Variables
		let {entidad, nombre} = datos;
		// Variable 'campos'
		let campos = Object.keys(datos);
		for (let i = campos.length - 1; i >= 0; i--)
			if (!["nombre", "apodo"].includes(campos[i])) campos.splice(i, 1);

		// Validaciones
		let mensaje = "";
		for (let campo of campos) {
			if (!mensaje) mensaje = mientrasEscribe(campo);
			if (!mensaje && entidad) mensaje = await alTerminar(campo);
			if (mensaje && campo == "apodo") mensaje += " (nombre alternativo)";
			if (mensaje) break;
		}

		// Fin
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
		let respuesta = "";
		if (datos.ano) {
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
		// Fin
		return respuesta;
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
		else if (!datos.ama) respuesta = "Necesitamos saber si participó de una Aparición Mariana";
		else if (datos.ama == "1" && !datos.ap_mar_id)
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
		else if (!datos.ama) respuesta = "Necesitamos saber si es una aparición mariana";
		else respuesta = "";

		// Fin
		return respuesta;
	},
};

// Variables
const cartelFechaIncompleta = "Falta elegir el mes y/o el día";
const cartelSupera = "El número de día y el mes elegidos son incompatibles";
const cartelDuplicado = "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";
