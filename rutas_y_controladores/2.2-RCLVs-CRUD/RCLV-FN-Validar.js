"use strict";

module.exports = {
	consolidado: async function (datos) {
		datos = {...datos}; // Es fundamental escribir 'datos' así
		// Campos comunes a los 3 RCLV
		let errores = {
			nombre: await this.nombre(datos),
			fecha: this.fecha(datos),
			avatar: this.avatar(datos),
			prioridad: this.prioridad(datos),
		};

		// Campos de todos menos 'epocasDelAno'
		if (datos.entidad != "epocasDelAno") errores.repetidos = this.repetidos(datos);

		// Campos de personajes y hechos
		if (datos.entidad == "personajes" || datos.entidad == "hechos") errores.epocaOcurrencia = this.epocaOcurrencia(datos);

		// Campos de personajes
		if (datos.entidad == "personajes") {
			errores.sexo = this.sexo(datos);
			errores.RCLIC = this.RCLIC_personajes(datos);
		}

		// Campos de hechos
		if (datos.entidad == "hechos") errores.RCLIC = this.RCLIC_hechos(datos);

		// Épocas del año
		if (datos.entidad == "epocasDelAno") errores.carpetaAvatars = this.carpetaAvatars(datos);

		// ¿Hay errores?
		errores.hay = Object.values(errores).some((n) => !!n);

		// Fin
		return errores;
	},
	// Campos comunes a todos los RCLV
	avatar: (datos) => {
		return comp.validacs.avatar(datos);
	},
	nombre: async (datos) => {
		// Variables
		let mensaje = "";

		// Obtiene los campos a validar
		let campos = Object.keys(datos).filter((n) => ["nombre", "apodo"].includes(n));

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

		// Validaciones para Fecha Fija y Fecha Móvil
		if (datos.tipoFecha != "SF") {
			// Valida que el mes y el día estén respondidos
			if (!datos.mes_id || !datos.dia) respuesta = cartelFaltaElDatoSobre + "el mes y/o el día";
			// Valida si el día supera lo permitido para el mes
			else {
				// Variables
				const mes = datos.mes_id;
				const dia = datos.dia;

				// Validaciones
				if (!Number(mes) || Number(mes) < 1) respuesta = cartelMesDiaIncompatibles;
				else if (!Number(dia) || Number(dia) < 1) respuesta = cartelMesDiaIncompatibles;
				else if ((mes == 2 && dia > 29) || ([4, 6, 9, 11].includes(mes) && dia > 30))
					respuesta = cartelMesDiaIncompatibles;
			}

			// Validaciones para Fecha Movil
			if (!respuesta && datos.tipoFecha == "FM") {
				// Valida el añoFM
				const anoFM = datos.anoFM;
				const fechaDelAno_id = fechasDelAno.find((n) => n.dia == datos.dia && n.mes_id == datos.mes_id).id;
				respuesta =
					!anoFM || !Number(anoFM) || Number(anoFM) < anoHoy || Number(anoFM) > anoHoy + 1
						? cartelAnoIncorrecto
						: anoFM == anoHoy && fechaDelAno_id < fechaDelAnoHoy_id
						? cartelAnoProximo
						: anoFM > anoHoy && fechaDelAno_id >= fechaDelAnoHoy_id
						? cartelAnoActual
						: "";

				// Valida si existe un comentario adecuado para la fecha móvil
				if (!respuesta && !datos.comentarioMovil) respuesta = cartelCriterioSobre + "la Fecha Móvil";
				if (!respuesta) {
					const aux = comp.validacs.longitud(datos.comentarioMovil, 4, 70);
					if (aux) respuesta = aux.replace("contenido", "comentario sobre la Fecha Móvil");
				}
			}

			// Validaciones para 'epocasDelAno'
			if (!respuesta && datos.entidad == "epocasDelAno") {
				// Variables
				const sufijo = "los Días de Duración";
				// Valida la cantidad de días
				if (!respuesta && !datos.diasDeDuracion) respuesta = cartelFaltaElDatoSobre + sufijo;
				if (!respuesta && datos.diasDeDuracion < 2) respuesta = "La cantidad de dias debe ser mayor a dos";

				// Valida el comentario para la cantidad de días
				if (!respuesta) {
					if (!datos.comentarioDuracion) respuesta = cartelCriterioSobre + sufijo;
					const aux = !respuesta ? comp.validacs.longitud(datos.comentarioDuracion, 4, 70) : "";
					if (aux) respuesta = aux.replace("contenido", "comentario sobre " + sufijo);
				}
			}
		}

		// Fin
		return respuesta;
	},
	prioridad: (datos) => {
		return !datos.prioridad_id && datos.revisorPERL ? variables.selectVacio : "";
	},

	// Entidades distintas a 'epocasDelAno'
	repetidos: (datos) => {
		return datos.repetidos ? cartelRegistroDuplicado : "";
	},

	// Personajes y Hechos
	epocaOcurrencia: (datos) => {
		// Variables
		let respuesta = "";
		let anoNecesario = false;

		// Averigua si no fue respondido
		if (!datos.epocaOcurrencia_id) respuesta = variables.radioVacio;
		// Averigua si hace falta el año
		else if (datos.epocaOcurrencia_id == "pst") anoNecesario = true;

		// Año
		if (!respuesta && anoNecesario) {
			let ano = datos.anoNacim ? datos.anoNacim : datos.anoComienzo ? datos.anoComienzo : null;
			respuesta =
				ano == 0 || !ano
					? "Necesitamos saber el año"
					: /[^\d]/.test(ano)
					? "No es un número válido"
					: parseInt(ano) > new Date().getFullYear()
					? "El año no debe superar al actual"
					: parseInt(ano) <= 33 && datos.epocaOcurrencia_id == "pst"
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
		if (datos.anoNacim) datos.anoNacim = parseInt(datos.anoNacim);
		let respuesta = !datos.categoria_id
			? "Necesitamos saber sobre su relación con la Iglesia"
			: datos.categoria_id == "CFC"
			? !datos.sexo_id
				? "Estamos a la espera de que nos informes el sexo"
				: !datos.rolIglesia_id
				? "Necesitamos saber el rol de la persona en la Iglesia"
				: !datos.canon_id
				? "Necesitamos saber si está en proceso de canonización, y en caso afirmativo su status actual"
				: datos.epocaOcurrencia_id == "pst" && datos.anoNacim && datos.anoNacim > 1100 && !datos.apMar_id
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
		if (datos.anoComienzo) datos.anoComienzo = parseInt(datos.anoComienzo);
		let respuesta = !datos.soloCfc
			? "Necesitamos saber sobre su relación con la historia de la Iglesia"
			: datos.soloCfc == "1"
			? datos.epocaOcurrencia_id == "pst" && datos.anoComienzo && datos.anoComienzo > 1100 && !datos.ama
				? "Necesitamos saber si es una aparición mariana"
				: ""
			: datos.soloCfc != "0"
			? "No reconocemos la opción elegida"
			: "";
		// Fin
		return respuesta;
	},

	// Épocas del año
	carpetaAvatars: (datos) => {
		return !datos.carpetaAvatars ? variables.selectVacio : "";
	},
};

// Carteles
const cartelFaltaElDatoSobre = "Falta el dato sobre ";
const cartelMesDiaIncompatibles = "El número de día y el mes elegidos son incompatibles";
const cartelAnoIncorrecto = "El año debe ser el actual o el próximo";
const cartelAnoActual = "El año debe ser el actual";
const cartelAnoProximo = "El año debe ser el próximo";
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
		if (!mensaje) mensaje = comp.validacs.castellano.completo(dato);
		if (!mensaje) mensaje = comp.validacs.inicial.basico(dato);
		if (mensaje && campo == "apodo") mensaje += " (nombre alternativo)";

		// Prefijo y longitud
		if (!mensaje && entidad == "personajes" && campo == "nombre") mensaje = prefijo(dato);
		if (!mensaje) mensaje = comp.validacs.longitud(dato, 4, 35);

		// Revisa si es una aparición mariana
		if (!mensaje && ama == 1 && !dato.startsWith(apMar)) mensaje = "El nombre debe comenzar con '" + apMar + "'";

		// Nombre repetido
		if (!mensaje) {
			let id = await BD_especificas.validaRepetidos([campo], datos);
			if (id) mensaje = comp.validacs.cartelRepetido({...datos, id});
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
