"use strict";
// Definir variables
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	consolidado: async function (datos) {
		datos = {...datos}; // Es fundamental escribir 'datos' así
		// Campos comunes a los 3 RCLV
		let errores = {nombre: await this.nombre(datos)};

		// Campos de personajes y hechos
		if (datos.entidad == "personajes" || datos.entidad == "hechos") {
			errores.fecha = this.fecha(datos);
			errores.repetidos = this.repetidos(datos);
			errores.epoca = this.epoca(datos);
			errores.RCLI = this["RCLIC_" + datos.entidad](datos);
		}

		// Campos de personajes
		if (datos.entidad == "personajes") errores.sexo = this.sexo(datos);

		// Campos de temas
		if (datos.entidad == "temas") {
			errores.vigencia = this.vigencia(datos);
			errores.descripcion = this.descripcion(datos);
		}

		// ¿Hay errores?
		errores.hay = Object.values(errores).some((n) => !!n);

		// Fin
		return errores;
	},
	// Campos comunes a todos los RCLV
	nombre: async function (datos) {
		// Variables
		let mensaje = "";

		// Obtiene los campos a validar
		let campos = Object.keys(datos);
		for (let i = campos.length - 1; i >= 0; i--) if (!["nombre", "apodo"].includes(campos[i])) campos.splice(i, 1);

		// Validaciones individuales
		for (let campo of campos) {
			if (!mensaje) mensaje = await nombreApodo({datos, campo});
			if (mensaje) break;
		}

		// Revisa si los nombres son iguales
		if (!mensaje && datos.nombre && datos.nombre == datos.apodo) mensaje = "El nombre y el apodo deben ser diferentes";

		// Fin
		return mensaje;
	},
	fecha: (datos) => {
		// Variables
		let respuesta = "";

		// Validaciones para Fecha Definida y Fecha Móvil
		if (datos.tipoFecha != "SF") {
			// Valida que el mes y el día estén respondidos
			if (!datos.mes_id || !datos.dia) respuesta = cartelFaltaElDatoSobre + "el mes y/o el día";
			// Valida si el día supera lo permitido para el mes
			else {
				let mes = datos.mes_id;
				let dia = datos.dia;
				if ((mes == 2 && dia > 29) || ((mes == 4 || mes == 6 || mes == 9 || mes == 11) && dia > 30))
					respuesta = cartelMesDiaIncompatibles;
			}

			// Validaciones para Fecha Movil
			if (!respuesta && datos.tipoFecha == "FM") {
				// Valida si existe un comentario adecuado para la fecha móvil
				if (!datos.comentario_movil) respuesta = cartelCriterioSobre + "la Fecha Móvil";
				const aux = !respuesta ? comp.longitud(datos.comentario_movil, 4, 70) : "";
				if (aux) respuesta = aux.replace("contenido", "comentario sobre la Fecha Móvil");
			}

			// Validaciones para 'epocas_del_ano'
			if (!respuesta && datos.entidad == "epocas_del_ano") {
				// Variables
				const sufijo = "los Días de Duración";
				// Valida la cantidad de días
				if (!respuesta && !datos.dias_de_duracion) respuesta = cartelFaltaElDatoSobre + sufijo;
				if (!respuesta && datos.dias_de_duracion < 2) respuesta = "La cantidad de dias debe ser mayor a dos";

				// Valida el comentario para la cantidad de días
				if (!respuesta) {
					if (!datos.comentario_duracion) respuesta = cartelCriterioSobre + sufijo;
					const aux = !respuesta ? comp.longitud(datos.comentario_duracion, 4, 70) : "";
					if (aux) respuesta = aux.replace("contenido", "comentario sobre " + sufijo);
				}
			}
		}

		// Fin
		return respuesta;
	},
	avatar: (datos) => {
		return comp.validaAvatar(datos);
	},
	prioridad: (datos) => {
		return !datos.prioridad_id ? variables.selectVacio : "";
	},

	// Personajes, Hechos, Temas, Eventos
	repetidos: (datos) => {
		return datos.repetidos ? cartelRegistroDuplicado : "";
	},

	// Personajes y Hechos
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

	// Épocas del año
	vigencia: function (datos) {
		// Obtiene los errores en 'desde' y 'hasta'
		const {desconocida, meses_id, dias} = datos;
		let mensaje;

		// Si tiene fechas de vigencia
		if (!desconocida)
			for (let i = 0; i < meses_id.length; i++) {
				let objeto = {mes_id: meses_id[i], dia: dias[i]};
				mensaje = this.fecha(objeto);
				if (mensaje) break;
			}
		// Si no tiene fechas de vigencia
		else mensaje = "";

		// Fin
		return mensaje;
	},
};

// Carteles
const cartelFaltaElDatoSobre = "Falta el dato sobre ";
const cartelMesDiaIncompatibles = "El número de día y el mes elegidos son incompatibles";
const cartelCriterioSobre = "Necesitamos saber el criterio sobre ";
const cartelRegistroDuplicado = "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";

// Funciones
let nombreApodo = async ({datos, campo}) => {
	// Variables
	const {entidad, ama} = datos;
	const dato = datos[campo];
	const apMar = "Ap. Mar. - ";
	let mensaje = "";

	// Validación solamente para 'nombre'
	if (!dato && campo == "nombre") mensaje = variables.inputVacio;

	// Validaciones cuando existe un dato
	if (!mensaje && dato) {
		// Idioma castellano
		if (!mensaje) mensaje = comp.castellano.completo(dato);
		if (!mensaje) mensaje = comp.inicial.basico(dato);
		if (mensaje && campo == "apodo") mensaje += " (nombre alternativo)";

		// Prefijo y longitud
		if (!mensaje && entidad == "personajes" && campo == "nombre") mensaje = prefijo(dato);
		if (!mensaje) mensaje = comp.longitud(dato, 4, 30);

		// Revisa si es una aparición mariana
		if (!mensaje && ama && !dato.startsWith(apMar)) mensaje = "El nombre debe comenzar con '" + apMar + "'";

		// Nombre repetido
		if (!mensaje) {
			let id = await BD_especificas.validaRepetidos([campo], datos);
			if (id) mensaje = comp.cartelRepetido({...datos, id});
		}
	}

	// Fin
	return mensaje;
};
let prefijo = (nombre) => {
	// Variables
	let prefijos = variables.prefijos;
	let respuesta = "";

	// Verificación
	for (let prefijo of prefijos)
		if (nombre.startsWith(prefijo + " ")) {
			respuesta = "El nombre no debe tener ningún prefijo (ej: " + prefijo + ").";
			break;
		}

	// Fin
	return respuesta;
};
