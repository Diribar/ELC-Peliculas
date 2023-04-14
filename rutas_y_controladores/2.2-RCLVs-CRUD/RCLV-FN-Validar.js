"use strict";
// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	consolidado: async function (datos) {
		datos = {...datos}; // Es fundamental escribir 'datos' así
		// Campos comunes a los 3 RCLV
		let errores = {
			nombre: await this.nombre(datos),
			fecha: this.fecha(datos),
			repetidos: this.repetidos(datos),
		};
		// Sexo
		if (datos.entidad == "personajes") errores.sexo = this.sexo(datos);
		// Época y RCLI
		if (datos.entidad != "temas") {
			errores.epoca = this.epoca(datos);
			errores.RCLI = this["RCLIC_" + datos.entidad](datos);
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
							respuesta = "El nombre no debe tener ningún prefijo (San, Santa, Madre, Don, Papa, etc.).";
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
		let {entidad, nombre, ama} = datos;
		// Variable 'campos'
		let campos = Object.keys(datos);
		// Descarta los campos que no sean de nombre
		for (let i = campos.length - 1; i >= 0; i--) if (!["nombre", "apodo"].includes(campos[i])) campos.splice(i, 1);

		// Validaciones
		let mensaje = "";
		for (let campo of campos) {
			if (!mensaje) mensaje = mientrasEscribe(campo);
			if (!mensaje && entidad) mensaje = await alTerminar(campo);
			if (mensaje) break;
		}
		// Revisa si los nombres son iguales
		if (!mensaje && datos.nombre && datos.nombre == datos.apodo) mensaje = "El nombre y el apodo deben ser diferentes";

		// Revisa si es una aparición mariana
		const apMar = "Ap. Mar. - ";
		if (!mensaje && entidad == "hechos" && ama && nombre && !nombre.startsWith(apMar))
			mensaje = "El nombre debe comenzar con '" + apMar + "'";

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
	// Personajes y Hechos
	repetidos: (datos) => {
		return datos.repetidos ? cartelDuplicado : "";
	},
	epoca: (datos) => {
		// Variables
		let respuesta = "";
		let anoNecesario = false;

		// Averigua si no fue respondido
		if (!datos.epoca_id) respuesta = variables.radioVacio;
		// Averigua si hace falta el año
		else if (datos.epoca_id == "pst") anoNecesario = true;

		// Año
		if (!respuesta && anoNecesario) {
			let ano = datos.ano;
			respuesta =
				ano == 0
					? "Necesitamos saber el año"
					: /[^\d]/.test(ano)
					? "No es un número válido"
					: parseInt(ano) > new Date().getFullYear()
					? "El año no debe superar al actual"
					: parseInt(ano) < 100 && datos.epoca_id == "pst"
					? "Ese año no corresponde a la época 'posterior'"
					: "";
		}
		// Fin
		return respuesta;
	},
	// Personajes
	sexo: (datos) => {
		return !datos.sexo_id ? variables.radioVacio : "";
	},
	RCLIC_personajes: (datos) => {
		if (datos.ano) datos.ano = parseInt(datos.ano);
		let respuesta = !datos.categoria_id
			? "Necesitamos saber sobre su relación con la Iglesia"
			: datos.categoria_id == "CFC"
			? !datos.sexo_id
				? "Estamos a la espera de que nos informes el sexo"
				: !datos.rol_iglesia_id
				? "Necesitamos saber el rol de la persona en la Iglesia"
				: !datos.canon_id
				? "Necesitamos saber si está en proceso de canonización, y en caso afirmativo su status actual"
				: datos.epoca_id == "pst" && datos.ano && datos.ano > 1100 && !datos.ap_mar_id
				? "Necesitamos saber si participó en una Aparición Mariana, y en caso afirmativo en cuál"
				: ""
			: datos.categoria_id != "VPC"
			? "No reconocemos la opción elegida"
			: "";
		// Fin
		return respuesta;
	},
	// Hechos
	RCLIC_hechos: (datos) => {
		if (datos.ano) datos.ano = parseInt(datos.ano);
		let respuesta = !datos.solo_cfc
			? "Necesitamos saber sobre su relación con la historia de la Iglesia"
			: datos.solo_cfc == "1"
			? datos.epoca_id == "pst" && datos.ano && datos.ano > 1100 && !datos.ama
				? "Necesitamos saber si es una aparición mariana"
				: ""
			: datos.solo_cfc != "0"
			? "No reconocemos la opción elegida"
			: "";
		// Fin
		return respuesta;
	},
	// Valores

};

// Carteles
const cartelFechaIncompleta = "Falta elegir el mes y/o el día";
const cartelSupera = "El número de día y el mes elegidos son incompatibles";
const cartelDuplicado = "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";
