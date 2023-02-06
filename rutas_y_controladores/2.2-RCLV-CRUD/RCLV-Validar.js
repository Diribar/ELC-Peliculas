"use strict";
// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	consolidado: async function (datos) {
		// Campos comunes a los 3 RCLV
		let errores = {
			nombre: await this.nombre(datos),
			fecha: this.fecha(datos),
			repetidos: this.repetidos(datos),
		};
		// Sexo
		if (datos.entidad == "personajes") errores.sexo = this.sexo(datos);
		// Época y RCLI
		if (datos.entidad != "valores") {
			errores.epoca = this.epoca[datos.entidad](datos);
			errores.RCLI = this.RCLIC[datos.entidad](datos);
		}
		// ¿Hay errores?
		errores.hay = Object.values(errores).some((n) => !!n);
		// Fin
		return errores;
	},
	// Campos comunes a los 3 RCLV
	nombre: async function (datos) {
		// Funciones
		let mientrasEscribe = (campo) => {
			let prefijo = () => {
				// Variables
				let prefijos = variables.prefijos;
				let respuesta = "";
				// Verificación
				if (campo == "nombre")
					for (let prefijo of prefijos) {
						if (nombre.startsWith(prefijo + " "))
							respuesta =
								"El nombre no debe tener ningún prefijo (San, Santa, Madre, Don, Papa, etc.).";
						break;
					}
				// Fin
				return respuesta;
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
			if (!dato && campo == "nombre") respuesta = variables.inputVacio;
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
		// Descarta los campos que no sean de nombre
		for (let i = campos.length - 1; i >= 0; i--)
			if (!["nombre", "apodo"].includes(campos[i])) campos.splice(i, 1);

		// Validaciones
		let mensaje = "";
		for (let campo of campos) {
			if (!mensaje) mensaje = mientrasEscribe(campo);
			if (!mensaje && entidad) mensaje = await alTerminar(campo);
			if (mensaje) break;
		}
		// Revisa si los nombres son iguales
		if (!mensaje && datos.nombre && datos.nombre == datos.apodo)
			mensaje = "El nombre y el apodo deben ser diferentes";
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
	repetidos: (datos) => {
		return datos.repetidos ? cartelDuplicado : "";
	},
	// Personajes o Hechos
	sexo: (datos) => {
		return !datos.sexo_id ? variables.inputVacio : "";
	},
	epoca: (datos) => {
		// Variables
		let contador = 0;
		let seSalteoUnaEpoca = "Se deben elegir épocas consecutivas";
		let respuesta = "";
		let anoNecesario;
		// Epocas
		if (datos.entidad == "personajes") {
			// Averigua si no fue respondido
			if (!datos.epoca_id) respuesta = "Necesitamos saber la época";
			// Averigua si hace falta el año
			else if (datos.epoca_id == "PST") anoNecesario = true;
		} else if (datos.entidad == "hechos") {
			// Averigua la cantidad de épocas elegidas
			let epocas = variables.epocasHechos;
			let cantEpocas = epocas.length;
			for (let epoca of epocas) if (datos[epoca]) contador++;
			// 1. Averigua si no fue respondido
			if (!contador) respuesta = "Necesitamos saber la época";
			// 2. Averigua si se eligieron 2 y se salteó una
			else if (
				contador == 2 && // Averigua si se eligieron dos
				((datos[epocas[0]] && !datos[epocas[1]]) || // Averigua si se eligió la primera y se salteó la siguiente
					false)
				//(datos[epocas[cantEpocas - 1]] && !datos[epocas[cantEpocas - 2]])) // Averigua si se eligió la última y se salteó la anterior
			)
				respuesta = seSalteoUnaEpoca;
			// 3. Averigua si se eligieron 3 y se salteó una
			else if (
				contador == 3 && // Averigua si se eligieron tres
				datos[epocas[0]] &&
				datos[epocas[cantEpocas - 1]] // Averigua si se eligió primera y la última
			)
				respuesta = seSalteoUnaEpoca;
			// Averigua si hace falta el año
			if (contador == 1 && datos.pst) anoNecesario = true;
		}
		// Año
		if (!respuesta && anoNecesario) {
			let ano = datos.ano;
			respuesta = !ano
				? "Necesitamos saber el año"
				: !/[^\d]/.test(ano)
				? "No es un número válido"
				: parseInt(ano) > new Date().getFullYear()
				? "El año no debe superar al actual"
				: parseInt(ano) < 33 && datos.epoca_id == "PST"
				? "El año debe ser mayor"
				: parseInt(ano) < 100 && datos.pst
				? "El año debe ser mayor"
				: "";
		}
		// Fin
		return respuesta;
	},
	RCLIC: {
		personajes: function (datos) {
			let respuesta = this.ano(datos);
			if (respuesta) return respuesta;
			// Respuesta
			else if (!datos.sexo_id) respuesta = "Necesitamos saber el sexo de la persona";
			else if (!datos.categoria_id) respuesta = "Necesitamos saber sobre su relación con la Iglesia";
			else if (datos.categoria_id == "VPC") respuesta = "";
			// Respuestas sólo si CFC
			else if (!datos.rol_iglesia_id)
				respuesta = "Necesitamos saber el rol de la persona en la Iglesia";
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
		hechos: (datos) => {
			let respuesta = "";
			if (false) return "";
			// Respuestas
			else if (!datos.solo_cfc)
				respuesta = "Necesitamos saber sobre su relación con la historia de la Iglesia";
			else if (!datos.jss) respuesta = "Necesitamos saber si ocurrió durante la vida de Jesús";
			else if (!datos.cnt) respuesta = "Necesitamos saber si ocurrió durante la vida de los Apóstoles";
			else if (!datos.ncn)
				respuesta = "Necesitamos saber si también ocurrió fuera de la vida de los Apóstoles";
			else if (datos.solo_cfc == "1" && !datos.ama)
				respuesta = "Necesitamos saber si es una aparición mariana";

			// Fin
			return respuesta;
		},
	},
};

// Carteles
const cartelFechaIncompleta = "Falta elegir el mes y/o el día";
const cartelSupera = "El número de día y el mes elegidos son incompatibles";
const cartelDuplicado = "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";
