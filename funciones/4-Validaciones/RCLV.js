"use strict";
// Definir variables
const BD_especificas = require("../2-BD/Especificas");
const funciones = require("../3-Procesos/Compartidas");

module.exports = {
	consolidado: async function (datos) {
		// Campos  que siempre están
		let errores = {
			nombre: await this.nombre(datos),
			fecha: this.fecha(datos),
		};
		if (datos.repetido) errores.repetidos = cartelDuplicado;
		// Campos cuando la entidad difiere de 'valores'
		if (datos.entidad != "valores") errores.ano = this.ano(datos);
		// Campos exclusivos de 'personajes'
		if (datos.entidad == "personajes") errores.RCLI = this.RCLI(datos);
		// Completar con 'hay errores'
		errores.hay = hayErrores(errores);
		return errores;
	},

	nombre: async (datos) => {
		let {nombre} = datos;
		let repetido = await BD_especificas.validarRepetidos(["nombre"], datos);
		return !nombre
			? cartelCampoVacio
			: longitud(nombre, 2, 30)
			? longitud(nombre, 2, 30)
			: castellano(nombre)
			? cartelCastellano
			: prefijo(nombre)
			? cartelPrefijo
			: repetido
			? cartelRepetido({entidad: datos.entidad, id: repetido})
			: "";
	},

	fecha: (datos) => {
		let error;
		if (datos.desconocida == "false" || datos.desconocida == undefined) {
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

	RCLI: (datos) => {
		let respuesta = [];
		if (!datos.enProcCan) respuesta.push("Necesitamos que respondas si está en Proceso de Canonización");
		else {
			if (!datos.genero) respuesta.push("Necesitamos que respondas el genero de la persona");
			if (!datos.proceso_canonizacion_id)
				respuesta.push("Necesitamos que respondas sobre el Status del Proceso de Canonización");
			if (!datos.rol_iglesia_id)
				respuesta.push("Necesitamos que respondas el rol de la persona en la Iglesia");
		}
		return respuesta;
	},
};

const cartelFechaIncompleta = "Falta elegir el mes y/o el día";
const cartelCampoVacio = "Necesitamos que completes este campo";
const cartelSupera = "El número de día y el mes elegidos son incompatibles";
const cartelCastellano =
	"Sólo se admiten letras del abecedario castellano, y la primera letra debe ser en mayúscula";
const cartelDuplicado = "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";
const cartelPrefijo = "El nombre no debe tener ningún prefijo (San, Santa, Madre, Don, Papa, etc.).";

let longitud = (dato, corto, largo) => {
	return dato.length < corto
		? "El nombre debe ser más largo"
		: dato.length > largo
		? "El nombre debe ser más corto"
		: "";
};

let castellano = (dato) => {
	let formato = /^[A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑa-z áéíóúüñ'/()\d+-]+$/;
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

let hayErrores = (errores) => {
	let valores = Object.values(errores);
	for (let valor of valores) {
		if (valor) return true;
	}
	return false;
};

let cartelRepetido = (datos) => {
	let prodNombre = funciones.obtenerEntidadNombre(datos.entidad);
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
