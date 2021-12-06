// Requires *******************
let BD_varias = require("../BD/varias");

// Objeto literal *************
module.exports = {
	RCLV_consolidado: async function (datos) {
		let errores = {
			nombre: await this.RCLV_nombre(datos),
			fecha: this.RCLV_fecha(datos),
			adicionales: this.RCLV_adicionales(datos),
		};
		if (datos.repetido) errores.duplicados = cartelDuplicado;
		// Completar con 'hay errores'
		errores.hay = hayErrores(errores);
		return errores;
	},

	RCLV_nombre: async (datos) => {
		let {entidad, nombre} = datos;
		return !datos.nombre
			? cartelCampoVacio
			: longitud(datos.nombre, 2, 30)
			? longitud(datos.nombre, 2, 30)
			: castellano(datos.nombre)
			? cartelCastellano
			: (await BD_varias.obtenerELC_id({entidad, campo: "nombre", valor: nombre}))
			? cartelRepetido
			: "";
	},

	RCLV_fecha: (datos) => {
		let error = "";
		if (datos.desconocida == "false" || datos.desconocida == undefined) {
			if (!datos.mes_id || !datos.dia) error = cartelFechaIncompleta;
			if (!error) {
				mes = datos.mes_id;
				dia = datos.dia;
				if (
					(mes == 2 && dia > 29) ||
					((mes == 4 || mes == 6 || mes == 9 || mes == 11) && dia > 30)
				)
					errorFecha = cartelSupera;
			}
		}
		return error;
	},

	RCLV_adicionales: (datos) => {
		if (!datos.pais_id) return "Necesitamos que elijas un país"
		if (!datos.catolico) return "Necesitamos que respondas la segunda pregunta"
		if (datos.catolico == "1") {
			if (!datos.canonizacion) return "Necesitamos que respondas la tercera pregunta"
			if (!datos.vocacion_id) return "Necesitamos que respondas la cuarta pregunta"
		}
		return "";
	},
};

cartelFechaIncompleta = "Falta elegir el mes y/o el día";
cartelCampoVacio = "Necesitamos que completes este campo";
cartelSelectVacio = "Necesitamos que elijas un valor";
cartelRadiobuttonVacio="Necesitamos que elijas una opción";
cartelSupera = "El número de día y el mes elegidos son incompatibles";
cartelRepetido = "Ya tenemos un registro con ese nombre";
cartelCastellano =
	"Sólo se admiten letras del abecedario castellano, y la primera letra debe ser en mayúscula";
cartelDuplicado = "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";

let longitud = (dato, corto, largo) => {
	return dato.length < corto
		? "El nombre debe ser más largo"
		: dato.length > largo
		? "El nombre debe ser más corto"
		: "";
};

let castellano = (dato) => {
	formato = /^[A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑa-z áéíóúüñ'/()\d+-]+$/;
	return !formato.test(dato);
};

let hayErrores = (errores) => {
	resultado = false;
	valores = Object.values(errores);
	for (valor of valores) {
		valor ? (resultado = true) : "";
	}
	return resultado;
};
